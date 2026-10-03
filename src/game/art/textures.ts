// 场景与事件物体的像素纹理（运行时生成）
import { makeCanvas, px, disc, ring, drawGlyph, mulberry32, type Ctx } from './pixel'
import { playerCanvas, POSE_FRAMES, type Pose } from './player'

type Painter = [number, number, (ctx: Ctx, w: number, h: number) => void]

const T: Record<string, Painter> = {}
function def(key: string, w: number, h: number, fn: (ctx: Ctx, w: number, h: number) => void) {
  T[key] = [w, h, fn]
}

// ───────────── 通用 ─────────────
def('dot', 2, 2, (c) => px(c, 0, 0, 2, 2, '#fff'))
def('spark', 4, 4, (c) => {
  px(c, 1, 0, 2, 4, '#fff')
  px(c, 0, 1, 4, 2, '#fff')
})
def('puff', 8, 8, (c) => disc(c, 4, 4, 3, '#fff'))
def('line', 2, 32, (c) => {
  for (let y = 0; y < 32; y++) px(c, 0, y, 2, 1, `rgba(255,255,255,${(y / 32).toFixed(2)})`)
})
def('white', 4, 4, (c) => px(c, 0, 0, 4, 4, '#fff'))

function starTile(seed: number, count: number, big: boolean) {
  return (c: Ctx, w: number, h: number) => {
    const r = mulberry32(seed)
    const cols = ['#ffffff', '#cfe3ff', '#fff2c4', '#ffd2e6', '#c4fff3']
    for (let i = 0; i < count; i++) {
      const x = Math.floor(r() * w)
      const y = Math.floor(r() * h)
      const col = cols[Math.floor(r() * cols.length)]
      if (big && r() < 0.25) {
        px(c, x - 1, y, 3, 1, col)
        px(c, x, y - 1, 1, 3, col)
      } else px(c, x, y, 1, 1, col)
    }
  }
}
def('stars_far', 256, 256, starTile(7, 140, false))
def('stars_near', 256, 256, starTile(99, 40, true))

// ───────────── Zone 01 天安门广场 ─────────────
def('ground', 32, 16, (c) => {
  px(c, 0, 0, 32, 16, '#b9b6ae')
  px(c, 0, 0, 32, 1, '#d6d3cb')
  px(c, 0, 8, 32, 1, '#a19e96')
  px(c, 15, 0, 1, 8, '#a19e96')
  px(c, 7, 8, 1, 8, '#a19e96')
  px(c, 23, 8, 1, 8, '#a19e96')
  px(c, 4, 3, 1, 1, '#c9c6be')
  px(c, 26, 11, 1, 1, '#c9c6be')
})

def('tiananmen', 168, 84, (c) => {
  const red = '#b5262b',
    dred = '#801b1e',
    yel = '#f1b42f',
    oy = '#c9851c',
    dark = '#3b1212'
  // 城台
  px(c, 4, 46, 160, 38, red)
  px(c, 4, 46, 160, 2, dred)
  px(c, 4, 80, 160, 4, '#8f8a82')
  // 五个门洞
  const doors = [22, 50, 76, 102, 130]
  doors.forEach((x, i) => {
    const w = i === 2 ? 16 : 12
    const top = i === 2 ? 58 : 62
    px(c, x, top + 3, w, 84 - top - 7, dark)
    px(c, x + 2, top, w - 4, 3, dark)
  })
  // 两侧标语牌
  px(c, 8, 54, 10, 20, '#f2efe2')
  px(c, 150, 54, 10, 20, '#f2efe2')
  for (let y = 56; y < 72; y += 3) {
    px(c, 10, y, 6, 1, '#c33')
    px(c, 152, y, 6, 1, '#c33')
  }
  // 汉白玉栏杆
  px(c, 4, 42, 160, 4, '#ece9df')
  for (let x = 6; x < 164; x += 5) px(c, x, 40, 2, 2, '#ece9df')
  // 城楼柱廊
  px(c, 22, 26, 124, 16, red)
  for (let x = 24; x < 146; x += 9) px(c, x, 26, 2, 16, dred)
  px(c, 22, 26, 124, 2, '#2f6c5c')
  // 中央匾额
  px(c, 76, 30, 16, 8, yel)
  px(c, 78, 32, 12, 4, dred)
  // 下檐
  for (let i = 0; i < 6; i++) px(c, 12 - i, 20 + i, 144 + i * 2, 1, i % 2 ? yel : oy)
  px(c, 6, 25, 4, 1, yel)
  px(c, 158, 25, 4, 1, yel)
  px(c, 4, 24, 2, 1, yel)
  px(c, 162, 24, 2, 1, yel)
  // 上层
  px(c, 32, 12, 104, 8, red)
  for (let x = 34; x < 136; x += 8) px(c, x, 12, 2, 8, dred)
  // 上檐
  for (let i = 0; i < 6; i++) px(c, 26 - i, 4 + i, 116 + i * 2, 1, i % 2 ? yel : oy)
  px(c, 18, 9, 3, 1, yel)
  px(c, 147, 9, 3, 1, yel)
  // 正脊与鸱吻
  px(c, 30, 2, 108, 2, oy)
  px(c, 28, 0, 3, 3, yel)
  px(c, 137, 0, 3, 3, yel)
  // 红灯笼
  for (const x of [30, 52, 116, 138]) {
    px(c, x, 26, 4, 5, '#e3262a')
    px(c, x + 1, 25, 2, 1, yel)
    px(c, x + 1, 31, 2, 1, yel)
  }
})

