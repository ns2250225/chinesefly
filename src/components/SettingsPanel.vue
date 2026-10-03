<template>
  <div class="modal-mask" @click.self="close">
    <div class="px-panel">
      <h2 class="panel-title">设置</h2>

      <section>
        <h3>🎵 音乐与音效</h3>
        <label class="row"
          ><span>背景音乐</span>
          <button class="px-btn sm" :class="{ gray: !s.music }" @click="s.music = !s.music">{{ s.music ? '开' : '关' }}</button>
        </label>
        <label class="row"><span>音乐音量</span><input v-model.number="s.musicVolume" type="range" min="0" max="1" step="0.05" /></label>
        <label class="row"><span>音效音量</span><input v-model.number="s.sfxVolume" type="range" min="0" max="1" step="0.05" /></label>
        <div class="row">
          <span>当前曲目</span>
          <em>{{ s.useLocalMusic ? store.localMusicName || '本地音乐' : '《中国人能飞》' }}</em>
        </div>
        <div class="row">
          <button class="px-btn sm" @click="file?.click()">导入本地音乐</button>
          <button v-if="s.useLocalMusic" class="px-btn sm gray" @click="useDefault">恢复默认</button>
          <input ref="file" type="file" accept="audio/*" hidden @change="onFile" />
        </div>
        <p v-if="msg" class="msg">{{ msg }}</p>
      </section>

      <section>
        <h3>🖥 画质</h3>
        <div class="seg">
          <button v-for="q in qualities" :key="q.v" class="px-btn sm" :class="{ gray: s.quality !== q.v }" @click="s.quality = q.v">
            {{ q.t }}
          </button>
        </div>
        <p class="hint">
          当前生效：{{ qName[store.effectiveQuality] }}{{ s.quality === 'auto' ? '（自动：低帧率时会自动减少粒子、背景层与震动）' : '' }}
        </p>
        <label class="row"
          ><span>手机震动</span>
          <button class="px-btn sm" :class="{ gray: !s.vibration }" @click="s.vibration = !s.vibration">{{ s.vibration ? '开' : '关' }}</button>
        </label>
      </section>

      <section>
        <h3>🌌 宇宙种子</h3>
        <p class="hint">本次宇宙编号：#{{ store.run.seed }}（决定荒诞区域的顺序与物体分布）</p>
        <label class="row"
          ><span>固定宇宙</span>
          <button class="px-btn sm" :class="{ gray: !s.fixedSeed }" @click="s.fixedSeed = !s.fixedSeed">{{ s.fixedSeed ? '开' : '关' }}</button>
        </label>
        <label v-if="s.fixedSeed" class="row"
          ><span>种子</span><input v-model.number="s.seed" class="seed" type="number" min="0" max="999999" />
        </label>
        <p v-if="s.fixedSeed" class="hint">重新开始后生效</p>
      </section>

      <section>
        <h3>💾 存档</h3>
        <div class="hint">
          最高高度 {{ store.records.bestAltText }} · {{ store.records.bestZoneName }}<br />
          最长飞行 {{ formatTime(store.records.longestFlight) }} · 起飞 {{ store.records.totalFlights }} 次
        </div>
        <button class="px-btn sm red" @click="reset">清除纪录与成就</button>
      </section>

      <button class="px-btn close" @click="close">完成</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { store, resetRecords, type Quality } from '../store/gameStore'
import { audio } from '../game/systems/AudioSystem'
import { formatTime } from '../game/systems/format'

const s = store.settings
const file = ref<HTMLInputElement>()
const msg = ref('')
const qualities: { v: Quality; t: string }[] = [
  { v: 'auto', t: '自动' },
  { v: 'high', t: '高' },
  { v: 'medium', t: '中' },
  { v: 'low', t: '低' },
]
const qName = { high: '高', medium: '中', low: '低' }

async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  msg.value = '解码中…'
  try {
    audio.unlock()
    await audio.importLocal(f)
    msg.value = `已切换为：${f.name}`
  } catch {
    msg.value = '无法解析该音频文件'
  }
}
function useDefault() {
  audio.useDefault()
  msg.value = '已恢复《中国人能飞》'
}
function reset() {
  if (confirm('确定清除所有纪录与成就吗？')) resetRecords()
}
function close() {
  store.ui.settingsOpen = false
}
</script>

<style scoped>
section {
  border-top: 2px dashed #3a444e;
  padding: 10px 0;
}
h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #9fe0b8;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 6px 0;
  font-size: 14px;
}
.row em {
  font-style: normal;
  color: var(--yellow);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.seg {
  display: flex;
  flex-wrap: wrap;
}
.px-btn.sm {
  padding: 5px 12px;
  font-size: 14px;
}
input[type='range'] {
  flex: 1;
  max-width: 200px;
  accent-color: #1d7b50;
}
.seed {
  width: 120px;
  font: inherit;
  padding: 4px 8px;
  border: 3px solid #000;
}
.hint,
.msg {
  font-size: 12px;
  color: #aab4be;
  margin: 4px 0;
  line-height: 1.6;
}
.msg {
  color: var(--yellow);
}
.close {
  width: calc(100% - 8px);
  margin-top: 10px;
}
</style>
