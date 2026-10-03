// 飞行系统：按住加速、松开缓慢减速漂浮，长按越久档位越高
export const HOLD_LEVELS = [1, 5, 10, 20, 30] // 秒：喷气 / 速度线 / 尾焰 / 残影 / 彩色爆发

export class FlightSystem {
  v = 0 // 像素速度 px/s
  distance = 0
  holding = false
  holdTime = 0
  flightTime = 0
  airborne = false
  boostTimer = 0
  slowTimer = 0 // 碰撞后的短暂减速

  get holdLevel() {
    let l = 0
    for (const t of HOLD_LEVELS) if (this.holdTime >= t) l++
    return l
  }

  vMax() {
    const h = this.holdTime
    return Math.min(3200, 380 + 1700 * (1 - Math.exp(-h / 14)) + 10 * h)
  }

  update(dt: number) {
    if (this.holding) {
      this.holdTime += dt
      const target = this.vMax() * (this.slowTimer > 0 ? 0.75 : 1)
      this.v += (target - this.v) * Math.min(1, 1.8 * dt)
      if (!this.airborne) this.airborne = true
    } else {
      this.holdTime = 0
      // 松开：缓慢回落到漂浮速度，不会立刻停止
      const floor = this.airborne ? 30 : 0
      this.v = floor + (this.v - floor) * Math.exp(-0.55 * dt)
    }
    if (this.slowTimer > 0) this.slowTimer -= dt
    this.distance += this.v * dt
    if (this.airborne) this.flightTime += dt
  }

  bump() {
    this.v *= 0.85
    this.slowTimer = 0.6
  }
}
