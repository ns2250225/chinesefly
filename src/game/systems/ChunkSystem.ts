// Chunk 系统：纵向按 2048px 分块，动态生成上方区块内容，下方离屏即回收
import Phaser from 'phaser'
import { mulberry32, hashInt } from '../art/pixel'
import type { SpawnEntry, Landmark } from '../config/zones'
import { ObjectPool, BackgroundObject } from '../entities/BackgroundObject'
import type { ZoneSystem } from './ZoneSystem'

export const CHUNK = 2048
const MAX_OBJECTS = { high: 140, medium: 90, low: 50 }

export interface ChunkCtx {
  w: number
  h: number
  playerY: number
  S: number
  density: number
  quality: 'high' | 'medium' | 'low'
}

export class ChunkSystem {
  pool: ObjectPool
  private lastChunk = -1
  private landmarkDone = new Set<string>()

  constructor(
    private scene: Phaser.Scene,
    private zones: ZoneSystem,
    private seed: number,
  ) {
    this.pool = new ObjectPool(scene)
  }

  reset() {
    this.pool.clear()
    this.lastChunk = -1
    this.landmarkDone.clear()
  }

  update(dt: number, scroll: number, distance: number, c: ChunkCtx) {
    this.pool.update(dt, scroll, c.w, c.h)
    // 只保留当前块与上方待进入块（跳跃式前进时直接跳过已经错过的块）
    if ((this.lastChunk + 1) * CHUNK < distance - CHUNK) this.lastChunk = Math.floor(distance / CHUNK) - 1
    while ((this.lastChunk + 1) * CHUNK < distance + c.h * 1.5) {
      this.lastChunk++
      this.spawnChunk(this.lastChunk, distance, c)
    }
    this.checkLandmarks(distance, c)
  }

  private spawnChunk(k: number, distance: number, c: ChunkCtx) {
    const rnd = mulberry32(hashInt(k, this.seed))
    const d0 = k * CHUNK
    const z = this.zones.zone(this.zones.indexAt(d0 + CHUNK / 2))
    const t = this.zones.progress(d0 + CHUNK / 2, z)
    const max = MAX_OBJECTS[c.quality]
    for (const e of z.spawns) {
      if (e.range && (t < e.range[0] || t > e.range[1])) continue
      if (c.quality === 'low' && e.add && e.key.startsWith('nebula')) continue
      let n = Math.floor(e.density * c.density * (z.stage === 'absurd' ? 1.4 : 1) + rnd())
      while (n-- > 0 && this.pool.count < max) {
        const objDist = d0 + rnd() * CHUNK
        this.spawn(e, objDist, distance, c, rnd)
      }
    }
  }

  private spawn(e: SpawnEntry, objDist: number, distance: number, c: ChunkCtx, rnd: () => number) {
    const r = (a?: [number, number], def = 1) => (a ? a[0] + (a[1] - a[0]) * rnd() : def)
    const p = r(e.p)
    const scale = r(e.scale) * c.S
    const x = e.xs ? e.xs[Math.floor(rnd() * e.xs.length)] * c.w : rnd() * c.w
    const o = this.pool.get()
    let y = c.playerY - (objDist - distance) * p
    o.setup(e.key, !!e.anim, x, y, scale)
    // 防止远景物体凭空出现在屏幕内
    const half = o.displayHeight / 2 + 20
    if (y > -half) o.y = -half - rnd() * 200
    o.p = p
    o.vx = e.vx ? r(e.vx) * (rnd() < 0.5 ? -1 : 1) : 0
    o.vy = e.vy ? r(e.vy) : 0
    if (e.vy && o.vy < 0) o.setFlipY(true)
    else o.setFlipY(false)
    o.spin = e.spin ? (rnd() * 2 - 1) * e.spin : 0
    if (e.rot) o.rotation = rnd() * Math.PI * 2
    if (e.alpha) o.setAlpha(r(e.alpha))
    if (e.tints) o.setTint(e.tints[Math.floor(rnd() * e.tints.length)])
    if (e.flip || (e.vx && o.vx < 0 && (e.key === 'bird' || e.key === 'plane' || e.key === 'fish' || e.key === 'comet')))
      o.setFlipX(e.flip ? rnd() < 0.5 : true)
    if (e.add) o.setBlendMode(Phaser.BlendModes.ADD)
    o.bump = !!e.bump
    o.setDepth(p < 0.5 ? 3 : p <= 1.05 ? 5 : 14)
    if (e.labels && rnd() < 0.8) o.attachLabel(e.labels[Math.floor(rnd() * e.labels.length)])
  }

  private checkLandmarks(distance: number, c: ChunkCtx) {
    const i0 = this.zones.indexAt(distance)
    for (let i = i0; i <= i0 + 1; i++) {
      const z = this.zones.zone(i)
      z.landmarks?.forEach((l, j) => {
        const id = `${i}:${j}`
        if (this.landmarkDone.has(id)) return
        const dist = z.start + l.at * z.length
        const y = c.playerY - (dist - distance) * l.p
        if (y < -c.h * 0.2) {
          // 还没进入视野
          const tex = this.scene.textures.get(l.anim ? l.key + '_0' : l.key).getSourceImage() as HTMLCanvasElement
          const half = (tex.height * l.scale * c.S) / 2
          if (y + half < -20) return
        }
        this.landmarkDone.add(id)
        if (y > c.h + 200) return // 已错过（例如重开后跳过）
        this.spawnLandmark(l, y, c)
      })
    }
  }

  private spawnLandmark(l: Landmark, y: number, c: ChunkCtx): BackgroundObject {
    const o = this.pool.get()
    o.setup(l.key, !!l.anim, l.x * c.w, y, l.scale * c.S)
    o.p = l.p
    o.spin = l.spin ?? 0
    if (l.tint) o.setTint(l.tint)
    if (l.alpha) o.setAlpha(l.alpha)
    o.setDepth(3)
    if (l.label) o.attachLabel(l.label)
    return o
  }

  forEachBump(fn: (o: BackgroundObject) => void) {
    for (const o of this.pool.live) if (o.bump && !o.hitDone) fn(o)
  }
}