def('flag_0', 26, 18, (c) => flag(c, 0))
def('flag_1', 26, 18, (c) => flag(c, 1))
function flag(c: Ctx, f: number) {
  for (let x = 0; x < 26; x++) {
    const off = Math.round(Math.sin(x / 4 + f * 2) * 1.2)
    px(c, x, 1 + off, 1, 15, '#de2910')
  }
  const y = (x: number) => Math.round(Math.sin(x / 4 + f * 2) * 1.2)
  const star = (x: number, yy: number, big: boolean) => {
    if (big) {
      px(c, x + 1, yy + y(x), 1, 5, '#ffde00')
      px(c, x - 1, yy + 2 + y(x), 5, 1, '#ffde00')
      px(c, x, yy + 1 + y(x), 3, 3, '#ffde00')
    } else px(c, x, yy + y(x), 1, 1, '#ffde00')
  }
  star(3, 3, true)
  star(9, 2, false)
  star(11, 4, false)
  star(11, 7, false)
  star(9, 9, false)
}
def('flagpole', 3, 130, (c) => {
  px(c, 1, 2, 1, 128, '#e2e2e2')
  px(c, 0, 0, 3, 2, '#f1d36b')
})
def('huabiao', 12, 64, (c) => {
  px(c, 4, 8, 4, 50, '#eeebe2')
  px(c, 5, 8, 1, 50, '#d2cfc5')
  px(c, 1, 12, 10, 2, '#eeebe2') // 云板
  px(c, 2, 4, 8, 4, '#eeebe2')
  px(c, 4, 1, 4, 3, '#d9d5ca')
  px(c, 2, 58, 8, 6, '#cfcabe')
  for (let y = 18; y < 56; y += 6) px(c, 4, y, 4, 1, '#cfcac0')
})
def('lamp', 10, 50, (c) => {
  px(c, 4, 6, 2, 44, '#3d3d3d')
  px(c, 0, 4, 10, 2, '#3d3d3d')
  px(c, 0, 6, 3, 3, '#ffeeb0')
  px(c, 7, 6, 3, 3, '#ffeeb0')
  px(c, 3, 0, 4, 4, '#ffeeb0')
})
def('pigeon_0', 9, 6, (c) => bird(c, 0, '#f2f2f2', '#b8b8c0'))
def('pigeon_1', 9, 6, (c) => bird(c, 1, '#f2f2f2', '#b8b8c0'))
def('bird_0', 9, 6, (c) => bird(c, 0, '#2c2c34', '#4a4a56'))
def('bird_1', 9, 6, (c) => bird(c, 1, '#2c2c34', '#4a4a56'))
function bird(c: Ctx, f: number, a: string, b: string) {
  px(c, 3, 3, 4, 2, a)
  px(c, 7, 2, 2, 2, a)
  px(c, 8, 3, 1, 1, '#f0a020')
  if (f === 0) {
    px(c, 2, 1, 2, 2, b)
    px(c, 0, 0, 2, 1, b)
    px(c, 5, 1, 2, 2, b)
  } else {
    px(c, 1, 5, 3, 1, b)
    px(c, 4, 5, 2, 1, b)
  }
  px(c, 1, 3, 2, 1, b)
}

// 北京城市剪影
def('skyline', 200, 90, (c) => {
  const r = mulberry32(2024)
  let x = 0
  while (x < 200) {
    const w = 8 + Math.floor(r() * 16)
    const h = 20 + Math.floor(r() * 50)
    const col = ['#5d6f86', '#6b7c93', '#52637a'][Math.floor(r() * 3)]
    px(c, x, 90 - h, w, h, col)
    for (let wy = 90 - h + 3; wy < 88; wy += 4)
      for (let wx = x + 2; wx < x + w - 2; wx += 3) if (r() < 0.55) px(c, wx, wy, 1, 2, '#b9c8d9')
    x += w + Math.floor(r() * 3)
  }
  // 中央电视塔
  px(c, 150, 10, 3, 80, '#7b8aa0')
  px(c, 147, 22, 9, 6, '#8e9db3')
  px(c, 151, 0, 1, 10, '#7b8aa0')
  // "大裤衩"
  px(c, 40, 22, 22, 6, '#41536b')
  px(c, 40, 22, 6, 68, '#41536b')
  px(c, 56, 22, 6, 68, '#41536b')
  px(c, 46, 70, 10, 6, '#41536b')
})
def('skyline_far', 200, 60, (c) => {
  const r = mulberry32(77)
  let x = 0
  while (x < 200) {
    const w = 6 + Math.floor(r() * 12)
    const h = 10 + Math.floor(r() * 40)
    px(c, x, 60 - h, w, h, '#8fa3bd')
    x += w
  }
})

def('kite_0', 14, 30, (c) => kite(c, 0))
def('kite_1', 14, 30, (c) => kite(c, 1))
function kite(c: Ctx, f: number) {
  for (let i = 0; i < 7; i++) {
    px(c, 7 - i, i, i * 2 + 1, 1, i < 3 ? '#e8333a' : '#f4c430')
    px(c, 7 - i, 13 - i, i * 2 + 1, 1, i < 3 ? '#2a7de1' : '#f4c430')
  }
  px(c, 7, 0, 1, 14, '#5a3a1a')
  for (let y = 14; y < 30; y++) px(c, 7 + Math.round(Math.sin(y / 3 + f * 3) * 2), y, 1, 1, '#e8333a')
}
def('drone_0', 16, 8, (c) => drone(c, 0))
def('drone_1', 16, 8, (c) => drone(c, 1))
function drone(c: Ctx, f: number) {
  px(c, 5, 3, 6, 3, '#e6e6e6')
  px(c, 7, 6, 2, 2, '#222')
  px(c, 2, 2, 12, 1, '#888')
  const w = f ? 4 : 2
  px(c, 3 - w / 2, 1, w, 1, '#aaa')
  px(c, 13 - w / 2, 1, w, 1, '#aaa')
  px(c, 7, 4, 1, 1, '#f33')
}
def('balloon', 22, 32, (c) => {
  disc(c, 11, 10, 10, '#e84a3c')
  for (let y = 0; y < 21; y++) {
    px(c, 7, y, 2, 1, '#f6c445')
    px(c, 14, y, 2, 1, '#f6c445')
  }
  px(c, 5, 18, 12, 2, '#e84a3c')
  px(c, 7, 20, 1, 6, '#5a3a1a')
  px(c, 14, 20, 1, 6, '#5a3a1a')
  px(c, 7, 26, 8, 5, '#9a6a3a')
  px(c, 7, 26, 8, 1, '#c08a50')
})
function cloud(c: Ctx, w: number, h: number, seed: number) {
  const r = mulberry32(seed)
  const n = Math.floor(w / 8)
  for (let i = 0; i < n; i++) {
    const cx = 6 + (i / n) * (w - 12) + r() * 4
    const rr = 3 + Math.floor(r() * (h / 3))
    disc(c, cx, h - rr - 2, rr, '#ffffff')
  }
  px(c, 4, h - 4, w - 8, 3, '#ffffff')
  for (let x = 4; x < w - 4; x++) px(c, x, h - 2, 1, 1, '#dfe8f2')
}
def('cloud_s', 36, 16, (c, w, h) => cloud(c, w, h, 1))
def('cloud_m', 64, 26, (c, w, h) => cloud(c, w, h, 2))
def('cloud_l', 110, 40, (c, w, h) => cloud(c, w, h, 3))

