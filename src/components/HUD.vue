<template>
  <div class="hud">
    <div class="stats">
      <div class="big">
        <span class="k">高度</span><b>{{ store.hud.altitude }}</b>
      </div>
      <div>
        <span class="k">速度</span><b>{{ store.hud.speed }}</b>
        <em class="gear" :class="'g' + gearLevel">{{ store.hud.gear }}</em>
      </div>
      <div><span class="k">区域</span>Zone {{ store.hud.zoneIndex + 1 }} · {{ store.hud.zoneName }}</div>
      <div><span class="k">连续飞行</span>{{ formatTime(store.hud.flightTime) }}</div>
      <div v-if="store.hud.holdTime > 0"><span class="k">按住</span>{{ store.hud.holdTime.toFixed(1) }}s</div>
      <div class="best"><span class="k">最高纪录</span>{{ store.records.bestAltText }}</div>
    </div>

    <div class="btns">
      <button class="px-btn icon gray" title="暂停" @click="bus.emit('pause')">⏸</button>
      <button class="px-btn icon gray" title="音乐" @click="toggleMusic">{{ store.settings.music ? '🔊' : '🔇' }}</button>
      <button class="px-btn icon gray" title="设置" @click="openSettings">⚙</button>
      <button class="px-btn icon gray" title="重新开始" @click="bus.emit('restart')">↻</button>
      <button class="px-btn icon" title="分享" @click="openShare">📤</button>
    </div>

    <transition name="banner">
      <div v-if="store.banner" :key="store.banner.id" class="banner">
        <small>ZONE {{ String(store.banner.index).padStart(2, '0') }}</small>
        <div>{{ store.banner.name }}</div>
      </div>
    </transition>

    <transition-group name="toast" tag="div" class="toasts">
      <div v-for="t in store.toasts" :key="t.id" class="toast" :class="t.kind">
        <span v-if="t.icon" class="ico">{{ t.icon }}</span>
        <div>
          <small v-if="t.title">{{ t.title }}</small>
          <div>{{ t.text }}</div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { store, bus } from '../store/gameStore'
import { formatTime } from '../game/systems/format'

const GEARS = ['待机', '漂浮', '普通飞行', '高速飞行', '超高速飞行', '太空推进', '超光速', '离谱推进', '??? 模式']
const gearLevel = computed(() => Math.max(0, GEARS.indexOf(store.hud.gear)))

function toggleMusic() {
  store.settings.music = !store.settings.music
}
function openSettings() {
  bus.emit('pause')
  store.ui.settingsOpen = true
}
function openShare() {
  bus.emit('pause')
  store.ui.shareOpen = true
}
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.stats {
  position: absolute;
  left: max(10px, env(safe-area-inset-left));
  top: max(10px, env(safe-area-inset-top));
  background: rgba(0, 0, 0, 0.42);
  border: 3px solid rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.55;
  font-weight: 700;
  text-shadow: 2px 2px 0 #000;
  max-width: calc(100vw - 80px);
}
.stats .k {
  display: inline-block;
  min-width: 4.6em;
  color: #9fe0b8;
  font-weight: 600;
}
.stats b {
  font-family: var(--mono);
}
.stats .big b {
  font-size: 20px;
  color: #fff;
}
.stats .best {
  color: var(--yellow);
}
.gear {
  font-style: normal;
  margin-left: 6px;
  padding: 0 5px;
  font-size: 11px;
  background: #2a6a4a;
}
.gear.g5,
.gear.g6 {
  background: #2a4aaa;
}
.gear.g6 {
  background: #7a2aaa;
}
.gear.g7,
.gear.g8 {
  background: #c8202a;
  animation: blink 0.4s steps(2) infinite;
}
@keyframes blink {
  50% {
    filter: brightness(1.6);
  }
}
.btns {
  position: absolute;
  right: max(8px, env(safe-area-inset-right));
  top: max(10px, env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: auto;
}
.btns .px-btn {
  margin: 4px;
}
.banner {
  position: absolute;
  top: 24%;
  left: 0;
  right: 0;
  text-align: center;
  font-weight: 900;
  font-size: 32px;
  color: #fff;
  text-shadow:
    4px 4px 0 #000,
    -2px -2px 0 #000;
}
.banner small {
  display: block;
  font-size: 15px;
  letter-spacing: 6px;
  color: var(--yellow);
  font-family: var(--mono);
}
.banner-enter-active {
  animation: bannerIn 0.45s cubic-bezier(0.2, 1.6, 0.4, 1);
}
.banner-leave-active {
  transition: all 0.4s;
}
.banner-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
@keyframes bannerIn {
  from {
    opacity: 0;
    transform: scale(2.4);
  }
}
.toasts {
  position: absolute;
  left: 50%;
  bottom: calc(max(26px, calc(env(safe-area-inset-bottom) + 14px)) + 96px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: min(92vw, 420px);
}
.toast {
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  color: #111;
  font-weight: 800;
  font-size: 14px;
  padding: 7px 12px;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.45);
}
.toast.achievement {
  background: var(--yellow);
}
.toast.info {
  background: #1d7b50;
  color: #fff;
}
.toast small {
  display: block;
  font-size: 11px;
  opacity: 0.7;
}
.toast .ico {
  font-size: 24px;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.toast-leave-to {
  opacity: 0;
}
@media (max-width: 420px) {
  .stats {
    font-size: 11px;
    padding: 6px 8px;
  }
  .stats .big b {
    font-size: 16px;
  }
  .banner {
    font-size: 24px;
  }
}
</style>
