// 像素绘制工具：所有美术素材都在低分辨率画布上逐像素绘制，再由 Phaser 以最近邻方式放大。

export type Ctx = CanvasRenderingContext2D

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = false
  return [c, ctx]
}

export function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

/** 按字符图绘制，map 中每个字符对应调色板颜色，'.' 或空格为透明 */
export function drawMap(ctx: Ctx, ox: number, oy: number, map: string[], palette: Record<string, string>) {
  for (let y = 0; y < map.length; y++) {
    const row = map[y]
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.' || ch === ' ') continue
      const col = palette[ch]
      if (col) px(ctx, ox + x, oy + y, 1, 1, col)
    }
  }
}

/** 像素风实心圆 */
export function disc(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y + r * 0.6))
    ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1)
  }
}

/** 像素风圆环 */
export function ring(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string, steps = 200) {
  ctx.fillStyle = color
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    ctx.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1)
  }
}

/** 可复现随机数 */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashInt(n: number, seed = 0) {
  let h = (n * 374761393 + seed * 668265263) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return (h ^ (h >>> 16)) >>> 0
}

// 5x5 简化像素字
export const GLYPHS: Record<string, string[]> = {
  中: ['..#..', '#####', '#.#.#', '#####', '..#..'],
  国: ['#####', '#.#.#', '#####', '#..##', '#####'],
  發: ['#.#.#', '.###.', '#####', '.#.#.', '#.#.#'],
  万: ['#####', '.#...', '.####', '.#..#', '#..##'],
  '4': ['#..#.', '#..#.', '#####', '...#.', '...#.'],
  '0': ['.###.', '#..##', '#.#.#', '##..#', '.###.'],
}

export function drawGlyph(ctx: Ctx, ch: string, x: number, y: number, color: string, scale = 1) {
  const g = GLYPHS[ch]
  if (!g) return
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[r].length; c++) if (g[r][c] === '#') px(ctx, x + c * scale, y + r * scale, scale, scale, color)
}