// ───────────── 平流层 ─────────────
def('plane', 50, 16, (c) => {
  px(c, 4, 6, 42, 5, '#f4f4f4')
  px(c, 44, 7, 4, 3, '#f4f4f4')
  px(c, 47, 8, 2, 1, '#cfd6de')
  px(c, 2, 1, 6, 6, '#c8202a') // 尾翼
  px(c, 4, 9, 42, 1, '#2952a3')
  for (let x = 12; x < 42; x += 3) px(c, x, 7, 1, 1, '#3a4a5e')
  px(c, 18, 10, 14, 2, '#d0d6de')
  px(c, 20, 12, 10, 3, '#c8ced6')
  px(c, 2, 9, 8, 2, '#d0d6de')
})
def('hballoon', 18, 34, (c) => {
  disc(c, 9, 8, 8, '#f3f3f3')
  px(c, 7, 16, 4, 3, '#f3f3f3')
  px(c, 9, 19, 1, 9, '#999')
  px(c, 6, 28, 7, 6, '#f08a24')
  px(c, 6, 28, 7, 1, '#ffb050')
})

// ───────────── 近地轨道 ─────────────
def('satellite', 34, 14, (c) => {
  px(c, 0, 3, 12, 8, '#2a4c9a')
  px(c, 22, 3, 12, 8, '#2a4c9a')
  for (let x = 1; x < 12; x += 3) {
    px(c, x, 3, 1, 8, '#4f78c8')
    px(c, x + 22, 3, 1, 8, '#4f78c8')
  }
  px(c, 12, 6, 10, 2, '#9aa')
  px(c, 13, 2, 8, 10, '#e2c26a')
  px(c, 13, 2, 8, 1, '#fff1b0')
  px(c, 16, 0, 2, 2, '#ddd')
})
def('station', 70, 34, (c) => {
  px(c, 4, 15, 62, 4, '#c9ccd2')
  px(c, 22, 10, 26, 14, '#e8e9ec')
  px(c, 22, 10, 26, 1, '#ffffff')
  px(c, 30, 2, 10, 30, '#d9dbe0')
  for (const x of [2, 12, 50, 60]) {
    px(c, x, 0, 8, 13, '#2c4f9e')
    px(c, x, 21, 8, 13, '#2c4f9e')
    px(c, x + 3, 0, 1, 34, '#6a8fd8')
  }
  px(c, 33, 12, 4, 3, '#de2910')
})
def('debris_0', 6, 5, (c) => {
  px(c, 0, 1, 5, 3, '#8b8f99')
  px(c, 2, 0, 3, 2, '#b9bdc6')
})
def('debris_1', 8, 4, (c) => {
  px(c, 0, 0, 8, 2, '#2c4f9e')
  px(c, 3, 2, 3, 2, '#999')
})
def('debris_2', 5, 5, (c) => {
  px(c, 1, 1, 3, 3, '#d4b45a')
  px(c, 0, 2, 1, 1, '#fff')
})
def('astronaut_0', 14, 18, (c) => astronaut(c, 0))
def('astronaut_1', 14, 18, (c) => astronaut(c, 1))
function astronaut(c: Ctx, f: number) {
  px(c, 3, 0, 8, 7, '#f2f2f2')
  px(c, 4, 2, 6, 3, '#2f4f86')
  px(c, 5, 2, 2, 1, '#9fd0ff')
  px(c, 3, 7, 8, 7, '#ececec')
  px(c, 6, 8, 2, 2, '#de2910')
  px(c, 4, 14, 2, 4, '#e2e2e2')
  px(c, 8, 14, 2, 4, '#e2e2e2')
  px(c, 0, 7, 3, 3, '#e2e2e2')
  if (f === 0) px(c, 11, 2, 3, 6, '#e2e2e2')
  else px(c, 11, 4, 3, 3, '#e2e2e2'), px(c, 12, 1, 2, 3, '#e2e2e2')
}

