// 区域（Zone）配置：前 14 个为固定区域，之后由 themes.ts 无限生成荒诞区域

export interface SpawnEntry {
  key: string // 纹理 key 或动画 key（anim=true）
  anim?: boolean
  density: number // 每个 Chunk 平均数量
  p: [number, number] // 视差系数（1 = 与镜头同速，<1 更远，>1 更近）
  scale?: [number, number] // 相对像素倍率 S 的缩放
  vx?: [number, number] // 横向漂移 px/s（会随机取正负）
  vy?: [number, number] // 额外纵向速度 px/s（正值向下）
  alpha?: [number, number]
  tints?: number[]
  range?: [number, number] // 只在区域内的某段进度出现
  spin?: number // 最大旋转速度 rad/s
  rot?: boolean // 随机初始角度
  xs?: number[] // 固定横向位置（屏幕宽度比例）
  bump?: boolean // 可与主角轻微碰撞
  labels?: string[] // 物体上方的文字
  add?: boolean // 叠加混合
  flip?: boolean // 随机水平翻转
}

export interface Landmark {
  key: string
  anim?: boolean
  at: number // 区域进度 0~1
  x: number // 屏幕宽度比例
  p: number
  scale: number
  label?: string
  spin?: number
  tint?: number
  alpha?: number
}

export type Stage = 'early' | 'mid' | 'late' | 'absurd'

export interface ZoneDef {
  name: string
  startAlt: number // 米
  endAlt: number
  length: number // 像素距离
  sky: [number, number] // 顶部/底部颜色
  stars: number // 星空透明度
  stage: Stage
  spawns: SpawnEntry[]
  landmarks?: Landmark[]
  jokes: string[]
  themeId?: string
  events?: string[] // 该区域额外事件
}

const LY = 9.461e15

const cloudsFar: SpawnEntry = { key: 'cloud_s', density: 1.2, p: [0.35, 0.6], scale: [0.8, 1.4], vx: [4, 14], alpha: [0.7, 0.95], flip: true }

