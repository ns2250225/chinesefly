// 高度与速度的趣味显示
const LY = 9.461e15
const AU = 1.496e11
const C = 2.998e8
const LOG_LY = Math.log10(LY)

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUP[+d] ?? d)
    .join('')

function num(v: number, digits = 0) {
  return v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function cnBig(v: number, unit: string) {
  if (v < 10) return `${num(v, 2)} ${unit}`
  if (v < 1e4) return `${num(v)} ${unit}`
  if (v < 1e8) return `${num(v / 1e4, 1)} 万${unit}`
  if (v < 1e12) return `${num(v / 1e8, 1)} 亿${unit}`
  if (v < 1e16) return `${num(v / 1e12, 1)} 万亿${unit}`
  return ''
}

/** altLog = log10(米) */
export function formatAltitude(altLog: number): string {
  if (!isFinite(altLog) || altLog < -1) return '0 m'
  const m = altLog < 300 ? Math.pow(10, altLog) : Infinity
  if (m < 1000) return `${num(m)} m`
  const km = m / 1000
  if (km < 1e9) return `${num(km)} km`
  const ly = m / LY
  if (ly < 0.05) return `${num(m / AU, 1)} AU`
  const s = isFinite(ly) ? cnBig(ly, '光年') : ''
  if (s) return s
  const e = Math.floor(altLog - LOG_LY)
  const mant = Math.pow(10, altLog - LOG_LY - e)
  return `${mant.toFixed(1)}×10${sup(e)} 光年`
}

const GALAXY_LY = 1e5
const JOKE_UNITS = ['????', '快到看不清', '∞ km/h', '超出显示范围', '!@#$%', '???c']

/** speedLog = log10(米/秒)，返回 [显示值, 档位名] */
export function formatSpeed(speedLog: number, glitchSeed = 0): [string, string] {
  if (!isFinite(speedLog) || speedLog < -2) return ['0 km/h', '漂浮']
  const ms = speedLog < 300 ? Math.pow(10, speedLog) : Infinity
  const kmh = ms * 3.6
  const mach = ms / 343
  if (mach < 1) return [`${num(kmh)} km/h`, '普通飞行']
  if (mach < 25) return [`Mach ${mach < 10 ? num(mach, 1) : num(mach)}`, mach < 5 ? '高速飞行' : '超高速飞行']
  const c = ms / C
  if (c < 0.05) return [`${num(kmh)} km/h`, c < 0.00003 ? '超高速飞行' : '太空推进']
  if (c < 1) return [`${num(c, 2)}c`, '太空推进']
  if (c < 3e7) return [`${num(c)}c`, '超光速']
  const lys = ms / LY
  if (lys < 1e5) return [`${num(lys, lys < 10 ? 1 : 0)} 光年/秒`, '离谱推进']
  const gal = lys / GALAXY_LY
  if (gal < 1e8) return [`${num(gal, gal < 10 ? 1 : 0)} 个银河系/秒`, '离谱推进']
  return [JOKE_UNITS[glitchSeed % JOKE_UNITS.length], '??? 模式']
}

export function isLightspeed(speedLog: number) {
  return speedLog >= Math.log10(C)
}

export function formatTime(s: number) {
  s = Math.floor(s)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m < 60) return `${m}分${String(r).padStart(2, '0')}秒`
  return `${Math.floor(m / 60)}时${String(m % 60).padStart(2, '0')}分`
}