// ───────────── 太阳系 ─────────────
function planet(c: Ctx, w: number, base: string, bands: string[], seed: number) {
  const r = w / 2 - 1
  disc(c, w / 2, w / 2, r, base)
  const rnd = mulberry32(seed)
  ctx2Clip(c, w / 2, w / 2, r, () => {
    bands.forEach((b, i) => {
      const y = Math.floor(rnd() * w)
      px(c, 0, y, w, 1 + Math.floor(rnd() * 3) + (i % 2), b)
    })
  })
  // 暗面
  ctx2Clip(c, w / 2, w / 2, r, () => {
    c.fillStyle = 'rgba(0,0,20,0.35)'
    for (let y = 0; y < w; y++) {
      const x0 = w / 2 + Math.sqrt(Math.max(0, r * r - (y - w / 2) ** 2)) * 0.35
      c.fillRect(Math.round(x0), y, w, 1)
    }
  })
}
function ctx2Clip(c: Ctx, cx: number, cy: number, r: number, fn: () => void) {
  c.save()
  c.beginPath()
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y + r * 0.6))
    c.rect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1)
  }
  c.clip()
  fn()
  c.restore()
}
def('earth', 64, 64, (c) => {
  disc(c, 32, 32, 31, '#2a6fd6')
  ctx2Clip(c, 32, 32, 31, () => {
    const land = '#3fae4f'
    // 亚欧大陆（简化），中国位置点缀红色
    px(c, 14, 10, 30, 10, land)
    px(c, 20, 20, 22, 8, land)
    px(c, 30, 28, 8, 6, land)
    px(c, 40, 16, 10, 6, land)
    px(c, 8, 22, 8, 14, '#c8a25a')
    px(c, 10, 36, 6, 12, land)
    px(c, 46, 40, 10, 6, '#c8a25a')
    px(c, 33, 18, 6, 4, '#e23b2e')
    px(c, 0, 0, 64, 4, '#eef6ff')
    px(c, 0, 60, 64, 4, '#eef6ff')
    c.fillStyle = 'rgba(255,255,255,0.75)'
    for (const [x, y, w] of [
      [4, 30, 12],
      [24, 44, 16],
      [44, 26, 12],
      [18, 6, 10],
    ])
      c.fillRect(x, y, w, 2)
  })
  ring(c, 32, 32, 31, 31, '#9fd4ff', 300)
})
def('moon', 64, 64, (c) => {
  disc(c, 32, 32, 30, '#c9c9c4')
  ctx2Clip(c, 32, 32, 30, () => {
    const r = mulberry32(5)
    for (let i = 0; i < 18; i++) {
      const x = r() * 64,
        y = r() * 64,
        rr = 1 + Math.floor(r() * 5)
      disc(c, x, y, rr, '#a5a59f')
      disc(c, x - 1, y - 1, Math.max(0, rr - 1), '#b5b5af')
    }
    c.fillStyle = 'rgba(20,20,30,0.35)'
    for (let y = 0; y < 64; y++) c.fillRect(40 + Math.round(Math.abs(y - 32) * 0.2), y, 30, 1)
  })
})
def('sun_0', 72, 72, (c) => sun(c, 0))
def('sun_1', 72, 72, (c) => sun(c, 1))
function sun(c: Ctx, f: number) {
  const r = mulberry32(11 + f)
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2
    const len = 26 + r() * 9
    px(c, 36 + Math.cos(a) * len, 36 + Math.sin(a) * len, 2, 2, '#ffb030')
  }
  disc(c, 36, 36, 27, '#ff9a1f')
  disc(c, 36, 36, 24, '#ffc93a')
  disc(c, 33, 33, 15, '#ffe680')
  // 耀斑
  const a = f ? 0.8 : 3.6
  for (let i = 0; i < 7; i++) px(c, 36 + Math.cos(a) * (26 + i), 36 + Math.sin(a) * (26 + i) - i * 0.5, 3, 2, '#ff6a1a')
}
def('mercury', 14, 14, (c, w) => planet(c, w, '#9d9087', ['#7e746c'], 1))
def('venus', 22, 22, (c, w) => planet(c, w, '#e4c27a', ['#cfa45a', '#f3dca0'], 2))
def('mars', 20, 20, (c, w) => planet(c, w, '#c8532c', ['#a23d20', '#e07a4c'], 3))
def('jupiter', 56, 56, (c, w) =>
  planet(c, w, '#d9b48a', ['#b5815a', '#efd8b8', '#a8704a', '#c99a6a', '#efd8b8', '#9c6040'], 4),
)
def('saturn', 84, 44, (c) => {
  ring(c, 42, 22, 40, 10, '#d9c38a', 400)
  ring(c, 42, 22, 36, 8, '#bfa66c', 400)
  c.save()
  c.translate(20, 0)
  planet(c, 44, '#e6cf95', ['#c9ae6e', '#f2e2b5', '#bb9c5c'], 5)
  c.restore()
  // 前侧环
  for (let i = 0; i < 200; i++) {
    const a = (i / 200) * Math.PI
    px(c, 42 + Math.cos(a) * 40, 22 + Math.sin(a) * 10, 1, 1, '#d9c38a')
    px(c, 42 + Math.cos(a) * 36, 22 + Math.sin(a) * 8, 1, 1, '#bfa66c')
  }
})
def('uranus', 30, 30, (c, w) => planet(c, w, '#8fdde0', ['#a8eef0'], 6))
def('neptune', 30, 30, (c, w) => planet(c, w, '#3f63d8', ['#5a80ee', '#2c48b0'], 7))
for (let i = 0; i < 3; i++)
  def('asteroid_' + i, 12 + i * 4, 10 + i * 3, (c, w, h) => {
    const r = mulberry32(30 + i)
    for (let k = 0; k < 6; k++) disc(c, 3 + r() * (w - 6), 3 + r() * (h - 6), 2 + Math.floor(r() * 2), '#857565')
    for (let k = 0; k < 4; k++) px(c, 2 + r() * (w - 4), 2 + r() * (h - 4), 1, 1, '#a99886')
  })
def('comet', 48, 12, (c) => {
  for (let x = 0; x < 40; x++) {
    const a = (x / 40) * 0.8
    const hh = Math.max(1, Math.round((x / 40) * 5))
    c.fillStyle = `rgba(170,230,255,${a.toFixed(2)})`
    c.fillRect(x, 6 - hh / 2, 1, hh)
  }
  disc(c, 42, 6, 4, '#e8fbff')
  disc(c, 42, 6, 2, '#ffffff')
})
def('iceball', 16, 16, (c) => {
  disc(c, 8, 8, 6, '#bfe6ff')
  px(c, 5, 5, 3, 2, '#ffffff')
  px(c, 9, 10, 2, 2, '#8cc0e6')
})

