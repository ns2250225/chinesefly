// 音频系统：Web Audio 无缝循环 BGM + 合成音效
import { store, idbGet, idbPut, persist } from '../../store/gameStore'

export type Sfx = 'takeoff' | 'cloud' | 'lightspeed' | 'whoosh' | 'bump' | 'achievement' | 'zone' | 'chime' | 'click'

class AudioSystem {
  ctx: AudioContext | null = null
  private master!: GainNode
  private musicGain!: GainNode
  private sfxGain!: GainNode
  private bgmBuffer: AudioBuffer | null = null
  private defaultBuffer: AudioBuffer | null = null
  private bgmSource: AudioBufferSourceNode | null = null
  private noise: AudioBuffer | null = null
  private jetSrc: AudioBufferSourceNode | null = null
  private jetGain: GainNode | null = null
  private jetFilter: BiquadFilterNode | null = null
  wantMusic = false

  private ensure() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext || (window as any).webkitAudioContext
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.connect(this.ctx.destination)
    this.musicGain = this.ctx.createGain()
    this.musicGain.connect(this.master)
    this.sfxGain = this.ctx.createGain()
    this.sfxGain.connect(this.master)
    this.applyVolumes()
    const len = this.ctx.sampleRate * 2
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const d = this.noise.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    return this.ctx
  }

  async load(url: string) {
    const ctx = this.ensure()
    try {
      const res = await fetch(url)
      const data = await res.arrayBuffer()
      this.defaultBuffer = await decode(ctx, data)
      this.bgmBuffer = this.defaultBuffer
    } catch (e) {
      console.warn('BGM 加载失败', e)
    }
    if (store.settings.useLocalMusic) {
      const blob = await idbGet('localMusic')
      if (blob) {
        try {
          this.bgmBuffer = await decode(ctx, await blob.arrayBuffer())
        } catch {
          store.settings.useLocalMusic = false
        }
      }
    }
  }

  /** 必须在用户手势中调用（移动端音频解锁） */
  unlock() {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') ctx.resume()
    // iOS：播放一段静音缓冲以解锁
    const b = ctx.createBuffer(1, 1, 22050)
    const s = ctx.createBufferSource()
    s.buffer = b
    s.connect(ctx.destination)
    s.start(0)
  }

  applyVolumes() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.musicGain.gain.setTargetAtTime(store.settings.music ? store.settings.musicVolume : 0, t, 0.05)
    this.sfxGain.gain.setTargetAtTime(store.settings.sfxVolume, t, 0.05)
  }

  playMusic() {
    this.wantMusic = true
    const ctx = this.ensure()
    if (!this.bgmBuffer || this.bgmSource) return
    const src = ctx.createBufferSource()
    src.buffer = this.bgmBuffer
    src.loop = true
    // 去掉 MP3 编码首尾静音，保证尽量无缝循环
    const [a, b] = trimPoints(this.bgmBuffer)
    src.loopStart = a
    src.loopEnd = b
    src.connect(this.musicGain)
    src.start(0, a)
    this.bgmSource = src
  }

  stopMusic() {
    this.wantMusic = false
    try {
      this.bgmSource?.stop()
    } catch {
      /* 已停止 */
    }
    this.bgmSource?.disconnect()
    this.bgmSource = null
  }

  suspend() {
    this.ctx?.suspend()
  }
  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume()
  }

  async importLocal(file: File) {
    const ctx = this.ensure()
    const buf = await decode(ctx, await file.arrayBuffer())
    await idbPut('localMusic', file).catch(() => undefined)
    this.bgmBuffer = buf
    store.settings.useLocalMusic = true
    store.localMusicName = file.name
    persist()
    this.restartMusic()
  }

  useDefault() {
    this.bgmBuffer = this.defaultBuffer
    store.settings.useLocalMusic = false
    this.restartMusic()
  }

  private restartMusic() {
    const want = this.wantMusic
    this.stopMusic()
    if (want) this.playMusic()
  }

  /** 持续喷气声，level 0~1 */
  jet(level: number) {
    if (!this.ctx || !this.noise) return
    const ctx = this.ctx
    if (!this.jetSrc) {
      this.jetSrc = ctx.createBufferSource()
      this.jetSrc.buffer = this.noise
      this.jetSrc.loop = true
      this.jetFilter = ctx.createBiquadFilter()
      this.jetFilter.type = 'lowpass'
      this.jetGain = ctx.createGain()
      this.jetGain.gain.value = 0
      this.jetSrc.connect(this.jetFilter).connect(this.jetGain).connect(this.sfxGain)
      this.jetSrc.start()
    }
    const t = ctx.currentTime
    this.jetGain!.gain.setTargetAtTime(level * 0.16, t, 0.08)
    this.jetFilter!.frequency.setTargetAtTime(300 + level * 1800, t, 0.1)
  }

  sfx(name: Sfx) {
    if (!this.ctx || this.ctx.state !== 'running') return
    const ctx = this.ctx
    const t = ctx.currentTime
    const out = this.sfxGain
    const tone = (type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = type
      o.frequency.setValueAtTime(f0, t + delay)
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + delay + dur)
      g.gain.setValueAtTime(0.0001, t + delay)
      g.gain.exponentialRampToValueAtTime(vol, t + delay + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur)
      o.connect(g).connect(out)
      o.start(t + delay)
      o.stop(t + delay + dur + 0.05)
    }
    const noise = (dur: number, f0: number, f1: number, vol: number, q = 1, delay = 0) => {
      const s = ctx.createBufferSource()
      s.buffer = this.noise
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.Q.value = q
      f.frequency.setValueAtTime(f0, t + delay)
      f.frequency.exponentialRampToValueAtTime(f1, t + delay + dur)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t + delay)
      g.gain.exponentialRampToValueAtTime(vol, t + delay + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur)
      s.connect(f).connect(g).connect(out)
      s.start(t + delay)
      s.stop(t + delay + dur + 0.05)
    }
    switch (name) {
      case 'takeoff':
        noise(0.7, 300, 2400, 0.5, 0.8)
        tone('square', 110, 440, 0.4, 0.08)
        break
      case 'cloud':
        noise(0.9, 4000, 500, 0.4, 0.6)
        tone('sine', 880, 1320, 0.5, 0.12, 0.2)
        tone('sine', 1320, 1760, 0.5, 0.1, 0.35)
        break
      case 'lightspeed':
        tone('sawtooth', 80, 2400, 1.2, 0.12)
        tone('square', 160, 3200, 1.2, 0.05)
        noise(1.4, 200, 6000, 0.35, 0.5)
        tone('sine', 60, 30, 0.8, 0.4, 1.1)
        break
      case 'whoosh':
        noise(1.1, 400, 3000, 0.35, 1.5)
        break
      case 'bump':
        tone('square', 180, 60, 0.18, 0.18)
        noise(0.15, 800, 200, 0.3, 2)
        break
      case 'achievement':
        ;[523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, 0.14, 0.08, i * 0.08))
        break
      case 'zone':
        tone('triangle', 392, 392, 0.12, 0.14)
        tone('triangle', 587, 587, 0.2, 0.14, 0.1)
        break
      case 'chime':
        tone('sine', 1200, 1600, 0.3, 0.1)
        break
      case 'click':
        tone('square', 600, 400, 0.05, 0.06)
        break
    }
  }
}

function decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject))
}

function trimPoints(buf: AudioBuffer): [number, number] {
  const d = buf.getChannelData(0)
  const th = 0.002
  let s = 0
  while (s < d.length && Math.abs(d[s]) < th) s++
  let e = d.length - 1
  while (e > s && Math.abs(d[e]) < th) e--
  if (e - s < buf.sampleRate) return [0, buf.duration]
  return [s / buf.sampleRate, (e + 1) / buf.sampleRate]
}

export const audio = new AudioSystem()
