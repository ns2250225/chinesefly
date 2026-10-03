// 全局状态：Vue UI 与 Phaser 游戏之间的桥梁 + 本地存储
import { reactive, watch } from 'vue'

export type Phase = 'loading' | 'title' | 'ready' | 'flying' | 'paused'
export type Quality = 'auto' | 'high' | 'medium' | 'low'

export interface Settings {
  music: boolean
  musicVolume: number
  sfxVolume: number
  quality: Quality
  vibration: boolean
  useLocalMusic: boolean
  fixedSeed: boolean
  seed: number
}

export interface Records {
  bestDistance: number
  bestAltText: string
  bestZone: number
  bestZoneName: string
  longestFlight: number
  totalFlights: number
}

export interface Toast {
  id: number
  text: string
  kind: 'joke' | 'achievement' | 'info'
  icon?: string
  title?: string
}

const SAVE_KEY = 'zgrnf_save_v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
  } catch {
    return {}
  }
}
const saved = load()

export const store = reactive({
  phase: 'loading' as Phase,
  loadingProgress: 0,
  holding: false,
  holdLevel: 0,
  hud: {
    altitude: '0 m',
    speed: '0 km/h',
    gear: '待机',
    zoneName: '天安门广场',
    zoneIndex: 0,
    holdTime: 0,
    flightTime: 0,
  },
  run: {
    seed: 0,
    maxDistance: 0,
    maxAltText: '0 m',
    maxZone: 0,
    maxZoneName: '天安门广场',
    sky: [0x3f9cff, 0xc4e9ff] as [number, number],
  },
  banner: null as null | { id: number; index: number; name: string },
  toasts: [] as Toast[],
  settings: {
    music: true,
    musicVolume: 0.7,
    sfxVolume: 0.6,
    quality: 'auto',
    vibration: true,
    useLocalMusic: false,
    fixedSeed: false,
    seed: Math.floor(Math.random() * 999999),
    ...(saved.settings || {}),
  } as Settings,
  effectiveQuality: 'high' as Exclude<Quality, 'auto'>,
  records: {
    bestDistance: 0,
    bestAltText: '0 m',
    bestZone: 0,
    bestZoneName: '天安门广场',
    longestFlight: 0,
    totalFlights: 0,
    ...(saved.records || {}),
  } as Records,
  achievements: (saved.achievements || {}) as Record<string, number>,
  localMusicName: (saved.localMusicName || '') as string,
  ui: {
    settingsOpen: false,
    shareOpen: false,
    achievementsOpen: false,
  },
})

export function persist() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      settings: store.settings,
      records: store.records,
      achievements: store.achievements,
      localMusicName: store.localMusicName,
    }),
  )
}
watch(() => store.settings, persist, { deep: true })

let toastId = 1
export function pushToast(t: Omit<Toast, 'id'>, ms = 2800) {
  const toast = { ...t, id: toastId++ }
  store.toasts.push(toast)
  if (store.toasts.length > 2) store.toasts.shift()
  setTimeout(() => {
    const i = store.toasts.findIndex((x) => x.id === toast.id)
    if (i >= 0) store.toasts.splice(i, 1)
  }, ms)
}

let bannerId = 1
export function showBanner(index: number, name: string) {
  const id = bannerId++
  store.banner = { id, index, name }
  setTimeout(() => {
    if (store.banner?.id === id) store.banner = null
  }, 2600)
}

export function resetRecords() {
  Object.assign(store.records, {
    bestDistance: 0,
    bestAltText: '0 m',
    bestZone: 0,
    bestZoneName: '天安门广场',
    longestFlight: 0,
    totalFlights: 0,
  })
  for (const k of Object.keys(store.achievements)) delete store.achievements[k]
  persist()
}

// ───────── 简单事件总线 ─────────
type Handler = (...args: any[]) => void
const handlers: Record<string, Handler[]> = {}
export const bus = {
  on(ev: string, fn: Handler) {
    ;(handlers[ev] ||= []).push(fn)
  },
  off(ev: string, fn: Handler) {
    handlers[ev] = (handlers[ev] || []).filter((h) => h !== fn)
  },
  emit(ev: string, ...args: any[]) {
    for (const h of handlers[ev] || []) h(...args)
  },
}

// ───────── 按住来源（按钮 / 键盘 / 触屏） ─────────
const holdSources = new Set<string>()
export function setHold(source: string, on: boolean) {
  if (on) holdSources.add(source)
  else holdSources.delete(source)
  const holding = holdSources.size > 0
  if (holding !== store.holding) {
    store.holding = holding
    bus.emit('hold', holding)
  }
}
export function clearHold() {
  holdSources.clear()
  if (store.holding) {
    store.holding = false
    bus.emit('hold', false)
  }
}

export function vibrate(ms: number | number[]) {
  if (!store.settings.vibration || store.effectiveQuality === 'low') return
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* 不支持震动 */
  }
}

// ───────── IndexedDB：保存导入的本地音乐 ─────────
const DB = 'zgrnf'
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore('files')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
export async function idbPut(key: string, value: Blob) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite')
    tx.objectStore('files').put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
export async function idbGet(key: string): Promise<Blob | undefined> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const req = db.transaction('files').objectStore('files').get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return undefined
  }
}