// ───────────── 深空 ─────────────
function blob(c: Ctx, w: number, h: number, seed: number) {
  const r = mulberry32(seed)
  for (let i = 0; i < 26; i++) {
    const x = w * 0.15 + r() * w * 0.7
    const y = h * 0.15 + r() * h * 0.7
    const rr = 3 + Math.floor(r() * (Math.min(w, h) / 4))
    c.globalAlpha = 0.18 + r() * 0.2
    disc(c, x, y, rr, '#ffffff')
  }
  c.globalAlpha = 1
}
def('nebula_0', 72, 52, (c, w, h) => blob(c, w, h, 41))
def('nebula_1', 60, 60, (c, w, h) => blob(c, w, h, 42))
def('bigstar', 11, 11, (c) => {
  px(c, 5, 0, 1, 11, '#cfe3ff')
  px(c, 0, 5, 11, 1, '#cfe3ff')
  px(c, 4, 4, 3, 3, '#ffffff')
})
def('galaxy', 64, 64, (c) => {
  const r = mulberry32(8)
  for (let i = 0; i < 900; i++) {
    const arm = i % 2
    const t = r() * 4.2
    const a = t + arm * Math.PI + (r() - 0.5) * 0.5
    const d = t * 7 + r() * 3
    const x = 32 + Math.cos(a) * d
    const y = 32 + Math.sin(a) * d * 0.62
    c.globalAlpha = 0.5 + r() * 0.5
    px(c, x, y, 1, 1, r() < 0.3 ? '#ffd9f2' : r() < 0.5 ? '#bfe0ff' : '#ffffff')
  }
  c.globalAlpha = 1
  disc(c, 32, 32, 4, '#fff6d6')
  disc(c, 32, 32, 2, '#ffffff')
})
def('galaxy_e', 32, 22, (c) => {
  for (let i = 4; i >= 1; i--) {
    c.globalAlpha = 0.25 + (4 - i) * 0.2
    for (let y = -i * 2.5; y <= i * 2.5; y++) {
      const w = Math.sqrt(1 - (y / (i * 2.5 + 0.01)) ** 2) * i * 3.8
      px(c, 16 - w, 11 + y, w * 2, 1, '#ffe9c4')
    }
  }
  c.globalAlpha = 1
})
def('cluster', 26, 26, (c) => {
  const r = mulberry32(19)
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2
    const d = Math.pow(r(), 1.8) * 12
    px(c, 13 + Math.cos(a) * d, 13 + Math.sin(a) * d, 1, 1, r() < 0.5 ? '#fff3c8' : '#ffffff')
  }
})
def('filament', 128, 14, (c) => {
  for (let x = 0; x < 128; x++) {
    const y = 7 + Math.sin(x / 11) * 3 + Math.sin(x / 5) * 1
    c.globalAlpha = 0.25
    px(c, x, y - 2, 1, 5, '#9ad8ff')
    c.globalAlpha = 0.9
    px(c, x, y, 1, 1, '#e6f6ff')
  }
  c.globalAlpha = 1
})
def('node', 20, 20, (c) => {
  for (let i = 9; i > 0; i -= 2) {
    c.globalAlpha = 0.15 + (9 - i) * 0.08
    disc(c, 10, 10, i, '#bfe8ff')
  }
  c.globalAlpha = 1
  disc(c, 10, 10, 2, '#fff')
})
def('gridcell', 48, 48, (c) => {
  for (let i = 0; i < 48; i++) {
    px(c, i, 0, 1, 1, '#79f2ff')
    px(c, 0, i, 1, 1, '#79f2ff')
    if (i % 2 === 0) px(c, i, i, 1, 1, '#3aa8c0')
  }
})

