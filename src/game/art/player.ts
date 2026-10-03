// 主角像素小人：参考图提炼特征 —— 短黑发、绿色运动服、白色拉链与袖线、胸前"中国"、白色内搭、挂绳哨子
import { makeCanvas, px, drawMap, drawGlyph, type Ctx } from './pixel'

export const PLAYER_W = 34 // 32×48 逻辑尺寸 + 1px 描边留白
export const PLAYER_H = 50

export type Pose = 'idle' | 'ready' | 'fly' | 'fast_fly' | 'space_fly' | 'boost' | 'hit_recover'
export const POSE_FRAMES: Record<Pose, number> = {
  idle: 2,
  ready: 1,
  fly: 2,
  fast_fly: 2,
  space_fly: 2,
  boost: 2,
  hit_recover: 2,
}

const C = {
  hair: '#141414',
  hairHi: '#33343a',
  skin: '#e8b38a',
  skinShade: '#c88d66',
  brow: '#0e0e0e',
  eye: '#161616',
  mouth: '#9c5f45',
  green: '#1d7b50',
  greenDark: '#135737',
  greenLight: '#2b9a67',
  white: '#f5f5ee',
  whiteShade: '#d6d8d0',
  lanyard: '#d9c27e',
  shoe: '#f0f0ea',
  sole: '#8d8f94',
}

const HEAD = [
  '...HHHHHH...',
  '..HHHhhHHHH.',
  '.HHHHHHHHHHH',
  '.HHHHHHHHHHH',
  'HHSHHHSSHHHH',
  'HSSSSSSSSSSH',
  'HSBBBSSBBBSH',
  'sSSESSSSESSs',
  'sSSSSSNSSSSs',
  '.SSSSSNSSSS.',
  '.SSSMMMMSSS.',
  '..SSSSSSSS..',
  '...ssssss...',
]
const HEAD_HIT = [
  '...HHHHHH...',
  '..HHHhhHHHH.',
  '.HHHHHHHHHHH',
  '.HHHHHHHHHHH',
  'HHSHHHSSHHHH',
  'HSSSSSSSSSSH',
  'HSESESSESESH',
  'sSSESSSSESSs',
  'sSESESSESESs',
  '.SSSSSNSSSS.',
  '.SSSSMMSSSS.',
  '..SSSMMSSS..',
  '...ssssss...',
]
const HEAD_PAL = {
  H: C.hair,
  h: C.hairHi,
  S: C.skin,
  s: C.skinShade,
  B: C.brow,
  E: C.eye,
  N: C.skinShade,
  M: C.mouth,
}

function head(ctx: Ctx, oy: number, hit = false, dx = 0) {
  drawMap(ctx, 10 + dx, oy, hit ? HEAD_HIT : HEAD, HEAD_PAL)
  // 脖子
  px(ctx, 14 + dx, oy + 13, 4, 1, C.skinShade)
}

