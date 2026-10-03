import Phaser from 'phaser'

/** 暂停场景：压暗画面，按钮由 Vue PauseMenu 提供 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause')
  }

  create() {
    const { width, height } = this.scale
    const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0)
    this.tweens.add({ targets: dim, fillAlpha: 0.55, duration: 180 })
    const t = this.add
      .text(width / 2, height * 0.2, '暂停中', {
        fontFamily: 'monospace',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
    this.tweens.add({ targets: t, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 })
  }
}