// ───────────── 事件物体 ─────────────
def('ufo_0', 28, 14, (c) => ufo(c, 0))
def('ufo_1', 28, 14, (c) => ufo(c, 1))
function ufo(c: Ctx, f: number) {
  c.globalAlpha = 0.85
  disc(c, 14, 5, 5, '#9ff2ff')
  c.globalAlpha = 1
  px(c, 2, 7, 24, 4, '#a7adb8')
  px(c, 0, 8, 28, 2, '#c8ced8')
  px(c, 6, 11, 16, 2, '#7d838e')
  for (let x = 3; x < 26; x += 4) px(c, x, 8, 2, 1, (x / 4 + f) % 2 ? '#ffe14a' : '#ff4a6a')
}
def('rocket_0', 12, 52, (c) => rocket(c, 0))
def('rocket_1', 12, 52, (c) => rocket(c, 1))
function rocket(c: Ctx, f: number) {
  px(c, 4, 0, 4, 4, '#e8e8e8')
  px(c, 3, 4, 6, 34, '#f6f6f6')
  px(c, 3, 4, 1, 34, '#d8d8d8')
  px(c, 4, 10, 4, 3, '#de2910')
  px(c, 0, 26, 3, 12, '#e8e8e8')
  px(c, 9, 26, 3, 12, '#e8e8e8')
  px(c, 3, 38, 6, 2, '#666')
  const fl = f ? 12 : 9
  px(c, 4, 40, 4, fl, '#ffb020')
  px(c, 5, 40, 2, fl - 3, '#fff3a0')
  px(c, 1, 38, 2, fl - 4, '#ff7a20')
  px(c, 9, 38, 2, fl - 4, '#ff7a20')
}
def('alien_0', 14, 18, (c) => alien(c, 0))
def('alien_1', 14, 18, (c) => alien(c, 1))
function alien(c: Ctx, f: number) {
  px(c, 3, 0, 1, 3, '#7bd84a')
  px(c, 10, 0, 1, 3, '#7bd84a')
  px(c, 2, 0, 2, 1, '#ffe14a')
  px(c, 10, 0, 2, 1, '#ffe14a')
  px(c, 2, 3, 10, 8, '#7bd84a')
  px(c, 4, 5, 2, 3, '#111')
  px(c, 8, 5, 2, 3, '#111')
  px(c, 6, 9, 2, 1, '#2d6a1a')
  px(c, 4, 11, 6, 5, '#5bb83a')
  px(c, 4, 16, 2, 2, '#5bb83a')
  px(c, 8, 16, 2, 2, '#5bb83a')
  if (f) px(c, 10, 9, 3, 2, '#5bb83a')
  else px(c, 10, 12, 3, 2, '#5bb83a')
  px(c, 1, 12, 3, 2, '#5bb83a')
}
def('tollbooth', 56, 40, (c) => {
  px(c, 0, 0, 56, 6, '#e8473c')
  px(c, 0, 6, 56, 2, '#ffffff')
  px(c, 4, 8, 4, 32, '#bfc4cc')
  px(c, 48, 8, 4, 32, '#bfc4cc')
  px(c, 18, 14, 20, 26, '#f2f2f2')
  px(c, 20, 16, 16, 9, '#7fd0ff')
  px(c, 26, 18, 4, 4, '#e8b38a')
  px(c, 38, 26, 18, 2, '#ffffff')
  for (let x = 38; x < 56; x += 4) px(c, x, 26, 2, 2, '#e8473c')
  for (let x = 2; x < 54; x += 6) px(c, x, 2, 3, 2, '#ffe14a')
})
def('blackhole', 40, 40, (c) => {
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2
    for (let k = 0; k < 3; k++)
      px(c, 20 + Math.cos(a) * (15 + k), 20 + Math.sin(a) * (15 + k) * 0.55, 1, 1, ['#ffb84a', '#ff7a2a', '#ffe08a'][k])
  }
  disc(c, 20, 20, 11, '#000000')
  ring(c, 20, 20, 11, 11, '#ff9a3a', 120)
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * Math.PI
    px(c, 20 + Math.cos(a) * 16, 20 + Math.sin(a) * 9, 1, 1, '#ffd070')
  }
})
def('blackhole_yawn', 40, 40, (c) => {
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2
    px(c, 20 + Math.cos(a) * 16, 20 + Math.sin(a) * 9, 1, 1, '#ffb84a')
  }
  disc(c, 20, 20, 13, '#000')
  px(c, 13, 14, 4, 1, '#ffd070')
  px(c, 23, 14, 4, 1, '#ffd070')
  disc(c, 20, 24, 4, '#5a1010')
})
def('cat', 64, 52, (c) => {
  const o = '#f39a3a',
    d = '#c9701c',
    w = '#fff4e4'
  px(c, 8, 16, 48, 32, o)
  for (let i = 0; i < 10; i++) {
    px(c, 8 + i, 6 + i, 14 - i * 1.2, 1, o)
    px(c, 42 + i * 0.2, 6 + i, 14 - i * 1.2, 1, o)
  }
  px(c, 12, 10, 4, 6, '#ffb7c5')
  px(c, 48, 10, 4, 6, '#ffb7c5')
  for (let y = 18; y < 46; y += 7) {
    px(c, 8, y, 8, 2, d)
    px(c, 48, y, 8, 2, d)
  }
  px(c, 28, 16, 8, 2, d)
  px(c, 18, 24, 8, 8, '#203020')
  px(c, 38, 24, 8, 8, '#203020')
  px(c, 21, 25, 3, 7, '#9be36a')
  px(c, 41, 25, 3, 7, '#9be36a')
  px(c, 30, 34, 4, 3, '#ff7a9a')
  px(c, 22, 40, 20, 8, w)
  px(c, 26, 38, 4, 1, '#333')
  px(c, 34, 38, 4, 1, '#333')
  for (const y of [34, 37]) {
    px(c, 0, y, 14, 1, '#ffffff')
    px(c, 50, y, 14, 1, '#ffffff')
  }
  px(c, 14, 48, 10, 4, o)
  px(c, 40, 48, 10, 4, o)
})
def('yarn', 16, 16, (c) => {
  disc(c, 8, 8, 7, '#e84a8a')
  for (let i = 0; i < 4; i++) px(c, 3 + i * 3, 3, 1, 10, '#ff8ab8')
})
def('fish', 16, 8, (c) => {
  px(c, 2, 2, 9, 4, '#7fb6e6')
  px(c, 11, 1, 4, 6, '#5a92c8')
  px(c, 3, 3, 1, 1, '#111')
  px(c, 0, 3, 2, 2, '#7fb6e6')
})
function tile(c: Ctx, f: (c: Ctx) => void) {
  px(c, 0, 0, 14, 18, '#2c8a5a')
  px(c, 0, 0, 14, 16, '#f6f1e2')
  px(c, 0, 15, 14, 1, '#d8d0b8')
  f(c)
}
def('mj_zhong', 14, 18, (c) => tile(c, (c) => drawGlyph(c, '中', 2, 4, '#d42a2a', 2 / 2 + 0)))
def('mj_fa', 14, 18, (c) => tile(c, (c) => drawGlyph(c, '發', 2, 4, '#1f8a3a', 2 / 2)))
def('mj_bai', 14, 18, (c) =>
  tile(c, (c) => {
    px(c, 3, 3, 8, 1, '#3a6ac8')
    px(c, 3, 11, 8, 1, '#3a6ac8')
    px(c, 3, 3, 1, 9, '#3a6ac8')
    px(c, 10, 3, 1, 9, '#3a6ac8')
  }),
)
def('mj_wan', 14, 18, (c) =>
  tile(c, (c) => {
    px(c, 4, 2, 6, 1, '#1a1a1a')
    drawGlyph(c, '万', 4, 8, '#d42a2a')
  }),
)
def('mj_tong', 14, 18, (c) =>
  tile(c, (c) => {
    for (const [x, y] of [
      [4, 4],
      [9, 4],
      [4, 10],
      [9, 10],
    ]) {
      disc(c, x, y, 2, '#2a6ac8')
      px(c, x, y, 1, 1, '#d42a2a')
    }
  }),
)
def('mj_tiao', 14, 18, (c) =>
  tile(c, (c) => {
    for (const x of [3, 6, 9]) {
      px(c, x, 3, 2, 4, '#1f8a3a')
      px(c, x, 8, 2, 4, '#1f8a3a')
    }
  }),
)
def('sign', 48, 30, (c) => {
  px(c, 0, 0, 48, 22, '#ffd21f')
  px(c, 2, 2, 44, 18, '#ffe14a')
  for (let x = -20; x < 48; x += 8)
    for (let k = 0; k < 4; k++) {
      px(c, x + k, 0, 3, 1, '#222')
      px(c, x + k + 8, 21, 3, 1, '#222')
    }
  px(c, 6, 22, 3, 8, '#666')
  px(c, 39, 22, 3, 8, '#666')
})
def('car', 22, 12, (c) => {
  px(c, 2, 4, 18, 5, '#ffffff')
  px(c, 6, 1, 10, 4, '#ffffff')
  px(c, 7, 2, 3, 2, '#7fd0ff')
  px(c, 11, 2, 4, 2, '#7fd0ff')
  px(c, 4, 9, 4, 3, '#222')
  px(c, 14, 9, 4, 3, '#222')
  px(c, 19, 5, 2, 2, '#ffe14a')
  px(c, 0, 6, 2, 2, '#ff3030')
})
def('hwysign', 52, 30, (c) => {
  px(c, 0, 0, 52, 22, '#ffffff')
  px(c, 1, 1, 50, 20, '#1d7b50')
  px(c, 8, 22, 3, 8, '#9aa')
  px(c, 41, 22, 3, 8, '#9aa')
})
def('lane', 4, 18, (c) => px(c, 0, 0, 4, 18, '#ffffff'))
def('err404', 40, 14, (c) => {
  drawGlyph(c, '4', 0, 2, '#ff3a8a', 2)
  drawGlyph(c, '0', 14, 2, '#ff3a8a', 2)
  drawGlyph(c, '4', 28, 2, '#ff3a8a', 2)
})
def('broken', 18, 18, (c) => {
  px(c, 0, 0, 18, 18, '#d8d8d8')
  px(c, 1, 1, 16, 16, '#ffffff')
  px(c, 3, 10, 4, 5, '#5ac85a')
  px(c, 8, 7, 4, 8, '#5aa0e6')
  for (let i = 0; i < 18; i++) px(c, i, 9 + Math.round(Math.sin(i) * 2), 1, 1, '#d42a2a')
})
def('glitch', 40, 10, (c) => {
  const r = mulberry32(3)
  for (let i = 0; i < 10; i++)
    px(c, r() * 30, i, 6 + r() * 14, 1, ['#ff00ff', '#00ffff', '#ffff00', '#ffffff'][Math.floor(r() * 4)])
})
def('desk', 52, 40, (c) => {
  px(c, 0, 24, 52, 3, '#9a6a3a')
  px(c, 2, 27, 3, 13, '#7a4a2a')
  px(c, 47, 27, 3, 13, '#7a4a2a')
  px(c, 14, 4, 24, 16, '#222')
  px(c, 16, 6, 20, 12, '#1a2a4a')
  for (let y = 7; y < 17; y += 2) px(c, 17 + ((y * 7) % 5), y, 6 + ((y * 3) % 9), 1, ['#6ad6ff', '#ffd76a', '#ff7ab6'][y % 3])
  px(c, 24, 20, 4, 4, '#333')
  px(c, 12, 22, 20, 2, '#444')
  px(c, 40, 18, 5, 6, '#f2f2f2')
  px(c, 41, 19, 3, 2, '#6a3a1a')
  px(c, 4, 14, 6, 10, '#3a3a3a')
  px(c, 3, 24, 8, 2, '#3a3a3a')
})
def('coffee', 10, 12, (c) => {
  px(c, 1, 3, 7, 9, '#f2f2f2')
  px(c, 8, 5, 2, 4, '#f2f2f2')
  px(c, 2, 4, 5, 2, '#6a3a1a')
  px(c, 3, 0, 1, 2, '#ccc')
  px(c, 5, 1, 1, 2, '#ccc')
})
def('bug', 12, 10, (c) => {
  px(c, 3, 2, 6, 7, '#6a2a2a')
  px(c, 4, 0, 4, 2, '#222')
  px(c, 5, 2, 1, 7, '#2a0a0a')
  for (const y of [3, 5, 7]) {
    px(c, 0, y, 3, 1, '#222')
    px(c, 9, y, 3, 1, '#222')
  }
})
def('store', 64, 48, (c) => {
  px(c, 0, 12, 64, 36, '#f2f2f2')
  px(c, 0, 0, 64, 10, '#1d8a4a')
  px(c, 0, 10, 64, 2, '#f39a1f')
  for (let x = 0; x < 64; x += 8) px(c, x, 12, 4, 4, '#e8473c')
  px(c, 6, 20, 22, 20, '#9fe0ff')
  px(c, 36, 20, 22, 28, '#9fe0ff')
  px(c, 46, 20, 2, 28, '#888')
  for (let y = 24; y < 40; y += 5) px(c, 8, y, 18, 2, ['#ff7a7a', '#ffd76a', '#7ad87a'][y % 3])
  px(c, 0, 46, 64, 2, '#999')
})
def('drink', 8, 16, (c) => {
  px(c, 3, 0, 2, 2, '#e8473c')
  px(c, 2, 2, 4, 2, '#cfefff')
  px(c, 1, 4, 6, 12, '#9fe0ff')
  px(c, 1, 7, 6, 4, '#e8473c')
})
def('onigiri', 14, 12, (c) => {
  for (let i = 0; i < 10; i++) px(c, 7 - i * 0.7, i, i * 1.4 + 1, 1, '#ffffff')
  px(c, 4, 7, 6, 5, '#1a2a1a')
  px(c, 1, 10, 12, 2, '#ffffff')
})
def('noodle', 64, 44, (c) => {
  // 筷子
  px(c, 40, 0, 2, 26, '#c9945a')
  px(c, 46, 0, 2, 26, '#c9945a')
  // 面条
  for (let k = 0; k < 7; k++)
    for (let y = 4; y < 22; y++) px(c, 14 + k * 5 + Math.round(Math.sin(y / 2 + k) * 2), y, 1, 1, '#ffe08a')
  // 碗
  px(c, 2, 18, 60, 4, '#f6f6f6')
  for (let i = 0; i < 18; i++) px(c, 4 + i * 1.2, 22 + i, 56 - i * 2.4, 1, i % 6 === 2 ? '#d42a2a' : '#ffffff')
  px(c, 14, 20, 10, 4, '#ffffff')
  disc(c, 19, 20, 3, '#ffc01a')
  px(c, 30, 18, 8, 3, '#d4785a')
  px(c, 44, 18, 6, 3, '#3a9a3a')
})
def('strand', 40, 8, (c) => {
  for (let x = 0; x < 40; x++) px(c, x, 3 + Math.round(Math.sin(x / 3) * 2.5), 1, 2, '#ffe08a')
})
def('egg', 14, 10, (c) => {
  disc(c, 7, 5, 4, '#ffffff')
  disc(c, 7, 5, 2, '#ffb81a')
})
def('cone', 10, 12, (c) => {
  for (let i = 0; i < 10; i++) px(c, 5 - i * 0.4, i, i * 0.8 + 1, 1, i === 4 || i === 5 ? '#ffffff' : '#ff7a1a')
  px(c, 0, 10, 10, 2, '#ff7a1a')
})
def('crane', 60, 56, (c) => {
  for (let y = 6; y < 56; y += 2) {
    px(c, 10, y, 1, 2, '#ffc81a')
    px(c, 16, y, 1, 2, '#ffc81a')
    px(c, 10 + (y % 4 ? 0 : 6), y, 1, 1, '#ffc81a')
    px(c, 10, y, 7, 1, '#d8a010')
  }
  px(c, 0, 4, 60, 3, '#ffc81a')
  px(c, 4, 7, 6, 4, '#555')
  px(c, 50, 7, 1, 20, '#333')
  px(c, 47, 27, 7, 5, '#7a4a2a')
})
def('parcel', 16, 14, (c) => {
  px(c, 0, 2, 16, 12, '#c89a5a')
  px(c, 0, 0, 16, 3, '#dab07a')
  px(c, 7, 0, 2, 14, '#e8d8a8')
  px(c, 2, 6, 4, 3, '#ffffff')
})
def('cabbage', 16, 14, (c) => {
  disc(c, 8, 8, 6, '#7ad84a')
  px(c, 6, 3, 1, 10, '#c8f0a0')
  px(c, 10, 3, 1, 10, '#c8f0a0')
  px(c, 4, 10, 8, 4, '#f0f8e0')
})
def('tomato', 12, 12, (c) => {
  disc(c, 6, 7, 5, '#e8332a')
  px(c, 4, 1, 4, 2, '#3a9a3a')
  px(c, 4, 5, 2, 2, '#ff8a7a')
})
def('dama', 12, 22, (c) => {
  // 跳广场舞的大妈（宇宙广场舞）
  px(c, 3, 0, 6, 3, '#3a2a2a')
  px(c, 3, 3, 6, 4, '#e8b38a')
  px(c, 2, 7, 8, 8, '#e84a8a')
  px(c, 0, 4, 2, 5, '#e8b38a')
  px(c, 10, 4, 2, 5, '#e8b38a')
  px(c, 11, 2, 1, 3, '#ff3030')
  px(c, 3, 15, 2, 7, '#333')
  px(c, 7, 15, 2, 7, '#333')
})
def('speaker', 14, 18, (c) => {
  px(c, 0, 0, 14, 18, '#333')
  disc(c, 7, 6, 3, '#666')
  disc(c, 7, 13, 2, '#666')
  px(c, 4, 0, 6, 1, '#888')
})
def('portal', 40, 40, (c) => {
  for (let i = 0; i < 6; i++) ring(c, 20, 20, 18 - i * 3, 18 - i * 3, ['#ff5af0', '#7a5aff', '#5ae0ff'][i % 3], 220)
})

