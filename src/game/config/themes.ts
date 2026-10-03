// 荒诞无限区域主题：Theme + Palette + Background + Objects + Effects + Events + JokeText
import type { SpawnEntry, Landmark } from './zones'

export interface ThemeDef {
  id: string
  name: string
  palettes: [number, number][] // 多套色板，随机选择
  stars: number
  spawns: SpawnEntry[]
  landmarks?: Landmark[]
  events: string[]
  jokes: string[]
  effect?: 'glitch' | 'rain' | 'sparkle' | 'none'
}

const carTints = [0xff5a5a, 0x5ac8ff, 0xffd84a, 0x7aff7a, 0xff8ae0, 0xffffff]

export const THEMES: ThemeDef[] = [
  {
    id: 'highway',
    name: '银河高速公路',
    palettes: [
      [0x0a0a24, 0x2a1a4a],
      [0x041420, 0x1a3a4a],
    ],
    stars: 0.8,
    spawns: [
      { key: 'lane', density: 14, p: [1, 1], xs: [0.33, 0.66], scale: [1, 1], alpha: [0.6, 0.6] },
      { key: 'car', density: 4, p: [1, 1], xs: [0.18, 0.5, 0.82], vy: [-300, 400], tints: carTints, scale: [1.2, 1.6], bump: true },
      { key: 'hwysign', density: 0.6, p: [0.8, 0.8], xs: [0.15, 0.85], scale: [1.2, 1.4], labels: ['银河高速 G1', '距仙女座 254 万光年', '限速 999c', '服务区 前方 3 光年'] },
    ],
    events: ['toll', 'alien_ask'],
    jokes: ['银河高速：请勿占用应急车道', '前方拥堵，预计通行时间 3 亿年'],
  },
  {
    id: 'toll',
    name: '宇宙收费站',
    palettes: [[0x1a0a2a, 0x4a1a3a]],
    stars: 0.6,
    spawns: [
      { key: 'tollbooth', density: 1, p: [0.9, 0.9], xs: [0.2, 0.8], scale: [1.5, 1.8], labels: ['宇宙收费站', 'ETC 专用', '人工收费'] },
      { key: 'cone', density: 3, p: [1, 1], scale: [1.2, 1.5] },
      { key: 'car', density: 2, p: [1, 1], vy: [-200, 200], tints: carTints, scale: [1.2, 1.5] },
    ],
    events: ['toll', 'alien_ask'],
    jokes: ['收费员：中国人能飞，免费通行！', '本站支持扫码支付'],
  },
  {
    id: 'mahjong',
    name: '漂浮麻将宇宙',
    palettes: [
      [0x063a22, 0x0d6a3e],
      [0x1a2a0a, 0x2a5a1a],
    ],
    stars: 0.4,
    spawns: ['mj_zhong', 'mj_fa', 'mj_bai', 'mj_wan', 'mj_tong', 'mj_tiao'].map((key) => ({
      key,
      density: 1.6,
      p: [0.4, 1.2] as [number, number],
      scale: [1.2, 2.6] as [number, number],
      spin: 1.2,
      rot: true,
      vx: [5, 30] as [number, number],
      bump: key === 'mj_zhong',
    })),
    events: ['mahjong', 'alien_ask'],
    jokes: ['三缺一，宇宙等你来', '碰！杠！胡了！', '这里的麻将牌比星星还多'],
  },
  {
    id: '404',
    name: '404 宇宙未找到',
    palettes: [
      [0x000000, 0x2a002a],
      [0x0a0a0a, 0x002a2a],
    ],
    stars: 0.2,
    spawns: [
      { key: 'err404', density: 1.2, p: [0.4, 0.9], scale: [1.5, 3] },
      { key: 'broken', density: 1.5, p: [0.5, 1], scale: [1.2, 2], spin: 0.5 },
      { key: 'glitch', density: 4, p: [0.6, 1.4], scale: [1.5, 4], alpha: [0.5, 1], add: true },
    ],
    effect: 'glitch',
    events: ['alien_ask', 'blackhole_yawn'],
    jokes: ['Error 404：Universe Not Found', '请尝试刷新宇宙', '宇宙.exe 已停止响应'],
  },
  {
    id: 'coder',
    name: '宇宙程序员工位',
    palettes: [[0x101820, 0x203040]],
    stars: 0.5,
    spawns: [
      { key: 'desk', density: 1.2, p: [0.7, 1], scale: [1.4, 1.8], labels: ['需求又改了', '在我电脑上是好的', '今晚上线', '这不是 bug 是特性'] },
      { key: 'coffee', density: 2, p: [0.6, 1.1], scale: [1.2, 1.8], spin: 0.8, rot: true },
      { key: 'bug', density: 3, p: [0.8, 1.1], scale: [1.2, 1.6], vx: [30, 80], bump: true },
    ],
    events: ['alien_ask', 'sign_construction'],
    jokes: ['开发者：没想到真有人飞到这里', '这片宇宙是用 Ctrl+C / Ctrl+V 生成的', '本区域代码由咖啡驱动'],
  },
  {
    id: 'cat',
    name: '像素巨猫星系',
    palettes: [
      [0x2a1030, 0x5a2a50],
      [0x1a1040, 0x402a6a],
    ],
    stars: 0.9,
    spawns: [
      { key: 'yarn', density: 2.5, p: [0.5, 1], scale: [1.2, 2.4], spin: 1, rot: true },
      { key: 'fish', density: 2, p: [0.6, 1], scale: [1.2, 2], vx: [20, 60], flip: true },
    ],
    landmarks: [{ key: 'cat', at: 0.45, x: 0.5, p: 0.5, scale: 5, label: '喵星', spin: 0 }],
    events: ['cat_giant'],
    jokes: ['巨猫：喵（你挡着我晒太阳了）', '这片星系由猫统治'],
  },
  {
    id: 'blackhole_rain',
    name: '黑洞雨',
    palettes: [[0x1a0a00, 0x3a1a0a]],
    stars: 0.6,
    spawns: [{ key: 'blackhole', density: 5, p: [1, 1], vy: [150, 400], scale: [0.8, 1.6], spin: 0.5 }],
    effect: 'rain',
    events: ['blackhole_yawn'],
    jokes: ['今日天气：局部有黑洞', '出门记得带伞（防引力）'],
  },
  {
    id: 'store',
    name: '宇宙便利店',
    palettes: [[0x0a1a2a, 0x1a3a3a]],
    stars: 0.6,
    spawns: [
      { key: 'drink', density: 3, p: [0.6, 1.1], scale: [1.2, 2], spin: 1, rot: true },
      { key: 'onigiri', density: 2.5, p: [0.6, 1.1], scale: [1.2, 2], spin: 1, rot: true },
    ],
    landmarks: [{ key: 'store', at: 0.4, x: 0.7, p: 0.6, scale: 3, label: '宇宙便利店 24H' }],
    events: ['alien_ask'],
    jokes: ['欢迎光临~ 第二件半价', '宇宙便利店：关东煮买一送一'],
  },
  {
    id: 'noodle',
    name: '巨型泡面星云',
    palettes: [[0x2a1a04, 0x5a3a0a]],
    stars: 0.5,
    spawns: [
      { key: 'strand', density: 6, p: [0.5, 1.2], scale: [1.5, 3], rot: true, spin: 0.4 },
      { key: 'egg', density: 2, p: [0.6, 1], scale: [1.5, 2.5], spin: 0.5 },
      { key: 'nebula_0', density: 1.5, p: [0.2, 0.4], scale: [3, 5], alpha: [0.3, 0.5], tints: [0xffcc55, 0xff9933], add: true },
    ],
    landmarks: [{ key: 'noodle', at: 0.5, x: 0.5, p: 0.4, scale: 5, label: '泡面星云（红烧牛肉味）' }],
    events: ['alien_ask'],
    jokes: ['泡面星云：已泡好，请享用', '调料包在星云的另一边'],
  },
  {
    id: 'construction',
    name: '外星人施工现场',
    palettes: [[0x1a1a0a, 0x3a3a1a]],
    stars: 0.6,
    spawns: [
      { key: 'crane', density: 0.8, p: [0.6, 0.9], scale: [1.5, 2], flip: true },
      { key: 'cone', density: 4, p: [0.8, 1.1], scale: [1.2, 1.8] },
      { key: 'sign', density: 0.8, p: [0.8, 1], scale: [1.4, 1.6], labels: ['前方施工 12 光年', '宇宙维修中', '请绕行'] },
      { key: 'alien', anim: true, density: 1.5, p: [0.8, 1], scale: [1.4, 1.8], vx: [10, 30], labels: ['加班中', '搬砖', '这里要建黑洞'] },
    ],
    events: ['sign_construction', 'alien_ask'],
    jokes: ['施工方：外星建设集团', '本工程预计 2077 年竣工'],
  },
  {
    id: 'express',
    name: '宇宙快递站',
    palettes: [[0x2a1a0a, 0x4a2a14]],
    stars: 0.5,
    spawns: [
      { key: 'parcel', density: 6, p: [0.5, 1.2], scale: [1.2, 2.4], spin: 1, rot: true, labels: ['你的快递', '易碎品', '到付'] },
      { key: 'ufo', anim: true, density: 0.8, p: [0.8, 1], scale: [1.4, 1.8], vx: [40, 90], labels: ['快递员'] },
    ],
    events: ['alien_ask', 'ufo'],
    jokes: ['您的快递已到达宇宙边缘，请取件', '包裹派送中：预计 300 光年后送达'],
  },
  {
    id: 'market',
    name: '太空菜市场',
    palettes: [[0x0a2a14, 0x1a4a2a]],
    stars: 0.5,
    spawns: [
      { key: 'cabbage', density: 3, p: [0.5, 1.1], scale: [1.4, 2.4], spin: 0.8, rot: true },
      { key: 'tomato', density: 3, p: [0.5, 1.1], scale: [1.4, 2.4], spin: 0.8, rot: true, bump: true },
      { key: 'alien', anim: true, density: 1, p: [0.8, 1], scale: [1.4, 1.8], labels: ['白菜 3 星币一斤', '便宜卖了！', '来点西红柿？'] },
    ],
    events: ['alien_ask'],
    jokes: ['大妈：小伙子，买点菜再飞', '太空菜市场：可以讲价'],
  },
  {
    id: 'dance',
    name: '宇宙广场舞',
    palettes: [[0x2a0a2a, 0x5a1a4a]],
    stars: 0.8,
    spawns: [
      { key: 'dama', density: 5, p: [0.8, 1], scale: [1.4, 1.8], vx: [5, 20], flip: true },
      { key: 'speaker', density: 1, p: [0.8, 1], scale: [1.6, 2], labels: ['动次打次', '最炫民族风'] },
    ],
    effect: 'sparkle',
    events: ['alien_ask'],
    jokes: ['广场舞大妈已经跳到宇宙了', '音响开到了宇宙最大音量'],
  },
]

// 特殊隐藏区域（按 Zone 编号，1 起）
export const SPECIAL_ZONES: Record<number, { name: string; themeId: string; jokes: string[] }> = {
  42: { name: '生命、宇宙及一切的答案', themeId: '404', jokes: ['答案是 42', '问题是什么来着？'] },
  66: { name: '六六大顺星系', themeId: 'mahjong', jokes: ['飞得 666', '顺顺顺！'] },
  100: { name: '开发者都震惊了', themeId: 'coder', jokes: ['开发者：？？？你怎么飞到 100 区的', '建议休息一下眼睛'] },
  404: { name: '真·404', themeId: '404', jokes: ['这次是真的找不到了'] },
}
