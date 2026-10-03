// 主角：动画状态 + 喷气粒子 + 尾迹 + 残影 + 彩色爆发
import Phaser from 'phaser'
import type { Pose } from '../art/player'

export interface PlayerState {
  phase: 'title' | 'ready' | 'flying'
  holding: boolean
  holdTime: number
  holdLevel: number
  v: number
  inSpace: boolean
  particleFactor: number
}

export class Player extends Phaser.GameObjects.Sprite {
  pose: Pose | '' = ''
  hitTimer = 0
  private t = 0
  private jet: Phaser.GameObjects.Particles.ParticleEmitter
  private trail: Phaser.GameObjects.Particles.ParticleEmitter
  private rainbow: Phaser.GameObjects.Particles.ParticleEmitter
  private flame: Phaser.GameObjects.Particles.ParticleEmitter
  private ghosts: Phaser.GameObjects.Image[] = []
  private ghostTimer = 0
  private hue = 0
  baseX = 0
  baseY = 0
  S = 3

  constructor(scene: Phaser.Scene, x: number, y: number, S: number) {
    super(scene, x, y, 'player_idle_0')
    this.S = S
    this.baseX = x
    this.baseY = y
    scene.add.existing(this)
    this.setScale(S).setDepth(12)
    this.setPose('idle')

    this.jet = scene.add.particles(0, 0, 'spark', {
      speedY: { min: 180, max: 380 },
      speedX: { min: -40, max: 40 },
      lifespan: { min: 220, max: 420 },
      scale: { start: S * 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      color: [0xfff6c0, 0xffd040, 0xff8a1a, 0xc8201a],
      blendMode: 'ADD',
      frequency: 30,
      quantity: 1,
      emitting: false,
    })
    this.jet.setDepth(11)

    // 长按 10 秒后的增强尾焰
    this.flame = scene.add.particles(0, 0, 'puff', {
      speedY: { min: 420, max: 640 },
      speedX: { min: -25, max: 25 },
      lifespan: { min: 200, max: 360 },
      scale: { start: S * 1.1, end: S * 0.2 },
      alpha: { start: 0.9, end: 0 },
      color: [0xffffff, 0x9ff0ff, 0x4a9aff, 0x6a2aff],
      blendMode: 'ADD',
      frequency: 14,
      quantity: 2,
      emitting: false,
    })
    this.flame.setDepth(11)

    this.trail = scene.add.particles(0, 0, 'puff', {
      speedY: { min: 200, max: 320 },
      speedX: { min: -12, max: 12 },
      lifespan: 900,
      scale: { start: S * 0.6, end: S * 1.4 },
      alpha: { start: 0.45, end: 0 },
      frequency: 45,
      emitting: false,
    })
    this.trail.setDepth(10)

    this.rainbow = scene.add.particles(0, 0, 'spark', {
      speedY: { min: 300, max: 500 },
      speedX: { min: -70, max: 70 },
      lifespan: 700,
      scale: { start: S * 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: { onEmit: () => this.rainbowColor() },
      blendMode: 'ADD',
      frequency: 16,
      quantity: 2,
      emitting: false,
    })
    this.rainbow.setDepth(10)
  }

  private rainbowColor() {
    this.hue = (this.hue + 0.02) % 1
    return Phaser.Display.Color.HSVToRGB(this.hue, 0.8, 1).color as number
  }

  setPose(p: Pose) {
    if (this.pose === p) return
    this.pose = p
    this.play('p_' + p)
  }

  hit() {
    this.hitTimer = 0.7
  }

  /** 爆发起飞的小弹跳 */
  takeoffKick() {
    this.scene.tweens.add({ targets: this, scaleX: this.S * 1.12, scaleY: this.S * 0.9, duration: 90, yoyo: true })
  }

  update2(dt: number, s: PlayerState) {
    this.t += dt
    if (this.hitTimer > 0) this.hitTimer -= dt

    // 动作状态
    let pose: Pose
    if (s.phase === 'title') pose = 'idle'
    else if (s.phase === 'ready') pose = 'ready'
    else if (this.hitTimer > 0) pose = 'hit_recover'
    else if (s.holding && s.holdTime >= 30) pose = 'boost'
    else if (s.inSpace && s.v > 200) pose = 'space_fly'
    else if (s.v > 1500 || (s.holding && s.holdTime >= 10)) pose = 'fast_fly'
    else pose = 'fly'
    this.setPose(pose)

    // 姿态：微前倾、漂浮晃动、碰撞旋转
    const flying = s.phase === 'flying'
    let rot = 0
    let bob = 0
    if (flying) {
      const speedK = Math.min(1, s.v / 2500)
      rot = Math.sin(this.t * 2.2) * (0.04 + (1 - speedK) * 0.04) + speedK * 0.05
      bob = Math.sin(this.t * 3) * (s.holding ? 2 : 6)
      if (this.hitTimer > 0) rot = Math.sin(this.hitTimer * 25) * 0.35
    }
    this.rotation = rot
    this.x = this.baseX + (flying ? Math.sin(this.t * 1.3) * 6 : 0)
    this.y = this.baseY + bob

    // 粒子
    const fx = this.x
    const fy = this.y + this.displayHeight * 0.48
    const pf = s.particleFactor
    this.jet.setPosition(fx, fy)
    this.trail.setPosition(fx, fy + 6)
    this.rainbow.setPosition(fx, fy)
    const L = s.holdLevel
    if (flying && s.holding) {
      this.jet.emitting = true
      this.jet.frequency = Math.max(8, (L >= 3 ? 10 : 22) / pf)
      this.jet.quantity = L >= 3 ? 3 : L >= 1 ? 2 : 1
    } else if (flying) {
      this.jet.emitting = true
      this.jet.frequency = 90 / pf
      this.jet.quantity = 1
    } else this.jet.emitting = false
    this.flame.setPosition(fx, fy + 4)
    this.flame.emitting = flying && s.holding && L >= 3
    this.trail.emitting = flying && s.v > 150 && pf > 0.35
    this.rainbow.emitting = flying && s.holding && L >= 5 && pf > 0.25

    // 残影
    if (flying && s.holding && L >= 4) {
      this.ghostTimer -= dt
      if (this.ghostTimer <= 0) {
        this.ghostTimer = 0.07 / Math.max(0.5, pf)
        this.spawnGhost(L >= 5)
      }
    }
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i]
      g.y += Math.min(900, s.v) * 0.5 * dt
      g.alpha -= dt * 2.2
      if (g.alpha <= 0) {
        g.destroy()
        this.ghosts.splice(i, 1)
      }
    }
  }

  private spawnGhost(rainbow: boolean) {
    const g = this.scene.add.image(this.x, this.y, this.texture.key).setScale(this.scaleX, this.scaleY)
    g.rotation = this.rotation
    g.setDepth(11).setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD)
    g.setTint(rainbow ? this.rainbowColor() : 0x9fe8ff)
    this.ghosts.push(g)
  }

  /** 起飞瞬间的尘土 */
  dust() {
    const e = this.scene.add.particles(this.x, this.y + this.displayHeight / 2, 'puff', {
      speedX: { min: -220, max: 220 },
      speedY: { min: -60, max: 0 },
      lifespan: 600,
      scale: { start: this.S * 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: 0xd8d2c4,
      emitting: false,
    })
    e.setDepth(13)
    e.explode(24)
    this.scene.time.delayedCall(800, () => e.destroy())
  }
}
