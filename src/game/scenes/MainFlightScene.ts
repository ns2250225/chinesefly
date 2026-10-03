import Phaser from 'phaser'
import { store, bus, setHold, clearHold, showBanner, pushToast, persist, vibrate } from '../../store/gameStore'
import { FlightSystem } from '../systems/FlightSystem'
import { ZoneSystem } from '../systems/ZoneSystem'
import { ChunkSystem } from '../systems/ChunkSystem'
import { EventSystem } from '../systems/EventSystem'
import { AchievementSystem } from '../systems/AchievementSystem'
import { SetPieceSystem } from '../systems/SetPieceSystem'
import { audio } from '../systems/AudioSystem'
import { formatAltitude, formatSpeed, isLightspeed } from '../systems/format'
import { Player } from '../entities/Player'
import type { BackgroundObject } from '../entities/BackgroundObject'
import type { EventObject } from '../entities/EventObject'
import { ZONES } from '../config/zones'

type Q = 'high' | 'medium' | 'low'
const QUALITY: Record<Q, { density: number; particles: number; lines: number; shake: boolean }> = {
  high: { density: 1, particles: 1, lines: 1, shake: true },
  medium: { density: 0.75, particles: 0.6, lines: 0.6, shake: true },
  low: { density: 0.5, particles: 0.3, lines: 0.3, shake: false },
}

interface Line {
  img: Phaser.GameObjects.Image
  vy: number
}

export class MainFlightScene extends Phaser.Scene {
  private W = 0
  private H = 0
  private S = 3
  private playerY = 0
  private phase: 'title' | 'ready' | 'flying' = 'title'
  private flight!: FlightSystem
  private zones!: ZoneSystem
  private chunks!: ChunkSystem
  private evts!: EventSystem
  private ach!: AchievementSystem
  private sets!: SetPieceSystem
  private player!: Player
  private lines: Line[] = []
  private lineAcc = 0
  private zoneIdx = 0
  private flags = new Set<string>()
  private hudAcc = 0
  private saveAcc = 0
  private bumpCooldown = 0
  private speedLogSmooth = -Infinity
  private lastLevel = 0
  private fpsSamples: number[] = []
  private fpsAcc = 0
  private runTime = 0
  private fxAcc = 0
  private glitchSeed = 0
  private unsub: (() => void)[] = []

  constructor() {
    super('Main')
  }

  create(data: { autoReady?: boolean }) {
    const st = store.settings
    const seed = st.fixedSeed ? st.seed : Math.floor(Math.random() * 999999)
    store.run.seed = seed
    store.run.maxDistance = 0
    store.run.maxAltText = '0 m'
    store.run.maxZone = 0
    store.run.maxZoneName = ZONES[0].name
    this.flags = new Set()
    this.lines = []
    this.zoneIdx = 0
    this.runTime = 0
    this.speedLogSmooth = -Infinity
    this.lastLevel = 0
    this.fpsSamples = []
    this.applyQuality()

    this.layout()
    this.flight = new FlightSystem()
    this.zones = new ZoneSystem(seed)
    this.sets = new SetPieceSystem(this, this.zones)
    this.sets.resize(this.W, this.H)
    this.chunks = new ChunkSystem(this, this.zones, seed)
    this.evts = new EventSystem(this)
    this.ach = new AchievementSystem()
    this.player = new Player(this, this.W / 2, this.playerY, this.S)
    this.sets.buildGround(this.W, this.playerY + this.player.displayHeight * 0.47, this.S)
    this.sets.onMilkyDot = () => pushToast({ kind: 'joke', text: '银河系都变成了一个小点' })

    this.phase = data?.autoReady ? 'ready' : 'title'
    store.phase = this.phase
    this.writeHud()

    // 键盘：Space / ↑ 长按飞行，Esc / P 暂停
    const kb = this.input.keyboard!
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        if (this.phase === 'title') bus.emit('start')
        else setHold('key', true)
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        bus.emit(store.phase === 'paused' ? 'resume' : 'pause')
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') setHold('key', false)
    }
    kb.on('keydown', down)
    kb.on('keyup', up)
    // 触屏/鼠标：在画面任意位置按住也可飞行
    this.input.on('pointerdown', () => {
      if (this.phase !== 'title') setHold('pointer', true)
    })
    const pUp = () => setHold('pointer', false)
    this.input.on('pointerup', pUp)
    this.input.on('pointerupoutside', pUp)

