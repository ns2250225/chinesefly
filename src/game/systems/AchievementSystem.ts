// 成就系统
import { ACHIEVEMENTS, type AchievementDef } from '../config/achievements'
import { store, pushToast, persist } from '../../store/gameStore'
import { audio } from './AudioSystem'

export interface AchState {
  airborne: boolean
  altLog: number
  zoneIndex: number
  flightTime: number
  holdTime: number
  flags: Set<string>
}

export class AchievementSystem {
  private acc = 0

  update(dt: number, s: AchState) {
    this.acc += dt
    if (this.acc < 0.25) return
    this.acc = 0
    for (const a of ACHIEVEMENTS) {
      if (store.achievements[a.id]) continue
      if (this.check(a, s)) this.unlock(a)
    }
  }

  private check(a: AchievementDef, s: AchState) {
    const c = a.cond
    switch (c.type) {
      case 'takeoff':
        return s.airborne && s.altLog > -0.5
      case 'alt':
        return s.altLog >= Math.log10(c.value)
      case 'zone':
        return s.zoneIndex >= c.value
      case 'flight':
        return s.flightTime >= c.value
      case 'hold':
        return s.holdTime >= c.value
      case 'flag':
        return s.flags.has(c.value)
    }
  }

  unlock(a: AchievementDef) {
    store.achievements[a.id] = Date.now()
    persist()
    audio.sfx('achievement')
    pushToast({ kind: 'achievement', icon: a.icon, title: '成就解锁', text: `${a.name} · ${a.desc}` }, 3600)
  }
}