export const ZONES: ZoneDef[] = [
  {
    name: '天安门广场',
    startAlt: 0,
    endAlt: 50,
    length: 600,
    sky: [0x3f9cff, 0xc4e9ff],
    stars: 0,
    stage: 'early',
    spawns: [{ key: 'cloud_m', density: 1, p: [0.15, 0.25], scale: [1, 1.5], vx: [5, 12], alpha: [0.8, 1], flip: true }],
    jokes: ['北京时间，起飞时间', '广场上的鸽子都看呆了'],
  },
  {
    name: '北京上空',
    startAlt: 50,
    endAlt: 2000,
    length: 8400,
    sky: [0x3a8cf0, 0xaedfff],
    stars: 0,
    stage: 'early',
    spawns: [
      cloudsFar,
      { key: 'cloud_m', density: 0.8, p: [0.6, 0.9], scale: [1, 1.6], vx: [6, 16], alpha: [0.85, 1], flip: true },
      { key: 'bird', anim: true, density: 1.6, p: [0.8, 1], scale: [0.8, 1], vx: [40, 90], bump: true },
      { key: 'kite', anim: true, density: 0.9, p: [0.8, 1], scale: [0.9, 1.1], vx: [5, 15], range: [0, 0.55] },
      { key: 'drone', anim: true, density: 0.5, p: [0.9, 1], scale: [1, 1], vx: [20, 50], bump: true },
      { key: 'balloon', density: 0.5, p: [0.5, 0.8], scale: [0.9, 1.3], vx: [5, 12], range: [0.3, 1] },
    ],
    jokes: ['导航：前方 2 公里，请保持飞行', '北京的风筝第一次被人超过', '楼下大爷：这孩子谁家的？'],
  },
  {
    name: '云层',
    startAlt: 2000,
    endAlt: 8000,
    length: 15000,
    sky: [0x5aa7ef, 0xe4f3ff],
    stars: 0,
    stage: 'early',
    spawns: [
      { key: 'cloud_l', density: 4, p: [0.5, 0.9], scale: [1.2, 2.2], vx: [4, 10], alpha: [0.8, 1], flip: true },
      { key: 'cloud_m', density: 4, p: [0.6, 1], scale: [1.2, 2], vx: [4, 10], alpha: [0.85, 1], flip: true },
      { key: 'cloud_l', density: 1.6, p: [1.25, 1.6], scale: [2, 3], vx: [4, 8], alpha: [0.75, 0.95], flip: true, range: [0.15, 1] },
      { key: 'bird', anim: true, density: 0.5, p: [0.9, 1], scale: [0.8, 1], vx: [40, 80], range: [0, 0.3] },
    ],
    jokes: ['前方云层较厚，请系好安全带（如果有的话）', '云：你礼貌吗？'],
  },
  {
    name: '平流层',
    startAlt: 8000,
    endAlt: 50000,
    length: 36000,
    sky: [0x1c4cae, 0x5c9ae2],
    stars: 0.05,
    stage: 'early',
    spawns: [
      { key: 'cloud_s', density: 0.8, p: [0.3, 0.6], scale: [1, 1.8], vx: [6, 14], alpha: [0.35, 0.6], flip: true, range: [0, 0.5] },
      { key: 'plane', density: 0.7, p: [0.6, 0.95], scale: [0.9, 1.2], vx: [60, 110], range: [0, 0.6] },
      { key: 'hballoon', density: 0.6, p: [0.6, 0.9], scale: [0.9, 1.2], vx: [3, 8] },
    ],
    jokes: ['机长广播：右手边有位乘客在机舱外', '民航客机已被你超过'],
  },
  {
    name: '太空边缘',
    startAlt: 50000,
    endAlt: 100000,
    length: 20000,
    sky: [0x060b2a, 0x214592],
    stars: 0.5,
    stage: 'mid',
    spawns: [
      { key: 'hballoon', density: 0.3, p: [0.6, 0.9], scale: [0.8, 1], vx: [3, 8], range: [0, 0.3] },
      { key: 'bigstar', density: 0.6, p: [0.05, 0.1], scale: [0.7, 1], alpha: [0.5, 0.9], add: true },
    ],
    jokes: ['卡门线到了，你现在是宇航员了', '空气：我就送你到这儿了'],
  },
  {
    name: '近地轨道',
    startAlt: 100000,
    endAlt: 2000000,
    length: 30000,
    sky: [0x02030e, 0x0a1534],
    stars: 1,
    stage: 'mid',
    spawns: [
      { key: 'satellite', density: 1.2, p: [0.7, 1], scale: [0.9, 1.2], vx: [15, 40], spin: 0.3, rot: true },
      { key: 'debris_0', density: 1.5, p: [0.9, 1.1], scale: [1, 1.4], vx: [10, 40], spin: 2, bump: true },
      { key: 'debris_1', density: 1, p: [0.9, 1.1], scale: [1, 1.4], vx: [10, 40], spin: 2, bump: true },
      { key: 'debris_2', density: 1, p: [0.9, 1.1], scale: [1, 1.4], vx: [10, 40], spin: 2 },
      { key: 'astronaut', anim: true, density: 0.25, p: [0.8, 0.9], scale: [1, 1.2], vx: [5, 15], spin: 0.3, labels: ['你好呀！'] },
    ],
    landmarks: [{ key: 'station', at: 0.45, x: 0.72, p: 0.6, scale: 1.5, label: '空间站' }],
    jokes: ['空间站呼叫：发现不明飞行中国人', '请注意躲避太空垃圾'],
  },
  {
    name: '月球轨道',
    startAlt: 2000000,
    endAlt: 500000000,
    length: 40000,
    sky: [0x020208, 0x0c0c1e],
    stars: 1,
    stage: 'mid',
    spawns: [
      { key: 'debris_0', density: 0.8, p: [0.8, 1], scale: [1, 1.3], vx: [5, 20], spin: 1.5 },
      { key: 'debris_2', density: 0.6, p: [0.8, 1], scale: [1, 1.3], vx: [5, 20], spin: 1.5 },
    ],
    landmarks: [{ key: 'moon', at: 0.55, x: 0.7, p: 0.45, scale: 4, label: '月球', spin: 0.02 }],
    jokes: ['嫦娥：这位乘客，你没买票吧？', '玉兔：有人来了！'],
  },
  {
    name: '太阳系',
    startAlt: 5e8,
    endAlt: 7.5e12,
    length: 60000,
    sky: [0x06030a, 0x1c0e08],
    stars: 1,
    stage: 'mid',
    spawns: [
      { key: 'asteroid_0', density: 9, p: [0.7, 1.1], scale: [1, 1.6], vx: [10, 30], spin: 1, range: [0.36, 0.5], bump: true },
      { key: 'asteroid_1', density: 6, p: [0.7, 1.1], scale: [1, 1.6], vx: [10, 30], spin: 1, range: [0.36, 0.5], bump: true },
      { key: 'asteroid_2', density: 3, p: [0.5, 0.8], scale: [1, 1.6], vx: [10, 30], spin: 1, range: [0.36, 0.5] },
      { key: 'comet', density: 0.4, p: [0.5, 0.8], scale: [1, 1.5], vx: [80, 160] },
    ],
    landmarks: [
      { key: 'sun', anim: true, at: 0.06, x: 0.25, p: 0.35, scale: 4.5, label: '太阳' },
      { key: 'mercury', at: 0.16, x: 0.78, p: 0.5, scale: 2, label: '水星' },
      { key: 'venus', at: 0.23, x: 0.2, p: 0.5, scale: 2.2, label: '金星' },
      { key: 'mars', at: 0.31, x: 0.8, p: 0.55, scale: 2.4, label: '火星' },
      { key: 'jupiter', at: 0.58, x: 0.24, p: 0.45, scale: 3.2, label: '木星' },
      { key: 'saturn', at: 0.72, x: 0.74, p: 0.45, scale: 2.8, label: '土星' },
      { key: 'uranus', at: 0.84, x: 0.22, p: 0.5, scale: 2.4, label: '天王星' },
      { key: 'neptune', at: 0.94, x: 0.76, p: 0.5, scale: 2.4, label: '海王星' },
    ],
    jokes: ['已超光速，交警追不上了', '火星人：地球人都这么飞的吗？', '小行星带：请勿逆行'],
  },
  {
    name: '柯伊伯带 / 奥尔特云',
    startAlt: 7.5e12,
    endAlt: 1.5 * LY,
    length: 40000,
    sky: [0x020812, 0x0b2232],
    stars: 1,
    stage: 'mid',
    spawns: [
      { key: 'iceball', density: 3, p: [0.6, 1], scale: [0.8, 1.6], vx: [5, 20], spin: 0.8 },
      { key: 'comet', density: 0.8, p: [0.5, 0.8], scale: [1, 1.4], vx: [60, 120] },
      { key: 'nebula_0', density: 0.8, p: [0.2, 0.35], scale: [2, 3], alpha: [0.12, 0.22], tints: [0x88bbdd, 0x99ddee], add: true },
    ],
    jokes: ['冥王星：我还是不是行星？', '太阳已经变成一颗普通的星星了'],
  },
  {
    name: '星际空间',
    startAlt: 1.5 * LY,
    endAlt: 1000 * LY,
    length: 40000,
    sky: [0x05020f, 0x150a2c],
    stars: 1,
    stage: 'late',
    spawns: [
      { key: 'bigstar', density: 3, p: [0.2, 0.5], scale: [0.8, 1.5], alpha: [0.6, 1], add: true },
      { key: 'nebula_0', density: 1.4, p: [0.2, 0.4], scale: [2.5, 4], alpha: [0.25, 0.4], tints: [0xff66cc, 0x6699ff, 0xaa66ff, 0x66ffcc], add: true, rot: true },
      { key: 'nebula_1', density: 0.8, p: [0.2, 0.4], scale: [2.5, 4], alpha: [0.25, 0.4], tints: [0xff8866, 0x66ccff, 0xcc66ff], add: true, rot: true },
      { key: 'neptune', density: 0.15, p: [0.4, 0.6], scale: [1, 1.5], tints: [0x8888aa], vx: [2, 6] },
    ],
    jokes: ['旅行者 1 号：你是怎么追上我的？', '附近的恒星越来越多了'],
  },
  {
    name: '银河系',
    startAlt: 1000 * LY,
    endAlt: 1e5 * LY,
    length: 60000,
    sky: [0x0d0422, 0x2c0b3c],
    stars: 1,
    stage: 'late',
    spawns: [
      { key: 'nebula_0', density: 3, p: [0.2, 0.45], scale: [3, 5], alpha: [0.3, 0.5], tints: [0xff55aa, 0x5577ff, 0xaa55ff, 0x55ffdd, 0xffaa55], add: true, rot: true },
      { key: 'nebula_1', density: 2, p: [0.2, 0.45], scale: [3, 5], alpha: [0.3, 0.5], tints: [0xff7799, 0x77aaff, 0xdd77ff], add: true, rot: true },
      { key: 'cluster', density: 2.5, p: [0.3, 0.6], scale: [1.5, 3], alpha: [0.8, 1], add: true },
      { key: 'bigstar', density: 4, p: [0.3, 0.6], scale: [1, 1.8], add: true },
    ],
    jokes: ['欢迎来到银河系旋臂', '银河系导航：您已偏离太阳系 2 万光年'],
  },
  {
    name: '本星系群',
    startAlt: 1e5 * LY,
    endAlt: 1e7 * LY,
    length: 50000,
    sky: [0x020212, 0x0b0b26],
    stars: 0.7,
    stage: 'late',
    spawns: [
      { key: 'galaxy', density: 0.8, p: [0.3, 0.6], scale: [1, 2.2], tints: [0xffffff, 0xffccee, 0xccddff, 0xfff0cc], rot: true, spin: 0.05, add: true },
      { key: 'galaxy_e', density: 1, p: [0.3, 0.6], scale: [1, 2.2], rot: true, add: true },
    ],
    landmarks: [{ key: 'galaxy', at: 0.55, x: 0.3, p: 0.4, scale: 4, label: '仙女座星系', tint: 0xffd0f0, spin: 0.03 }],
    jokes: ['银河系已经变成一个小点了', '仙女座：再过 40 亿年我们会相撞哦'],
  },
  {
    name: '宇宙网',
    startAlt: 1e7 * LY,
    endAlt: 1e10 * LY,
    length: 50000,
    sky: [0x00000a, 0x05142c],
    stars: 0.4,
    stage: 'late',
    spawns: [
      { key: 'filament', density: 3, p: [0.3, 0.7], scale: [2, 4], rot: true, alpha: [0.5, 0.9], add: true },
      { key: 'node', density: 1.5, p: [0.3, 0.7], scale: [1.5, 3], add: true },
      { key: 'galaxy_e', density: 2, p: [0.3, 0.6], scale: [0.4, 0.8], add: true },
    ],
    jokes: ['宇宙其实是一张巨大的网', '这里的空洞，比你的钱包还空'],
  },
  {
    name: '可观测宇宙边界',
    startAlt: 1e10 * LY,
    endAlt: 4.65e10 * LY,
    length: 50000,
    sky: [0x000000, 0x06201e],
    stars: 0.25,
    stage: 'late',
    spawns: [
      { key: 'gridcell', density: 3, p: [0.3, 0.8], scale: [1.5, 3], rot: true, spin: 0.2, alpha: [0.4, 0.8], add: true },
      { key: 'galaxy_e', density: 4, p: [0.3, 0.6], scale: [0.2, 0.5], add: true },
    ],
    jokes: ['光都还没来得及到这里', '再往前就是开发者也不知道的地方了'],
  },
]

export const ABSURD_LENGTH = 28000
export const OBSERVABLE_END_LOG = Math.log10(4.65e10 * LY)
