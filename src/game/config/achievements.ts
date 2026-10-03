// 成就配置
export type AchCond =
  | { type: 'takeoff' }
  | { type: 'alt'; value: number } // 米
  | { type: 'zone'; value: number } // 0 基区域序号
  | { type: 'flight'; value: number } // 秒
  | { type: 'hold'; value: number } // 连续按住秒数
  | { type: 'flag'; value: 'earthFull' | 'lightspeed' | 'bump' }

export interface AchievementDef {
  id: string
  name: string
  desc: string
  icon: string
  cond: AchCond
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'takeoff', name: '中国人能飞', desc: '第一次离地', icon: '🛫', cond: { type: 'takeoff' } },
  { id: 'bird', name: '比鸟高', desc: '达到 100 m', icon: '🐦', cond: { type: 'alt', value: 100 } },
  { id: 'plane', name: '比飞机高', desc: '达到 12 km', icon: '✈️', cond: { type: 'alt', value: 12000 } },
  { id: 'space', name: '飞出大气层', desc: '到达太空边缘', icon: '🌌', cond: { type: 'zone', value: 4 } },
  { id: 'earth', name: '地球在脚下', desc: '看到完整地球', icon: '🌏', cond: { type: 'flag', value: 'earthFull' } },
  { id: 'moon', name: '奔月', desc: '到达月球区域', icon: '🌕', cond: { type: 'zone', value: 6 } },
  { id: 'light', name: '比光还快', desc: '速度突破 1c', icon: '⚡', cond: { type: 'flag', value: 'lightspeed' } },
  { id: 'sun', name: '再见太阳', desc: '飞出太阳系', icon: '☀️', cond: { type: 'zone', value: 9 } },
  { id: 'milky', name: '银河漫步', desc: '进入银河系区域', icon: '🌠', cond: { type: 'zone', value: 10 } },
  { id: 'beyond', name: '人类无法理解', desc: '飞出可观测宇宙', icon: '🤯', cond: { type: 'zone', value: 14 } },
  { id: 'hold30', name: '按到手酸', desc: '连续按住 30 秒', icon: '💪', cond: { type: 'hold', value: 30 } },
  { id: 'bump', name: '哎哟', desc: '第一次轻微碰撞', icon: '🤕', cond: { type: 'flag', value: 'bump' } },
  { id: 'fly10', name: '我还在飞', desc: '连续飞行 10 分钟', icon: '⏱️', cond: { type: 'flight', value: 600 } },
  { id: 'fly30', name: '你怎么还在飞', desc: '连续飞行 30 分钟', icon: '😱', cond: { type: 'flight', value: 1800 } },
  { id: 'zone100', name: '开发者都震惊了', desc: '进入 Zone 100', icon: '👨‍💻', cond: { type: 'zone', value: 99 } },
]
