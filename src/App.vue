<template>
  <div class="root">
    <div ref="gameEl" class="game"></div>

    <div class="ui">
      <!-- 加载 -->
      <div v-if="store.phase === 'loading'" class="loading">
        <div class="bar"><div :style="{ width: store.loadingProgress * 100 + '%' }"></div></div>
        <p>正在准备起飞…</p>
      </div>

      <!-- 标题页 -->
      <div v-if="store.phase === 'title'" class="title">
        <div class="title-bottom">
          <button class="px-btn red start" @pointerdown.prevent="start">▶ 开始</button>
          <div class="records">
            <span>🏆 最高纪录：{{ store.records.bestAltText }}</span>
            <span>📍 {{ store.records.bestZoneName }}</span>
            <span>🎖 成就 {{ unlocked }}/{{ ACHIEVEMENTS.length }}</span>
          </div>
          <div class="row">
            <button class="px-btn gray" @click="store.ui.achievementsOpen = true">成就</button>
            <button class="px-btn gray" @click="store.ui.settingsOpen = true">设置</button>
          </div>
          <p class="tip">手机长按按钮 · 电脑长按 Space / ↑ 键</p>
          <p class="copy">BGM《中国人能飞》仅供学习演示，商用需获得授权；可在设置中导入本地音乐</p>
        </div>
      </div>

      <HUD v-if="inGame" />

      <!-- 起飞提示 -->
      <div v-if="store.phase === 'ready'" class="ready-hint">按住，让他飞</div>

      <FlightButton v-if="store.phase === 'ready' || store.phase === 'flying'" />

      <PauseMenu v-if="store.phase === 'paused' && !anyModal" />
      <SettingsPanel v-if="store.ui.settingsOpen" />
      <AchievementPanel v-if="store.ui.achievementsOpen" />
      <ShareCard v-if="store.ui.shareOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type Phaser from 'phaser'
import { store, bus } from './store/gameStore'
import { audio } from './game/systems/AudioSystem'
import { createGame } from './game'
import { ACHIEVEMENTS } from './game/config/achievements'
import HUD from './components/HUD.vue'
import FlightButton from './components/FlightButton.vue'
import PauseMenu from './components/PauseMenu.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ShareCard from './components/ShareCard.vue'
import AchievementPanel from './components/AchievementPanel.vue'

const gameEl = ref<HTMLDivElement>()
let game: Phaser.Game | null = null

const inGame = computed(() => ['ready', 'flying', 'paused'].includes(store.phase))
const anyModal = computed(() => store.ui.settingsOpen || store.ui.achievementsOpen || store.ui.shareOpen)
const unlocked = computed(() => ACHIEVEMENTS.filter((a) => store.achievements[a.id]).length)

function start() {
  audio.unlock()
  audio.playMusic()
  audio.sfx('click')
  bus.emit('start')
}

watch(
  () => [store.settings.music, store.settings.musicVolume, store.settings.sfxVolume],
  () => audio.applyVolumes(),
)
watch(
  () => store.settings.quality,
  (q) => {
    if (q !== 'auto') store.effectiveQuality = q
    bus.emit('quality')
  },
)

onMounted(() => {
  game = createGame(gameEl.value!)
  if (import.meta.env.DEV) (window as any).__game = { game, store, bus, audio }
})
onBeforeUnmount(() => game?.destroy(true))
</script>

<style scoped>
.root,
.game {
  position: absolute;
  inset: 0;
}
.ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ui > * {
  pointer-events: auto;
}
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0b1020;
}
.loading .bar {
  width: 220px;
  height: 18px;
  border: 4px solid #fff;
  padding: 2px;
}
.loading .bar div {
  height: 100%;
  background: var(--green);
  transition: width 0.2s;
}
.title {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.title-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: max(20px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: auto;
  text-shadow: 2px 2px 0 #000;
}
.start {
  font-size: 26px;
  padding: 14px 54px;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    transform: scale(1.06);
  }
}
.records {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 14px;
  font-size: 14px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.45);
  padding: 6px 12px;
  margin-top: 6px;
}
.row {
  display: flex;
  gap: 6px;
}
.tip {
  margin: 2px;
  font-size: 13px;
}
.copy {
  margin: 0;
  font-size: 11px;
  opacity: 0.75;
  text-align: center;
  padding: 0 12px;
}
.ready-hint {
  position: absolute;
  left: 0;
  right: 0;
  top: 30%;
  text-align: center;
  font-size: 34px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow:
    3px 3px 0 #000,
    -2px -2px 0 #000;
  pointer-events: none !important;
  animation: pulse 0.8s ease-in-out infinite;
}
</style>
