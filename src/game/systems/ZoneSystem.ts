// 区域系统：距离 ⇄ 区域 ⇄ 高度，荒诞区域无限生成
import { ZONES, ABSURD_LENGTH, OBSERVABLE_END_LOG, type ZoneDef } from '../config/zones'
import { THEMES, SPECIAL_ZONES } from '../config/themes'
import { hashInt } from '../art/pixel'

export interface ZoneInfo extends ZoneDef {
  index: number // 0 起
  start: number // 起始距离
  startLog: number
  endLog: number
}

const STATIC_STARTS: number[] = []
let acc = 0
for (const z of ZONES) {
  STATIC_STARTS.push(acc)
  acc += z.length
}
export const STATIC_END = acc

export class ZoneSystem {
  private cache = new Map<number, ZoneInfo>()
  constructor(public seed: number) {}

  indexAt(distance: number): number {
    if (distance >= STATIC_END) return ZONES.length + Math.floor((distance - STATIC_END) / ABSURD_LENGTH)
    let i = ZONES.length - 1
    while (i > 0 && STATIC_STARTS[i] > distance) i--
    return i
  }

  zone(index: number): ZoneInfo {
    let z = this.cache.get(index)
    if (z) return z
    if (index < ZONES.length) {
      const d = ZONES[index]
      z = {
        ...d,
        index,
        start: STATIC_STARTS[index],
        startLog: d.startAlt > 0 ? Math.log10(d.startAlt) : -3,
        endLog: Math.log10(d.endAlt),
      }
    } else {
      z = this.absurd(index)
    }
    if (this.cache.size > 64) this.cache.clear()
    this.cache.set(index, z)
    return z
  }

  private absurd(index: number): ZoneInfo {
    const k = index - ZONES.length
    const special = SPECIAL_ZONES[index + 1]
    // 避免连续两个区域主题相同
    const pick = (i: number) => hashInt(i, this.seed) % THEMES.length
    let ti = pick(index)
    if (index > ZONES.length && ti === pick(index - 1)) ti = (ti + 1) % THEMES.length
    const theme = special ? THEMES.find((t) => t.id === special.themeId)! : THEMES[ti]
    const pal = theme.palettes[hashInt(index, this.seed + 7) % theme.palettes.length]
    return {
      name: special ? special.name : theme.name,
      startAlt: 0,
      endAlt: 0,
      length: ABSURD_LENGTH,
      sky: pal,
      stars: theme.stars,
      stage: 'absurd',
      spawns: theme.spawns,
      landmarks: theme.landmarks,
      jokes: special ? [...special.jokes, ...theme.jokes] : theme.jokes,
      themeId: theme.id,
      events: theme.events,
      index,
      start: STATIC_END + k * ABSURD_LENGTH,
      startLog: OBSERVABLE_END_LOG + k,
      endLog: OBSERVABLE_END_LOG + k + 1,
    }
  }

  /** 区域内进度 0~1 */
  progress(distance: number, z = this.zone(this.indexAt(distance))) {
    return Math.min(1, Math.max(0, (distance - z.start) / z.length))
  }

  /** log10(高度米) */
  altitudeLog(distance: number): number {
    const z = this.zone(this.indexAt(distance))
    const t = this.progress(distance, z)
    if (z.index === 0) return Math.log10(Math.max(1e-3, z.endAlt * t))
    return z.startLog + (z.endLog - z.startLog) * t
  }

  /** log10(速度 m/s)，v 为像素速度 */
  speedLog(distance: number, v: number): number {
    if (v <= 0.5) return -Infinity
    const z = this.zone(this.indexAt(distance))
    if (z.index === 0) return Math.log10((v * z.endAlt) / z.length)
    const k = (z.endLog - z.startLog) / z.length
    return this.altitudeLog(distance) + Math.log10(Math.LN10 * k * v)
  }
}
