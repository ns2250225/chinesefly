<template>
  <div class="modal-mask" @click.self="close">
    <div class="px-panel share">
      <h2 class="panel-title">分享卡片</h2>
      <img v-if="url" :src="url" alt="分享卡片" class="card" />
      <p class="hint">手机可长按图片保存</p>
      <div class="row">
        <button class="px-btn" @click="download">💾 保存图片</button>
        <button v-if="canShare" class="px-btn red" @click="share">📤 分享</button>
        <button class="px-btn gray" @click="copy">📋 {{ copied ? '已复制' : '复制文案' }}</button>
      </div>
      <button class="px-btn gray close" @click="close">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { store } from '../store/gameStore'
import { playerCanvas } from '../game/art/player'
import { formatTime } from '../game/systems/format'
import { mulberry32 } from '../game/art/pixel'

const url = ref('')
const copied = ref(false)
const canShare = typeof navigator !== 'undefined' && !!navigator.share
let blob: Blob | null = null

function joke(zone: number) {
  if (zone >= 99) return '飞到开发者不认识的地方了'
  if (zone >= 14) return '人类还没到过这里，但我到了'
  if (zone >= 11) return '我已经飞出银河系了'
  if (zone >= 9) return '太阳已经是一颗普通的星星了'
  if (zone >= 6) return '我刚刚路过了月亮'
  if (zone >= 4) return '地球就在我脚下'
  if (zone >= 2) return '我穿过云层了，你呢？'
  return '中国人，能飞！'
}

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')
const text = () =>
  `我在《中国人能飞》里飞到了 ${store.run.maxAltText}，到达 Zone ${store.run.maxZone + 1}「${store.run.maxZoneName}」，连续飞行 ${formatTime(
    store.hud.flightTime,
  )}！${joke(store.run.maxZone)}，我还在往上飞～`

function draw() {
  const W = 720,
    H = 1080
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  const [top, bot] = store.run.sky
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, hex(top))
  g.addColorStop(1, hex(bot))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // 星星
  const r = mulberry32(store.run.seed || 1)
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`
    const s = r() < 0.15 ? 6 : 3
    ctx.fillRect(Math.floor(r() * W), Math.floor(r() * H), s, s)
  }
  // 像素边框
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, 16)
  ctx.fillRect(0, H - 16, W, 16)
  ctx.fillRect(0, 0, 16, H)
  ctx.fillRect(W - 16, 0, 16, H)
  ctx.fillStyle = '#ffe14a'
  ctx.fillRect(16, 16, W - 32, 6)
  ctx.fillRect(16, H - 22, W - 32, 6)
  ctx.fillRect(16, 16, 6, H - 32)
  ctx.fillRect(W - 22, 16, 6, H - 32)

  // 标题
  ctx.textAlign = 'center'
  ctx.font = '900 104px "PingFang SC","Microsoft YaHei",sans-serif'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 18
  ctx.strokeStyle = '#5a0e10'
  ctx.strokeText('中国人能飞', W / 2 + 8, 168)
  ctx.strokeStyle = '#b5262b'
  ctx.strokeText('中国人能飞', W / 2, 160)
  ctx.fillStyle = '#fff'
  ctx.fillText('中国人能飞', W / 2, 160)
  ctx.font = 'bold 26px monospace'
  ctx.fillStyle = '#fff6c0'
  ctx.fillText('CHINESE  CAN  FLY', W / 2, 206)

  // 主角 + 尾焰
  const p = playerCanvas('boost', 0)
  const sc = 8
  const px = W / 2 - (p.width * sc) / 2
  const py = 250
  const flame = ['#fff6c0', '#ffd040', '#ff8a1a', '#c8201a']
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = flame[i]
    const w = 56 - i * 10
    ctx.fillRect(W / 2 - w / 2, py + p.height * sc - 24 + i * 34, w, 40)
  }
  ctx.drawImage(p, px, py, p.width * sc, p.height * sc)

  // 数据面板
  const y0 = 700
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(60, y0, W - 120, 250)
  ctx.fillStyle = '#ffe14a'
  ctx.fillRect(60, y0, W - 120, 6)
  ctx.textAlign = 'left'
  const rows: [string, string][] = [
    ['最高高度', store.run.maxAltText],
    ['到达区域', `Zone ${store.run.maxZone + 1} · ${store.run.maxZoneName}`],
    ['连续飞行', formatTime(store.hud.flightTime)],
  ]
  rows.forEach(([k, v], i) => {
    ctx.font = 'bold 28px "PingFang SC",sans-serif'
    ctx.fillStyle = '#9fe0b8'
    ctx.fillText(k, 90, y0 + 62 + i * 62)
    ctx.font = 'bold 36px "PingFang SC",monospace'
    ctx.fillStyle = '#fff'
    let val = v
    while (ctx.measureText(val).width > W - 360 && val.length > 4) val = val.slice(0, -2) + '…'
    ctx.fillText(val, 240, y0 + 64 + i * 62)
  })
  ctx.textAlign = 'center'
  ctx.font = '900 40px "PingFang SC",sans-serif'
  ctx.fillStyle = '#ffe14a'
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 8
  const j = `“${joke(store.run.maxZone)}”`
  ctx.strokeText(j, W / 2, 1006)
  ctx.fillText(j, W / 2, 1006)
  ctx.font = '20px "PingFang SC",sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(`按住按钮，看看你能飞多高 · 宇宙 #${store.run.seed}`, W / 2, 1046)

  url.value = c.toDataURL('image/png')
  c.toBlob((b) => (blob = b), 'image/png')
}

function download() {
  const a = document.createElement('a')
  a.href = url.value
  a.download = `中国人能飞-${store.run.maxZoneName}.png`
  a.click()
}
async function share() {
  try {
    const file = blob ? new File([blob], 'zhongguoren-nengfei.png', { type: 'image/png' }) : null
    if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: text(), title: '中国人能飞' })
    else await navigator.share({ text: text(), title: '中国人能飞', url: location.href })
  } catch {
    /* 用户取消 */
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(text() + ' ' + location.href)
    copied.value = true
  } catch {
    prompt('复制下面的文案：', text())
  }
}
function close() {
  store.ui.shareOpen = false
}

onMounted(draw)
</script>

<style scoped>
.share {
  text-align: center;
}
.card {
  width: 100%;
  max-width: 300px;
  image-rendering: pixelated;
  border: 3px solid #000;
  -webkit-touch-callout: default;
  user-select: auto;
  pointer-events: auto;
}
.hint {
  font-size: 12px;
  color: #aab4be;
  margin: 4px 0;
}
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.row .px-btn {
  font-size: 14px;
  padding: 8px 12px;
}
.close {
  width: calc(100% - 8px);
  margin-top: 8px;
}
</style>
