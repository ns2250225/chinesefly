// 随机事件物体：横穿、超车、从上方经过、在主角身边漂浮，附带对话气泡
import Phaser from 'phaser'
import type { Motion } from '../config/events'

export class EventObject extends Phaser.GameObjects.Sprite {
  motion: Motion = 'cross'
  vx = 0
  vy = 0
  p = 0.1
  life = 0
  maxLife = 8
  bump = false
  hitDone = false
  bubble: Phaser.GameObjects.Text | null = null
  baseY = 0

  constructor(scene: Phaser.Scene, key: string, anim: boolean) {
    super(scene, 0, 0, anim ? key + '_0' : key)
    if (anim) this.play(key)
    scene.add.existing(this)
    this.setDepth(16)
  }

  say(text: string, ms = 2600) {
    this.bubble?.destroy()
    this.bubble = this.scene.add
      .text(this.x, this.y, text, {
        fontFamily: 'monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        padding: { x: 8, y: 5 },
        wordWrap: { width: 220, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
    this.scene.time.delayedCall(ms, () => {
      this.bubble?.destroy()
      this.bubble = null
    })
  }

  label(text: string) {
    this.say(text, 99999)
    this.bubble?.setStyle({ backgroundColor: '#ffd21f' })
  }

  step(dt: number, scroll: number, w: number) {
    this.life += dt
    switch (this.motion) {
      case 'cross':
        this.x += this.vx * dt
        this.y += scroll * this.p
        break
      case 'overtake':
        this.y += this.vy * dt
        break
      case 'pass':
        this.y += Math.min(260, Math.max(70, scroll / Math.max(dt, 1e-4) * 0.12)) * dt
        break
      case 'float': {
        const a = Math.min(1, this.life / 0.5) * Math.min(1, Math.max(0, (this.maxLife - this.life) / 0.6))
        this.setAlpha(a)
        this.y = this.baseY + Math.sin(this.life * 2) * 8
        break
      }
    }
    if (this.bubble) {
      const bx = Phaser.Math.Clamp(this.x, 120, w - 120)
      this.bubble.setPosition(bx, this.y - this.displayHeight / 2 - 6)
    }
  }

  isDone(w: number, h: number) {
    const m = Math.max(this.displayWidth, this.displayHeight)
    if (this.motion === 'float') return this.life > this.maxLife
    return this.life > 1.5 && (this.x < -m - 60 || this.x > w + m + 60 || this.y > h + m + 60 || this.y < -m - 400)
  }

  destroy(fromScene?: boolean) {
    this.bubble?.destroy()
    this.bubble = null
    super.destroy(fromScene)
  }
}
