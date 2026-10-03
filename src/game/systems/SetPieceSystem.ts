// 场景演出：天空渐变、星空、天安门开场、地球弧线/完整地球、远去的天体、云雾
import Phaser from 'phaser'
import type { ZoneSystem } from './ZoneSystem'
import { ZONES } from '../config/zones'

interface GroundItem {
  obj: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject
  p: number
}

interface Receding {
  key: string
  anim?: boolean
  zone: number
  from: number
  to: number
  sizeFrom: number
  sizeTo: number
  yFrom: number
  yTo: number
  x: number
  label: string
  tint?: number
  add?: boolean
  spin?: number
}

const RECEDING: Receding[] = [
  { key: 'sun', anim: true, zone: 8, from: 0, to: 0.8, sizeFrom: 0.22, sizeTo: 0.015, yFrom: 0.92, yTo: 0.78, x: 0.5, label: '太阳' },
  { key: 'galaxy', zone: 11, from: 0, to: 0.7, sizeFrom: 3.2, sizeTo: 0.035, yFrom: 0.92, yTo: 0.78, x: 0.5, label: '银河系', add: true, spin: 0.05 },
  { key: 'node', zone: 14, from: 0, to: 0.6, sizeFrom: 3, sizeTo: 0.03, yFrom: 0.95, yTo: 0.78, x: 0.5, label: '可观测宇宙', add: true, tint: 0xbfe8ff },
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}

export class SetPieceSystem {
  private sky: Phaser.GameObjects.Graphics
  private starsFar: Phaser.GameObjects.TileSprite
  private starsNear: Phaser.GameObjects.TileSprite
  private ground: GroundItem[] = []
  private pigeons: Phaser.GameObjects.Sprite[] = []
  private earthG: Phaser.GameObjects.Graphics
  private earth: Phaser.GameObjects.Image
  private fog: Phaser.GameObjects.Rectangle
  private recede: { def: Receding; img: Phaser.GameObjects.Sprite; label: Phaser.GameObjects.Text }[] = []
  private flag!: Phaser.GameObjects.Sprite
  earthFull = false
  skyColors: [number, number] = [0, 0]
  onMilkyDot: (() => void) | null = null
  private milkyDotFired = false

