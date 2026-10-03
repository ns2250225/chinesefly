import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { StartScene } from './scenes/StartScene'
import { MainFlightScene } from './scenes/MainFlightScene'
import { PauseScene } from './scenes/PauseScene'

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#3f9cff',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
    fps: { target: 60 },
    input: { activePointers: 3 },
    audio: { noAudio: true }, // 音频由 AudioSystem（Web Audio API）接管
    scene: [BootScene, MainFlightScene, StartScene, PauseScene],
  })
}
