<template>
  <div class="modal-mask">
    <div class="px-panel menu">
      <h2 class="panel-title">暂停</h2>
      <div class="info">
        <div>本次高度：<b>{{ store.run.maxAltText }}</b></div>
        <div>到达区域：<b>Zone {{ store.run.maxZone + 1 }} · {{ store.run.maxZoneName }}</b></div>
        <div>连续飞行：<b>{{ formatTime(store.hud.flightTime) }}</b></div>
      </div>
      <button class="px-btn red" @click="bus.emit('resume')">▶ 继续飞</button>
      <button class="px-btn" @click="restart">↻ 重新开始</button>
      <button class="px-btn" @click="store.ui.shareOpen = true">📤 生成分享卡</button>
      <button class="px-btn gray" @click="store.ui.achievementsOpen = true">🎖 成就</button>
      <button class="px-btn gray" @click="store.ui.settingsOpen = true">⚙ 设置</button>
      <button class="px-btn gray" @click="store.settings.music = !store.settings.music">
        {{ store.settings.music ? '🔊 音乐：开' : '🔇 音乐：关' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { store, bus } from '../store/gameStore'
import { formatTime } from '../game/systems/format'

function restart() {
  bus.emit('restart')
}
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  max-width: 340px !important;
}
.menu .px-btn {
  margin: 7px 4px;
  font-size: 17px;
}
.info {
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 8px;
  color: #cfd8e0;
}
.info b {
  color: #fff;
}
</style>
