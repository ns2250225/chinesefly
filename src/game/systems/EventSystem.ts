// 随机事件系统：让飞行中始终有惊喜
import Phaser from 'phaser'
import { EVENTS, GENERIC_JOKES, type EventDef } from '../config/events'
import { EventObject } from '../entities/EventObject'
import type { ZoneInfo } from './ZoneSystem'
import { pushToast } from '../../store/gameStore'
import { audio } from './AudioSystem'

const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export class EventSystem {
  live: EventObject[] = []
  private timer = 4
  private jokeTimer = 12

  constructor(private scene: Phaser.Scene) {}

  reset() {
    this.live.forEach((o) => o.destroy())
    this.live = []
    this.timer = 4
    this.jokeTimer = 12
  }

  update(dt: number, scroll: number, v: number, zone: ZoneInfo, w: number, h: number, playerX: number, playerY: number, S: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const o = this.live[i]
      o.step(dt, scroll, w)
      if (o.isDone(w, h)) {
        o.destroy()
        this.live.splice(i, 1)
      }
    }
    if (v < 120) return
    this.timer -= dt
    if (this.timer <= 0 && this.live.length < 8) {
      this.timer = 5 + Math.random() * 6
      this.trigger(zone, w, h, playerX, playerY, S)
    }
    this.jokeTimer -= dt
    if (this.jokeTimer <= 0) {
      this.jokeTimer = 14 + Math.random() * 10
      const pool = Math.random() < 0.6 && zone.jokes.length ? zone.jokes : GENERIC_JOKES[zone.stage]
      pushToast({ kind: 'joke', text: pick(pool) })
    }
  }

  private candidates(zone: ZoneInfo): EventDef[] {
    const list = EVENTS.filter((e) => e.stages.includes(zone.stage))
    const extra = (zone.events || []).map((id) => EVENTS.find((e) => e.id === id)!).filter(Boolean)
    return [...list, ...extra, ...extra]
  }

  trigger(zone: ZoneInfo, w: number, h: number, px: number, py: number, S: number, forced?: string) {
    const def = forced ? EVENTS.find((e) => e.id === forced)! : pick(this.candidates(zone))
    if (!def) return
    const n = def.count ?? 1
    const scale = (def.scale ?? 1) * S
    const fromLeft = Math.random() < 0.5
    const mjKeys = ['mj_zhong', 'mj_fa', 'mj_bai', 'mj_wan', 'mj_tong', 'mj_tiao']
    let speaker: EventObject | null = null
    for (let i = 0; i < n; i++) {
      const key = def.id === 'mahjong' ? mjKeys[i % mjKeys.length] : def.key
      const o = new EventObject(this.scene, key, !!def.anim)
      o.setScale(scale * (n > 1 ? 0.8 + Math.random() * 0.4 : 1))
      o.motion = def.motion
      o.bump = !!def.bump
      if (def.tints) o.setTint(pick(def.tints))
      switch (def.motion) {
        case 'cross': {
          o.x = fromLeft ? -60 - i * 50 : w + 60 + i * 50
          o.y = h * (0.12 + Math.random() * 0.3) + (n > 1 ? (Math.random() - 0.5) * 80 : 0)
          o.vx = (fromLeft ? 1 : -1) * (110 + Math.random() * 90)
          o.p = 0.04
          if (!fromLeft && ['bird', 'plane', 'ufo', 'satellite'].includes(def.key)) o.setFlipX(true)
          if (fromLeft && def.key === 'plane') o.setFlipX(false)
          if (def.id === 'mahjong') o.rotation = (Math.random() - 0.5) * 0.8
          break
        }
        case 'overtake':
          o.x = px + (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 60) * (S / 3 + 0.4)
          o.y = h + 80
          o.vy = -(480 + Math.random() * 200)
          break
        case 'pass':
          o.x = n > 1 ? w * (0.15 + (0.7 * i) / (n - 1)) : Phaser.Math.Clamp(px + (Math.random() - 0.5) * w * 0.5, 80, w - 80)
          o.y = -80 - (n > 1 ? i * 30 : 0)
          if (def.id === 'galaxy_queue') o.rotation = Math.random() * Math.PI
          break
        case 'float': {
          const side = Math.random() < 0.5 ? -1 : 1
          o.x = Phaser.Math.Clamp(px + side * Math.min(w * 0.3, 170), 50, w - 50)
          o.baseY = o.y = py - 90 - Math.random() * 120
          o.setAlpha(0)
          o.maxLife = 4.5
          if (side > 0) o.setFlipX(true)
          break
        }
      }
      this.live.push(o)
      if (i === 0) speaker = o
    }
    if (speaker) {
      if (def.label) speaker.label(def.label)
      if (def.text) this.scene.time.delayedCall(def.motion === 'pass' ? 900 : 500, () => speaker?.active && speaker.say(pick(def.text!)))
    }
    if (def.toast) pushToast({ kind: 'joke', text: pick(def.toast) })
    if (def.sfx) audio.sfx(def.sfx)
  }
}
