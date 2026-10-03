import Phaser from 'phaser'
import { buildTextures, ANIMS } from '../art/textures'
import { audio } from '../systems/AudioSystem'
import { store } from '../../store/gameStore'
import bgmUrl from '../../assets/audio/zhongguoren.mp3?url'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  async create() {
    const { width, height } = this.scale
    const txt = this.add
      .text(width / 2, height / 2, '加载中…', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
      .setOrigin(0.5)
    store.loadingProgress = 0.1

    // 生成全部像素纹理
    const tex = buildTextures()
    for (const [key, canvas] of Object.entries(tex)) {
      if (this.textures.exists(key)) this.textures.remove(key)
      this.textures.addCanvas(key, canvas)
    }
    for (const a of ANIMS) {
      if (this.anims.exists(a.key)) continue
      this.anims.create({ key: a.key, frames: a.frames.map((f) => ({ key: f })), frameRate: a.rate, repeat: -1 })
    }
    store.loadingProgress = 0.5
    txt.setText('加载音乐…')

    // 音乐加载最多等待 6 秒，超时也能进入游戏
    await Promise.race([audio.load(bgmUrl), new Promise((r) => setTimeout(r, 6000))])
    store.loadingProgress = 1
    txt.destroy()
    this.scene.start('Main', { autoReady: false })
    this.scene.launch('Start')
  }
}