    const on = (ev: string, fn: (...a: any[]) => void) => {
      bus.on(ev, fn)
      this.unsub.push(() => bus.off(ev, fn))
    }
    on('start', () => this.toReady())
    on('pause', () => this.pauseGame())
    on('resume', () => this.resumeGame())
    on('restart', () => this.restartGame())
    on('quality', () => this.applyQuality())
    // 开发调试：直接跳到指定距离
    if (import.meta.env.DEV)
      on('debug', (d: number) => {
        this.flight.distance = d
        this.flight.airborne = true
        this.phase = 'flying'
        store.phase = 'flying'
      })
    const vis = () => {
      if (document.hidden && (this.phase === 'flying' || this.phase === 'ready')) bus.emit('pause')
    }
    document.addEventListener('visibilitychange', vis)
    this.unsub.push(() => document.removeEventListener('visibilitychange', vis))
    const blur = () => clearHold()
    window.addEventListener('blur', blur)
    this.unsub.push(() => window.removeEventListener('blur', blur))

    this.scale.on('resize', this.onResize, this)
    this.events.once('shutdown', () => {
      this.unsub.forEach((f) => f())
      this.unsub = []
      this.scale.off('resize', this.onResize, this)
      clearHold()
    })
  }

  private layout() {
    this.W = this.scale.width
    this.H = this.scale.height
    this.S = this.W < 520 || this.H < 560 ? 2 : 3
    this.playerY = Math.round(this.H * 0.6)
  }

  private onResize() {
    const oldS = this.S
    this.layout()
    this.sets.resize(this.W, this.H)
    this.player.baseX = this.W / 2
    this.player.baseY = this.playerY
    if (oldS !== this.S) {
      this.player.S = this.S
      this.player.setScale(this.S)
    }
    if (this.phase !== 'flying') this.sets.buildGround(this.W, this.playerY + this.player.displayHeight * 0.47, this.S)
  }

  private applyQuality() {
    const q = store.settings.quality
    if (q !== 'auto') store.effectiveQuality = q
  }

  private get q() {
    return QUALITY[store.effectiveQuality]
  }

  private toReady() {
    if (this.phase !== 'title') return
    this.phase = 'ready'
    store.phase = 'ready'
  }

  private takeoff() {
    this.phase = 'flying'
    store.phase = 'flying'
    store.records.totalFlights++
    audio.sfx('takeoff')
    this.player.dust()
    this.player.takeoffKick()
    this.sets.scarePigeons()
    if (this.q.shake) this.cameras.main.shake(180, 0.004)
    vibrate(40)
  }

  private prevPhase: 'title' | 'ready' | 'flying' = 'flying'
  private pauseGame() {
    if (store.phase === 'paused' || this.phase === 'title') return
    this.prevPhase = this.phase
    clearHold()
    store.phase = 'paused'
    audio.jet(0)
    audio.suspend()
    this.scene.launch('Pause')
    this.scene.pause()
  }

  private resumeGame() {
    if (store.phase !== 'paused') return
    audio.resume()
    this.scene.stop('Pause')
    this.scene.resume()
    store.phase = this.prevPhase
  }

  private restartGame() {
    this.saveRecords()
    audio.resume()
    audio.jet(0)
    this.scene.stop('Pause')
    this.scene.stop('Start')
    this.scene.restart({ autoReady: true })
  }

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.05)
    this.runTime += dt
    const f = this.flight

    if (this.phase === 'ready' && store.holding) this.takeoff()
    if (this.phase === 'flying') {
      f.holding = store.holding
      f.update(dt)
    }
    const scroll = this.phase === 'flying' ? f.v * dt : 0
    // 高速时压缩物体的屏幕滚动速度，让景物停留更久、看得清
    const vis = f.v > 1400 ? scroll * ((1400 + (f.v - 1400) * 0.35) / f.v) : scroll
    const q = this.q
    const zone = this.zones.zone(this.zones.indexAt(f.distance))

    this.sets.update(dt, scroll, f.distance, this.W, this.H, this.S, store.effectiveQuality)
    this.chunks.update(dt, vis, f.distance, {
      w: this.W,
      h: this.H,
      playerY: this.playerY,
      S: this.S,
      density: q.density,
      quality: store.effectiveQuality,
    })
    if (this.phase === 'flying')
      this.evts.update(dt, vis, f.v, zone, this.W, this.H, this.player.x, this.playerY, this.S)

    const level = f.holding ? f.holdLevel : 0
    this.player.update2(dt, {
      phase: this.phase,
      holding: this.phase === 'flying' && f.holding,
      holdTime: f.holdTime,
      holdLevel: level,
      v: f.v,
      inSpace: zone.index >= 4,
      particleFactor: q.particles,
    })

    // 区域切换
    if (zone.index !== this.zoneIdx) this.enterZone(zone.index, this.zoneIdx)

    // 速度
    const sl = this.zones.speedLog(f.distance, f.v)
    this.speedLogSmooth = isFinite(this.speedLogSmooth) && isFinite(sl) ? this.speedLogSmooth + (sl - this.speedLogSmooth) * Math.min(1, dt * 4) : sl
    if (!this.flags.has('lightspeed') && isLightspeed(sl)) this.lightspeed()
    const warp = this.flags.has('lightspeed') && f.holding && isLightspeed(sl)

    this.updateLines(dt, f.v, level, warp, zone.index >= 4)
    this.collisions(dt)
    this.themeFx(dt, zone.themeId)

    // 长按反馈层级
    store.holdLevel = level
    if (level > this.lastLevel) {
      vibrate(level >= 5 ? [40, 40, 60] : 30)
      if (level === 5) {
        pushToast({ kind: 'info', text: '🔥 爆发态！' })
        if (q.shake) this.cameras.main.shake(250, 0.006)
      }
    }
    this.lastLevel = level
    audio.jet(this.phase === 'flying' ? (f.holding ? 0.35 + 0.65 * Math.min(1, f.holdTime / 30) : 0.06) : 0)

    // 成就
    const altLog = this.zones.altitudeLog(f.distance)
    if (this.sets.earthFull) this.flags.add('earthFull')
    this.ach.update(dt, {
      airborne: f.airborne,
      altLog,
      zoneIndex: zone.index,
      flightTime: f.flightTime,
      holdTime: f.holdTime,
      flags: this.flags,
    })

    this.hudAcc += dt
    if (this.hudAcc > 0.1) {
      this.hudAcc = 0
      this.writeHud()
    }
    this.saveAcc += dt
    if (this.saveAcc > 3) {
      this.saveAcc = 0
      this.saveRecords()
    }
    this.monitorFps(dt)
  }

  private enterZone(idx: number, prev: number) {
    this.zoneIdx = idx
    const z = this.zones.zone(idx)
    if (idx < prev) return
    showBanner(idx + 1, z.name)
    audio.sfx('zone')
    if (idx === 3) {
      // 突破云层
      this.cameras.main.flash(500, 255, 255, 255)
      audio.sfx('cloud')
      pushToast({ kind: 'joke', text: '☁️ 突破云层！' })
    } else if (idx === 4) {
      this.cameras.main.flash(400, 120, 160, 255)
    } else if (idx === ZONES.length) {
      this.cameras.main.flash(900, 255, 255, 255)
      if (this.q.shake) this.cameras.main.shake(600, 0.01)
      pushToast({ kind: 'joke', text: '已飞出可观测宇宙，前方是开发者都没去过的地方' }, 4000)
    } else {
      const c = Phaser.Display.Color.IntegerToRGB(z.sky[1])
      this.cameras.main.flash(260, c.r, c.g, c.b)
    }
    if (z.jokes.length && idx !== 3) this.time.delayedCall(1400, () => pushToast({ kind: 'joke', text: z.jokes[0] }))
  }

  private lightspeed() {
    this.flags.add('lightspeed')
    audio.sfx('lightspeed')
    this.cameras.main.flash(700, 180, 220, 255)
    if (this.q.shake) this.cameras.main.shake(900, 0.012)
    pushToast({ kind: 'info', text: '⚡ 突破光速！' }, 3200)
    vibrate([60, 40, 120])
  }

  private updateLines(dt: number, v: number, level: number, warp: boolean, space: boolean) {
    let rate = 0
    if (this.phase === 'flying' && v > 500) {
      rate = level >= 2 ? 26 : level >= 1 ? 8 : v > 1500 ? 4 : 0
      if (warp) rate = 55
    }
    rate *= this.q.lines
    this.lineAcc += rate * dt
    while (this.lineAcc >= 1) {
      this.lineAcc--
      const img = this.add.image(Math.random() * this.W, -60, 'line').setDepth(18)
      const len = (warp ? 4 : 1.5) * (0.6 + Math.random()) * Math.min(1.6, v / 1500)
      img.setScale(this.S * 0.6, this.S * len * 2)
      img.setAlpha(0.25 + Math.random() * 0.45)
      img.setFlipY(true)
      if (warp) img.setTint([0xbfe8ff, 0xd8b8ff, 0xffffff][Math.floor(Math.random() * 3)]).setBlendMode(Phaser.BlendModes.ADD)
      else if (space) img.setTint(0xcfe6ff)
      this.lines.push({ img, vy: Math.min(3600, v * 1.6) * (0.8 + Math.random() * 0.5) })
    }
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const l = this.lines[i]
      l.img.y += l.vy * dt
      if (l.img.y - l.img.displayHeight > this.H) {
        l.img.destroy()
        this.lines.splice(i, 1)
      }
    }
  }

  private collisions(dt: number) {
    if (this.phase !== 'flying') return
    this.bumpCooldown -= dt
    if (this.bumpCooldown > 0) return
    const p = this.player
    const pw = p.displayWidth * 0.45
    const ph = p.displayHeight * 0.6
    const test = (o: BackgroundObject | EventObject) => {
      if (Math.abs(o.y - p.y) > (ph + o.displayHeight) / 2) return false
      if (Math.abs(o.x - p.x) > (pw + o.displayWidth) / 2) return false
      return true
    }
    let hit: BackgroundObject | EventObject | null = null
    this.chunks.forEachBump((o) => {
      if (!hit && test(o)) hit = o
    })
    if (!hit) for (const o of this.evts.live) if (o.bump && !o.hitDone && test(o)) hit = o
    if (!hit) return
    const o = hit as BackgroundObject | EventObject
    o.hitDone = true
    const dir = o.x < p.x ? -1 : 1
    if ('spin' in o) {
      o.vx = dir * 420
      o.spin = dir * 8
    } else {
      o.vx = dir * 420
      o.motion = 'cross'
    }
    this.bumpCooldown = 1.6
    this.player.hit()
    this.flight.bump()
    this.flags.add('bump')
    audio.sfx('bump')
    vibrate(60)
    if (this.q.shake) this.cameras.main.shake(160, 0.005)
    const t = this.add
      .text(p.x + dir * -40, p.y - p.displayHeight / 2, ['哎哟！', '没事没事', '小场面'][Math.floor(Math.random() * 3)], {
        fontFamily: 'monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffe14a',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(21)
    this.tweens.add({ targets: t, y: t.y - 50, alpha: 0, duration: 900, onComplete: () => t.destroy() })
  }

  private themeFx(dt: number, themeId?: string) {
    if (!themeId || store.effectiveQuality === 'low') return
    this.fxAcc += dt
    if (themeId === '404' && this.fxAcc > 1.1) {
      this.fxAcc = Math.random() * 0.6
      const c = [
        [255, 0, 255],
        [0, 255, 255],
        [255, 255, 0],
      ][Math.floor(Math.random() * 3)]
      this.cameras.main.flash(70, c[0], c[1], c[2])
      if (this.q.shake) this.cameras.main.shake(80, 0.004)
      this.glitchSeed++
    } else if (themeId === 'dance' && this.fxAcc > 0.47) {
      this.fxAcc = 0
      const c = Phaser.Display.Color.HSVToRGB(Math.random(), 0.7, 1) as Phaser.Types.Display.ColorObject
      this.cameras.main.flash(180, c.r, c.g, c.b)
    }
  }

  private writeHud() {
    const f = this.flight
    const idx = this.zones.indexAt(f.distance)
    const z = this.zones.zone(idx)
    const altText = formatAltitude(this.zones.altitudeLog(f.distance))
    const [speed, gear] = formatSpeed(this.speedLogSmooth, this.glitchSeed + Math.floor(this.runTime * 2))
    const hud = store.hud
    hud.altitude = altText
    hud.speed = this.phase === 'flying' ? speed : '0 km/h'
    hud.gear = this.phase === 'flying' ? (f.v < 60 && !f.holding ? '漂浮' : gear) : '待机'
    hud.zoneName = z.name
    hud.zoneIndex = idx
    hud.holdTime = f.holding ? f.holdTime : 0
    hud.flightTime = f.flightTime
    store.run.sky = this.sets.skyColors
    if (f.distance >= store.run.maxDistance) {
      store.run.maxDistance = f.distance
      store.run.maxAltText = altText
      store.run.maxZone = idx
      store.run.maxZoneName = z.name
    }
    const r = store.records
    if (f.distance > r.bestDistance) {
      r.bestDistance = f.distance
      r.bestAltText = altText
      r.bestZone = idx
      r.bestZoneName = z.name
    }
    if (f.flightTime > r.longestFlight) r.longestFlight = f.flightTime
  }

  private saveRecords() {
    persist()
  }

  private monitorFps(dt: number) {
    if (store.settings.quality !== 'auto' || this.runTime < 5) return
    this.fpsAcc += dt
    if (this.fpsAcc < 1) return
    this.fpsAcc = 0
    this.fpsSamples.push(this.game.loop.actualFps)
    if (this.fpsSamples.length > 3) this.fpsSamples.shift()
    if (this.fpsSamples.length < 3) return
    const avg = this.fpsSamples.reduce((a, b) => a + b, 0) / 3
    if (avg < 42 && store.effectiveQuality !== 'low') {
      store.effectiveQuality = store.effectiveQuality === 'high' ? 'medium' : 'low'
      this.fpsSamples = []
      pushToast({ kind: 'info', text: `设备性能不足，已自动切换为${store.effectiveQuality === 'medium' ? '中' : '低'}画质` })
    }
  }
}
