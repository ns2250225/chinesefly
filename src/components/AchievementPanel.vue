<template>
  <div class="modal-mask" @click.self="close">
    <div class="px-panel">
      <h2 class="panel-title">成就 {{ count }}/{{ ACHIEVEMENTS.length }}</h2>
      <ul>
        <li v-for="a in ACHIEVEMENTS" :key="a.id" :class="{ on: store.achievements[a.id] }">
          <span class="ico">{{ store.achievements[a.id] ? a.icon : '🔒' }}</span>
          <div>
            <b>{{ a.name }}</b>
            <small>{{ a.desc }}</small>
          </div>
          <time v-if="store.achievements[a.id]">{{ new Date(store.achievements[a.id]).toLocaleDateString() }}</time>
        </li>
      </ul>
      <button class="px-btn close" @click="close">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../store/gameStore'
import { ACHIEVEMENTS } from '../game/config/achievements'

const count = computed(() => ACHIEVEMENTS.filter((a) => store.achievements[a.id]).length)
function close() {
  store.ui.achievementsOpen = false
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin: 6px 0;
  background: #20262c;
  opacity: 0.55;
}
li.on {
  opacity: 1;
  background: #2a3a1a;
  box-shadow: inset 4px 0 0 var(--yellow);
}
.ico {
  font-size: 24px;
  width: 32px;
  text-align: center;
}
li div {
  flex: 1;
}
li b {
  display: block;
  font-size: 15px;
}
li small {
  color: #aab4be;
}
time {
  font-size: 11px;
  color: #9fe0b8;
}
.close {
  width: calc(100% - 8px);
  margin-top: 10px;
}
</style>
