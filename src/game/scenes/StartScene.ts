import Phaser from 'phaser'
import { bus } from '../../store/gameStore'

/** 标题场景：叠加在主场景之上，展示像素标题与装饰 */
export class StartScene extends Phaser.Scene {
  private title!: Phaser.GameObjects.Container

  constructor() {
    super('Start')
  }

  create() {
    const { width, height } = this.scale
    const big = Math.max(40, Math.min(84, width / 7))
    this.title = this.add.container(width / 2, height * 0.16)
    const chars = '中国人能飞'.split('')
    const gap = big * 1.05
    chars.forEach((ch, i) => {
      const t = this.add
        .text((i - (chars.length - 1) / 2) * gap, 0, ch, {
          fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif',
          fontSize: `${big}px`,
          fontStyle: '900',
          color: i === 4 ? '#ffe14a' : '#ffffff',
          stroke: '#b5262b',
          strokeThickness: Math.round(big / 7),
          shadow: { offsetX: Math.round(big / 14), offsetY: Math.round(big / 14), color: '#5a0e10', fill: true, stroke: true },
        })
        .setOrigin(0.5)
      this.title.add(t)
      this.tweens.add({ targets: t, y: -big * 0.12, duration: 520, yoyo: true, repeat: -1, delay: i * 110, ease: 'Sine.easeInOut' })
    })
    const sub = this.add
      .text(0, big * 0.85, 'CHINESE  CAN  FLY', {
        fontFamily: 'monospace',
        fontSize: `${Math.round(big * 0.26)}px`,
        fontStyle: 'bold',
        color: '#fff6c0',
        stroke: '#1d7b50',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
    this.title.add(sub)

    const onStart = () => {
      this.tweens.add({
        targets: this.title,
        y: -200,
        alpha: 0,
        duration: 500,
        ease: 'Back.easeIn',
        onComplete: () => this.scene.stop(),
      })
    }
    bus.on('start', onStart)
    this.events.once('shutdown', () => bus.off('start', onStart))
    this.scale.on('resize', this.layout, this)
    this.events.once('shutdown', () => this.scale.off('resize', this.layout, this))
  }

  private layout(size: Phaser.Structs.Size) {
    this.title?.setPosition(size.width / 2, size.height * 0.16)
  }
}