function torso(ctx: Ctx, t0: number, flap: number, hemFlare = 0) {
  px(ctx, 8, t0, 16, 16, C.green)
  // 肩部圆角
  px(ctx, 8, t0, 1, 1, 'rgba(0,0,0,0)')
  ctx.clearRect(8, t0, 1, 1)
  ctx.clearRect(23, t0, 1, 1)
  // 侧面阴影
  px(ctx, 8, t0 + 1, 1, 15, C.greenDark)
  px(ctx, 22, t0 + 1, 2, 15, C.greenDark)
  px(ctx, 9, t0 + 1, 1, 14, C.greenLight)
  // 肩线（白色边线）
  px(ctx, 9, t0, 3, 1, C.white)
  px(ctx, 20, t0, 3, 1, C.white)
  // 立领 + 白色内搭
  px(ctx, 12, t0, 2, 2, C.greenLight)
  px(ctx, 18, t0, 2, 2, C.greenLight)
  px(ctx, 12, t0, 1, 1, C.white)
  px(ctx, 19, t0, 1, 1, C.white)
  px(ctx, 14, t0, 4, 1, C.white)
  px(ctx, 15, t0 + 1, 2, 2, C.white)
  px(ctx, 14, t0 + 1, 1, 1, C.whiteShade)
  // 拉链
  px(ctx, 16, t0 + 3, 1, 12, C.white)
  px(ctx, 15, t0 + 3, 1, 12, C.greenDark)
  px(ctx, 17, t0 + 3, 1, 1, C.whiteShade)
  // 挂绳哨子
  px(ctx, 13, t0 + 2, 1, 1, C.lanyard)
  px(ctx, 14, t0 + 3, 1, 3, C.lanyard)
  px(ctx, 14, t0 + 6, 1, 2, C.white)
  // 胸前"中国"
  drawGlyph(ctx, '中', 9, t0 + 5, C.white)
  drawGlyph(ctx, '国', 18, t0 + 5, C.white)
  // 下摆松紧带
  px(ctx, 8, t0 + 15, 16, 1, C.greenDark)
  // 衣角摆动
  if (flap === 1) {
    px(ctx, 7, t0 + 13, 1, 3, C.greenDark)
    ctx.clearRect(23, t0 + 15, 1, 1)
  } else if (flap === 2) {
    px(ctx, 24, t0 + 13, 1, 3, C.greenDark)
    ctx.clearRect(8, t0 + 15, 1, 1)
  }
  if (hemFlare) {
    const f = hemFlare
    px(ctx, 8 - f, t0 + 12, f, 4, C.green)
    px(ctx, 24, t0 + 12, f, 4, C.green)
    px(ctx, 8 - f, t0 + 15, f, 1, C.white)
    px(ctx, 24, t0 + 15, f, 1, C.white)
  }
}

/** 竖直手臂：x 为左列，从 y0 到 y1（含），fistTop 表示拳头在上方 */
function armVertical(ctx: Ctx, x: number, y0: number, y1: number, fistTop: boolean) {
  px(ctx, x, y0, 3, y1 - y0 + 1, C.green)
  px(ctx, x + 1, y0, 1, y1 - y0 + 1, C.white)
  if (fistTop) {
    px(ctx, x, y0, 3, 1, C.greenDark)
    px(ctx, x - (x < 16 ? 0 : 0), y0 - 3, 3, 3, C.skin)
    px(ctx, x, y0 - 1, 3, 1, C.skinShade)
  } else {
    px(ctx, x, y1, 3, 1, C.greenDark)
    px(ctx, x, y1 + 1, 3, 2, C.skin)
    px(ctx, x, y1 + 2, 3, 1, C.skinShade)
  }
}

/** 斜线手臂（准备/碰撞动作）：从 (sx,sy) 每步 (dx,dy) 共 n 步 */
function armDiag(ctx: Ctx, sx: number, sy: number, dx: number, dy: number, n: number) {
  let x = sx
  let y = sy
  for (let i = 0; i < n; i++) {
    px(ctx, x, y, 3, 3, C.green)
    px(ctx, x + 1, y + 1, 1, 1, C.white)
    x += dx
    y += dy
  }
  px(ctx, x, y, 3, 3, C.skin)
}

function legsStanding(ctx: Ctx, y0: number, len: number) {
  // 裆部
  px(ctx, 10, y0, 12, 2, C.green)
  px(ctx, 10, y0, 5, len, C.green)
  px(ctx, 17, y0, 5, len, C.green)
  px(ctx, 10, y0, 1, len, C.white)
  px(ctx, 21, y0, 1, len, C.white)
  px(ctx, 14, y0 + 2, 1, len - 2, C.greenDark)
  px(ctx, 17, y0 + 2, 1, len - 2, C.greenDark)
  // 鞋
  const sy = y0 + len
  px(ctx, 9, sy, 6, 2, C.shoe)
  px(ctx, 17, sy, 6, 2, C.shoe)
  px(ctx, 9, sy + 2, 6, 1, C.sole)
  px(ctx, 17, sy + 2, 6, 1, C.sole)
}