  constructor(
    private scene: Phaser.Scene,
    private zones: ZoneSystem,
  ) {
    this.sky = scene.add.graphics().setDepth(0)
    this.starsFar = scene.add.tileSprite(0, 0, 10, 10, 'stars_far').setOrigin(0).setDepth(1)
    this.starsNear = scene.add.tileSprite(0, 0, 10, 10, 'stars_near').setOrigin(0).setDepth(2)
    this.earthG = scene.add.graphics().setDepth(3)
    this.earth = scene.add.image(0, 0, 'earth').setDepth(3).setVisible(false)
    this.fog = scene.add.rectangle(0, 0, 10, 10, 0xffffff, 0).setOrigin(0).setDepth(18)
    for (const def of RECEDING) {
      const img = scene.add.sprite(0, 0, def.anim ? def.key + '_0' : def.key).setDepth(4).setVisible(false)
      if (def.anim) img.play(def.key)
      if (def.tint) img.setTint(def.tint)
      if (def.add) img.setBlendMode(Phaser.BlendModes.ADD)
      const label = scene.add
        .text(0, 0, def.label, { fontFamily: 'monospace', fontSize: '13px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 } })
        .setOrigin(0.5, 0)
        .setDepth(4.1)
        .setVisible(false)
      this.recede.push({ def, img, label })
    }
  }

  /** 建立天安门广场开场场景 */
  buildGround(w: number, groundY: number, S: number) {
    for (const g of this.ground) g.obj.destroy()
    for (const p of this.pigeons) p.destroy()
    this.ground = []
    this.pigeons = []
    this.milkyDotFired = false
    const add = <T extends GroundItem['obj']>(obj: T, p: number) => {
      this.ground.push({ obj, p })
      return obj
    }
    const s = Math.max(1, Math.min(S, Math.floor((w * 0.98) / 168)))
    const far = this.scene.add.tileSprite(0, groundY - 40 * s, w, 60 * S, 'skyline_far').setOrigin(0, 1).setTileScale(S).setDepth(6)
    far.setAlpha(0.9)
    add(far, 0.4)
    const city = this.scene.add.tileSprite(0, groundY - 44 * s, w, 90 * S, 'skyline').setOrigin(0, 1).setTileScale(S).setDepth(6.2)
    city.tilePositionX = 30
    add(city, 0.5)
    add(this.scene.add.image(w / 2, groundY - 22 * s, 'tiananmen').setOrigin(0.5, 1).setScale(s).setDepth(7), 0.75)
    add(this.scene.add.image(w / 2 - 105 * s, groundY - 14 * s, 'huabiao').setOrigin(0.5, 1).setScale(s).setDepth(7.2), 0.8)
    add(this.scene.add.image(w / 2 + 105 * s, groundY - 14 * s, 'huabiao').setOrigin(0.5, 1).setScale(s).setDepth(7.2), 0.8)
    // 广场地面
    add(this.scene.add.tileSprite(0, groundY - 22 * s, w, 3000, 'ground').setOrigin(0, 0).setTileScale(S).setDepth(7.5), 0.9)
    const fx = Math.max(40, w / 2 - Math.min(w * 0.32, 230))
    add(this.scene.add.image(fx, groundY - 4 * S, 'flagpole').setOrigin(0.5, 1).setScale(S * 0.8).setDepth(8), 0.95)
    this.flag = this.scene.add.sprite(fx + 1, groundY - 4 * S - 128 * S * 0.8, 'flag_0').setOrigin(0, 0).setScale(S * 0.8).setDepth(8)
    this.flag.play('flag')
    add(this.flag, 0.95)
    add(this.scene.add.image(w * 0.08, groundY, 'lamp').setOrigin(0.5, 1).setScale(S).setDepth(9), 1)
    add(this.scene.add.image(w * 0.92, groundY, 'lamp').setOrigin(0.5, 1).setScale(S).setDepth(9), 1)
    add(this.scene.add.rectangle(0, groundY, w, 4000, 0xb9b6ae).setOrigin(0, 0).setDepth(8.5), 1)
    add(this.scene.add.tileSprite(0, groundY, w, 4000, 'ground').setOrigin(0, 0).setTileScale(S * 1.2).setDepth(8.6), 1)
    // 鸽子
    for (let i = 0; i < 7; i++) {
      const side = i % 2 ? 1 : -1
      const px = w / 2 + side * (60 + Math.random() * Math.min(w * 0.4, 260))
      const pg = this.scene.add.sprite(px, groundY + 2 + Math.random() * 20, 'pigeon_0').setOrigin(0.5, 1).setScale(S).setDepth(9.5)
      if (side < 0) pg.setFlipX(true)
      this.pigeons.push(pg)
      add(pg, 1)
    }
  }

  /** 起飞时鸽子惊飞 */
  scarePigeons() {
    for (const pg of this.pigeons) {
      pg.play('pigeon')
      const dir = pg.flipX ? -1 : 1
      this.scene.tweens.add({
        targets: pg,
        x: pg.x + dir * (200 + Math.random() * 300),
        y: pg.y - 300 - Math.random() * 300,
        duration: 1800 + Math.random() * 800,
        ease: 'Sine.easeOut',
      })
    }
  }

  resize(w: number, h: number) {
    this.starsFar.setSize(w, h)
    this.starsNear.setSize(w, h)
    this.fog.setSize(w, h)
  }

  update(dt: number, scroll: number, distance: number, w: number, h: number, S: number, quality: string) {
    const idx = this.zones.indexAt(distance)
    const z = this.zones.zone(idx)
    const t = this.zones.progress(distance, z)
    const next = this.zones.zone(idx + 1)

    // 天空渐变：本区域色板 → 下个区域色板
    const k = smooth(0.35, 1, t)
    const top = lerpColor(z.sky[0], next.sky[0], k)
    const bot = lerpColor(z.sky[1], next.sky[1], k)
    this.skyColors = [top, bot]
    this.sky.clear()
    this.sky.fillGradientStyle(top, top, bot, bot, 1)
    this.sky.fillRect(0, 0, w, h)

    // 星空
    const stars = lerp(z.stars, next.stars, k)
    this.starsFar.setAlpha(stars).setVisible(stars > 0.01)
    this.starsNear.setAlpha(stars).setVisible(stars > 0.01 && quality !== 'low')
    this.starsFar.tileScaleX = this.starsFar.tileScaleY = Math.max(2, S - 1)
    this.starsNear.tileScaleX = this.starsNear.tileScaleY = S
    const sp = Math.min(scroll, 60)
    this.starsFar.tilePositionY = (this.starsFar.tilePositionY - sp * 0.02 / this.starsFar.tileScaleY) % 256
    this.starsNear.tilePositionY = (this.starsNear.tilePositionY - sp * 0.06 / this.starsNear.tileScaleY) % 256

    // 开场地面随镜头下沉
    for (let i = this.ground.length - 1; i >= 0; i--) {
      const g = this.ground[i]
      g.obj.y += scroll * g.p
      if (g.obj.y > h + 4200) {
        g.obj.destroy()
        this.ground.splice(i, 1)
      }
    }

    this.updateEarth(distance, w, h)
    this.updateReceding(distance, w, h)
    this.updateFog(idx, t)
  }

  private updateEarth(distance: number, w: number, h: number) {
    const st = (i: number) => this.zones.zone(i).start
    const dA = st(4) - ZONES[3].length * 0.15
    const dB = st(6)
    const dC = st(7)
    const B = Math.min(w, h)
    this.earthG.clear()
    if (distance < dA || distance > dC) {
      this.earth.setVisible(false)
      return
    }
    let R: number
    let cy: number
    let spriteAlpha = 0
    if (distance <= dB) {
      const u = clamp01((distance - dA) / (dB - dA))
      R = B * Math.exp(lerp(Math.log(7), Math.log(0.3), u))
      const cap = lerp(h * 0.1, 2 * R + h * 0.06, Math.pow(u, 1.5))
      cy = h - cap + R
      spriteAlpha = smooth(0.55, 0.9, u)
      if (u > 0.96) this.earthFull = true
      if (spriteAlpha < 1) {
        const ga = 1 - spriteAlpha
        this.earthG.fillStyle(0x9fd8ff, 0.18 * ga).fillCircle(w / 2, cy, R + Math.max(10, R * 0.035))
        this.earthG.fillStyle(0x7fc4ff, 0.35 * ga).fillCircle(w / 2, cy, R + Math.max(5, R * 0.016))
        this.earthG.fillStyle(0x2a6fd6, ga).fillCircle(w / 2, cy, R)
        this.earthG.fillStyle(0x3fae4f, 0.85 * ga).fillCircle(w / 2 - R * 0.2, cy - R * 0.55, R * 0.42)
        this.earthG.fillStyle(0x2a6fd6, ga).fillCircle(w / 2 + R * 0.05, cy - R * 0.5, R * 0.18)
        this.earthG.fillStyle(0xffffff, 0.45 * ga).fillEllipse(w / 2 + R * 0.2, cy - R * 0.92, R * 0.5, R * 0.05)
      }
    } else {
      const v = clamp01((distance - dB) / (dC - dB))
      const R0 = B * 0.3
      R = R0 * Math.exp(lerp(0, Math.log(0.03), v))
      cy = lerp(h * 0.94 - R0, h * 1.02, Math.pow(v, 0.8))
      spriteAlpha = 1
    }
    this.earth.setVisible(spriteAlpha > 0)
    this.earth.setAlpha(spriteAlpha)
    this.earth.setPosition(w / 2, cy).setDisplaySize(R * 2 * (64 / 62), R * 2 * (64 / 62))
    this.earth.rotation += 0.0004
  }

  private updateReceding(distance: number, w: number, h: number) {
    const B = Math.min(w, h)
    for (const r of this.recede) {
      const z = this.zones.zone(r.def.zone)
      const t = (distance - z.start) / z.length
      if (t < r.def.from || t > r.def.to + 0.25) {
        r.img.setVisible(false)
        r.label.setVisible(false)
        continue
      }
      const u = clamp01((t - r.def.from) / (r.def.to - r.def.from))
      const size = B * Math.exp(lerp(Math.log(r.def.sizeFrom), Math.log(r.def.sizeTo), u))
      const y = h * lerp(r.def.yFrom, r.def.yTo, u) + (u < 0.3 ? size * 0.3 * (1 - u / 0.3) : 0)
      const fade = t > r.def.to ? 1 - (t - r.def.to) / 0.25 : 1
      r.img.setVisible(true).setPosition(w * r.def.x, y).setDisplaySize(size, size * (r.img.height / r.img.width))
      r.img.setAlpha(fade * smooth(0, 0.08, u + 0.02))
      if (r.def.spin) r.img.rotation += r.def.spin / 60
      r.label.setVisible(size < B * 0.4).setPosition(w * r.def.x, y + size * 0.4 + 6).setAlpha(fade)
      if (r.def.key === 'galaxy' && u >= 1 && !this.milkyDotFired) {
        this.milkyDotFired = true
        this.onMilkyDot?.()
      }
    }
  }

  private updateFog(idx: number, t: number) {
    // 云层中逐渐被云雾遮挡，穿出时闪白（闪白由主场景触发）
    let a = 0
    if (idx === 2) a = 0.6 * smooth(0.15, 0.9, t)
    else if (idx === 3) a = 0.6 * (1 - smooth(0, 0.04, t))
    this.fog.setFillStyle(0xffffff, a)
  }
}

export function lerpColor(a: number, b: number, t: number) {
  const ar = (a >> 16) & 255,
    ag = (a >> 8) & 255,
    ab = a & 255
  const br = (b >> 16) & 255,
    bg = (b >> 8) & 255,
    bb = b & 255
  return (Math.round(lerp(ar, br, t)) << 16) | (Math.round(lerp(ag, bg, t)) << 8) | Math.round(lerp(ab, bb, t))
}