export interface AnimDef {
  key: string
  frames: string[]
  rate: number
}

export const ANIMS: AnimDef[] = [
  { key: 'flag', frames: ['flag_0', 'flag_1'], rate: 5 },
  { key: 'pigeon', frames: ['pigeon_0', 'pigeon_1'], rate: 8 },
  { key: 'bird', frames: ['bird_0', 'bird_1'], rate: 7 },
  { key: 'kite', frames: ['kite_0', 'kite_1'], rate: 3 },
  { key: 'drone', frames: ['drone_0', 'drone_1'], rate: 14 },
  { key: 'astronaut', frames: ['astronaut_0', 'astronaut_1'], rate: 3 },
  { key: 'sun', frames: ['sun_0', 'sun_1'], rate: 2 },
  { key: 'ufo', frames: ['ufo_0', 'ufo_1'], rate: 5 },
  { key: 'rocket', frames: ['rocket_0', 'rocket_1'], rate: 12 },
  { key: 'alien', frames: ['alien_0', 'alien_1'], rate: 3 },
]

export function buildTextures(): Record<string, HTMLCanvasElement> {
  const out: Record<string, HTMLCanvasElement> = {}
  for (const [key, [w, h, fn]] of Object.entries(T)) {
    const [c, ctx] = makeCanvas(w, h)
    fn(ctx, w, h)
    out[key] = c
  }
  for (const pose of Object.keys(POSE_FRAMES) as Pose[]) {
    const n = POSE_FRAMES[pose]
    const frames: string[] = []
    for (let i = 0; i < n; i++) {
      const key = `player_${pose}_${i}`
      out[key] = playerCanvas(pose, i)
      frames.push(key)
    }
    if (!ANIMS.find((a) => a.key === 'p_' + pose))
      ANIMS.push({ key: 'p_' + pose, frames, rate: pose === 'idle' ? 2 : pose === 'boost' ? 12 : 8 })
  }
  return out
}