/** 飞行时的腿：双脚后摆、脚尖朝下，frame 控制一侧屈膝 */
function legsFlying(ctx: Ctx, y0: number, len: number, frame: number, spread = 0) {
  px(ctx, 11, y0, 10, 2, C.green)
  const lx = 11 - spread
  const rx = 16 + spread
  const lLen = frame === 1 ? len - 2 : len
  const rLen = frame === 0 ? len - 2 : len
  px(ctx, lx, y0, 5, lLen, C.green)
  px(ctx, rx, y0, 5, rLen, C.green)
  px(ctx, lx, y0, 1, lLen, C.white)
  px(ctx, rx + 4, y0, 1, rLen, C.white)
  px(ctx, lx + 4, y0 + 2, 1, lLen - 2, C.greenDark)
  px(ctx, rx, y0 + 2, 1, rLen - 2, C.greenDark)
  // 脚尖朝下的鞋
  px(ctx, lx + 1, y0 + lLen, 4, 2, C.shoe)
  px(ctx, lx + 2, y0 + lLen + 2, 2, 1, C.sole)
  px(ctx, rx, y0 + rLen, 4, 2, C.shoe)
  px(ctx, rx + 1, y0 + rLen + 2, 2, 1, C.sole)
}

function outline(ctx: Ctx, color: string, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const a = img.data
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 0
  const marks: number[] = []
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) marks.push(x, y)
  ctx.fillStyle = color
  for (let i = 0; i < marks.length; i += 2) ctx.fillRect(marks[i], marks[i + 1], 1, 1)
}

export function drawPlayer(ctx: Ctx, pose: Pose, frame: number) {
  ctx.save()
  ctx.translate(1, 1)
  switch (pose) {
    case 'idle': {
      const b = frame // 呼吸起伏
      head(ctx, 3 + b)
      torso(ctx, 17 + b, 0)
      armVertical(ctx, 5, 18 + b, 30, false)
      armVertical(ctx, 24, 18 + b, 30, false)
      legsStanding(ctx, 33, 12)
      break
    }
    case 'ready': {
      head(ctx, 7)
      torso(ctx, 21, 0)
      armDiag(ctx, 6, 22, -1, 2, 4)
      armDiag(ctx, 23, 22, 1, 2, 4)
      // 屈膝下蹲
      px(ctx, 9, 37, 14, 2, C.green)
      px(ctx, 8, 37, 5, 7, C.green)
      px(ctx, 19, 37, 5, 7, C.green)
      px(ctx, 8, 37, 1, 7, C.white)
      px(ctx, 23, 37, 1, 7, C.white)
      px(ctx, 7, 44, 7, 2, C.shoe)
      px(ctx, 18, 44, 7, 2, C.shoe)
      px(ctx, 7, 46, 7, 1, C.sole)
      px(ctx, 18, 46, 7, 1, C.sole)
      break
    }
    case 'fly': {
      head(ctx, 8)
      torso(ctx, 22, frame + 1)
      armVertical(ctx, 24, 6, 23, true) // 单拳举过头顶
      armVertical(ctx, 5, 23, 34, false)
      legsFlying(ctx, 38, 7, frame)
      break
    }
    case 'fast_fly':
    case 'space_fly':
    case 'boost': {
      head(ctx, 8)
      torso(ctx, 22, frame + 1, pose === 'boost' ? 1 + frame : 0)
      armVertical(ctx, 6, 5, 23, true)
      armVertical(ctx, 23, 5, 23, true)
      legsFlying(ctx, 38, 7, frame)
      break
    }
    case 'hit_recover': {
      head(ctx, 6, true, frame ? 1 : -1)
      torso(ctx, 20, frame + 1)
      armDiag(ctx, 6, 20, -2, frame ? -1 : 1, 3)
      armDiag(ctx, 23, 20, 2, frame ? 1 : -1, 3)
      legsFlying(ctx, 36, 8, frame, 2)
      break
    }
  }
  ctx.restore()
  outline(ctx, pose === 'space_fly' ? '#7ff6ff' : pose === 'boost' ? '#ffe36b' : '#08251a', PLAYER_W, PLAYER_H)
}

export function playerCanvas(pose: Pose, frame: number) {
  const [c, ctx] = makeCanvas(PLAYER_W, PLAYER_H)
  drawPlayer(ctx, pose, frame)
  return c
}
