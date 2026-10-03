// 背景/装饰物体：对象池复用的像素精灵，按视差随镜头滚动
import Phaser from 'phaser'

export class BackgroundObject extends Phaser.GameObjects.Sprite {
  p = 1 // 视差
  vx = 0
  vy = 0
  spin = 0
  bump = false
  hitDone = false
  label: Phaser.GameObjects.Text | null = null
  onRelease: (() => void) | null = null

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'dot')
    scene.add.existing(this)
  }

  setup(key: string, anim: boolean, x: number, y: number, scale: number) {
    this.setActive(true).setVisible(true)
    this.stop()
    if (anim) {
      this.setTexture(key + '_0')
      this.play({ key, startFrame: Math.floor(Math.random() * 2) })
    } else this.setTexture(key)
    this.setPosition(x, y)
    this.setScale(scale)
    this.setRotation(0).setAlpha(1).clearTint().setFlipX(false)
    this.setBlendMode(Phaser.BlendModes.NORMAL)
    this.p = 1
    this.vx = 0
    this.vy = 0
    this.spin = 0
    this.bump = false
    this.hitDone = false
    return this
  }

  attachLabel(text: string) {
    this.label = this.scene.add
      .text(this.x, this.y, text, {
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(this.depth + 0.5)
  }

  step(dt: number, scroll: number) {
    this.y += scroll * this.p + this.vy * dt
    this.x += this.vx * dt
    if (this.spin) this.rotation += this.spin * dt
    if (this.label) this.label.setPosition(this.x, this.y - this.displayHeight / 2 - 4)
  }

  isOut(w: number, h: number) {
    const m = Math.max(this.displayWidth, this.displayHeight)
    return this.y - m > h + 80 || this.x < -m - 400 || this.x > w + m + 400 || this.y < -m - 6000
  }

  release() {
    this.stop()
    this.setActive(false).setVisible(false)
    this.label?.destroy()
    this.label = null
    this.onRelease?.()
    this.onRelease = null
  }
}

export class ObjectPool {
  private free: BackgroundObject[] = []
  live: BackgroundObject[] = []
  constructor(private scene: Phaser.Scene) {}

  get(): BackgroundObject {
    const o = this.free.pop() ?? new BackgroundObject(this.scene)
    this.live.push(o)
    return o
  }

  update(dt: number, scroll: number, w: number, h: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const o = this.live[i]
      o.step(dt, scroll)
      if (o.isOut(w, h)) {
        o.release()
        this.live.splice(i, 1)
        this.free.push(o)
      }
    }
  }

  clear() {
    for (const o of this.live) {
      o.release()
      this.free.push(o)
    }
    this.live = []
  }

  get count() {
    return this.live.length
  }
}
