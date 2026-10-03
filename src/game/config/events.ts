// 随机事件配置：只增强趣味，不强制失败，不中断飞行
import type { Stage } from './zones'

export type Motion = 'cross' | 'overtake' | 'pass' | 'float'

export interface EventDef {
  id: string
  stages: Stage[]
  key: string
  anim?: boolean
  motion: Motion
  count?: number // 成群出现
  scale?: number
  text?: string[] // 对话气泡
  toast?: string[] // 顶部提示
  bump?: boolean
  label?: string
  tints?: number[]
  sfx?: 'whoosh' | 'bump' | 'chime'
}

export const EVENTS: EventDef[] = [
  // 前期
  { id: 'bird_flock', stages: ['early'], key: 'bird', anim: true, motion: 'cross', count: 6, toast: ['一群鸟飞过'], bump: true },
  { id: 'kite', stages: ['early'], key: 'kite', anim: true, motion: 'cross', text: ['放风筝的大爷：线断了！'] },
  { id: 'drone', stages: ['early'], key: 'drone', anim: true, motion: 'float', text: ['无人机：咔嚓！帮你拍一张', '无人机：已开启跟拍模式'] },
  { id: 'plane', stages: ['early'], key: 'plane', motion: 'cross', scale: 1.4, text: ['机长：右手边那位乘客请回到座位', '乘客：妈，有人在外面飞！'] },
  // 中期
  { id: 'satellite', stages: ['mid'], key: 'satellite', motion: 'cross', text: ['卫星：信号满格，请继续飞'] },
  { id: 'astronaut', stages: ['mid'], key: 'astronaut', anim: true, motion: 'float', text: ['宇航员：你好！你也是出差的？', '宇航员：你的宇航服呢？'] },
  { id: 'rocket', stages: ['mid', 'late'], key: 'rocket', anim: true, motion: 'overtake', scale: 1.4, toast: ['长征火箭超车了！'], sfx: 'whoosh' },
  { id: 'ufo', stages: ['mid', 'late', 'absurd'], key: 'ufo', anim: true, motion: 'cross', scale: 1.4, text: ['UFO：这人怎么不用飞船？', 'UFO：拍下来发朋友圈'] },
  // 后期
  { id: 'alien_ask', stages: ['late', 'absurd'], key: 'alien', anim: true, motion: 'float', scale: 1.4, text: ['外星人：请问地球怎么走？', '外星人：你们那边 WiFi 密码多少？', '外星人：中国人真的能飞啊'] },
  { id: 'blackhole_yawn', stages: ['late', 'absurd'], key: 'blackhole_yawn', motion: 'pass', scale: 2, text: ['黑洞：哈——欠——', '黑洞：好困，吞个星系提提神'] },
  { id: 'galaxy_queue', stages: ['late', 'absurd'], key: 'galaxy', motion: 'pass', count: 5, scale: 0.8, toast: ['星系在排队，请勿插队'], tints: [0xffccee, 0xccddff, 0xffffff] },
  { id: 'mahjong', stages: ['late', 'absurd'], key: 'mj_zhong', motion: 'cross', count: 6, scale: 1.6, toast: ['漂浮麻将牌：三缺一，来吗？'] },
  { id: 'cat_giant', stages: ['absurd'], key: 'cat', motion: 'pass', scale: 3, text: ['巨型宇宙猫：喵？'] },
  { id: 'sign_construction', stages: ['late', 'absurd'], key: 'sign', motion: 'pass', scale: 1.6, label: '前方施工 12 光年', toast: ['提示牌：前方施工 12 光年'] },
  { id: 'toll', stages: ['absurd'], key: 'tollbooth', motion: 'pass', scale: 1.8, label: '宇宙收费站', text: ['收费员：中国人能飞，免费！'] },
]

// 中性/通用搞笑提示
export const GENERIC_JOKES: Record<Stage, string[]> = {
  early: ['风有点大，发型还在', '请保持按住', '他真的飞起来了'],
  mid: ['地球在你脚下', '宇宙信号良好', '氧气？不需要'],
  late: ['你已经比光还快了', '人类还没到过这里，但你到了', '宇宙越来越离谱了'],
  absurd: ['这里不在任何地图上', '开发者也不知道这里有什么', '我还在往上飞', '宇宙的尽头是……还有宇宙'],
}
