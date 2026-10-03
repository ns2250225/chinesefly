<template>
  <div class="wrap">
    <button
      ref="btn"
      class="fly-btn"
      :class="['lvl' + store.holdLevel, { down: store.holding }]"
      @pointerdown.prevent="onDown"
      @pointerup.prevent="onUp"
      @pointercancel="onUp"
      @lostpointercapture="onUp"
      @contextmenu.prevent
    >
      <span class="ring" :style="{ '--p': progress }"></span>
      <span class="label">🚀 {{ store.holding ? levelText : '按住飞行' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { store, setHold, vibrate } from '../store/gameStore'
import { audio } from '../game/systems/AudioSystem'

const btn = ref<HTMLButtonElement>()
const LEVEL_TEXT = ['起飞中', '喷射！', '加速！！', '尾焰全开', '残影模式', '爆发态！！！']
const levelText = computed(() => LEVEL_TEXT[store.holdLevel])
// 进度环：距离下一个长按层级
const progress = computed(() => {
  const t = store.hud.holdTime
  const marks = [0, 1, 5, 10, 20, 30]
  const l = store.holdLevel
  if (l >= 5) return 1
  return (t - marks[l]) / (marks[l + 1] - marks[l])
})

function onDown(e: PointerEvent) {
  audio.unlock()
  btn.value?.setPointerCapture(e.pointerId)
  setHold('button', true)
  vibrate(15)
}
function onUp() {
  setHold('button', false)
}
</script>

<style scoped>
.wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: max(26px, calc(env(safe-area-inset-bottom) + 14px));
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.fly-btn {
  pointer-events: auto;
  position: relative;
  width: min(78vw, 320px);
  height: 76px;
  border: none;
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  text-shadow: 3px 3px 0 #000;
  background: linear-gradient(#e8333a, #b5262b);
  box-shadow:
    0 -8px 0 0 #7a1015 inset,
    0 0 0 4px #000,
    0 8px 0 4px #000,
    0 0 0 8px #ffe14a,
    0 8px 0 8px #000;
  transition:
    transform 0.05s,
    box-shadow 0.05s;
  touch-action: none;
  overflow: visible;
}
.fly-btn.down {
  transform: translateY(6px);
  box-shadow:
    0 -2px 0 0 #7a1015 inset,
    0 0 0 4px #000,
    0 2px 0 4px #000,
    0 0 0 8px #ffe14a,
    0 0 28px 12px rgba(255, 225, 74, 0.75);
}
.fly-btn.down.lvl2 {
  box-shadow:
    0 -2px 0 0 #7a1015 inset,
    0 0 0 4px #000,
    0 0 0 8px #ffe14a,
    0 0 36px 16px rgba(255, 160, 40, 0.85);
}
.fly-btn.down.lvl3 {
  background: linear-gradient(#ff8a1a, #d4501a);
  box-shadow:
    0 -2px 0 0 #7a3010 inset,
    0 0 0 4px #000,
    0 0 0 8px #fff,
    0 0 44px 20px rgba(120, 200, 255, 0.85);
}
.fly-btn.down.lvl4 {
  background: linear-gradient(#5a6aff, #3a2ad4);
  box-shadow:
    0 0 0 4px #000,
    0 0 0 8px #9ff0ff,
    0 0 52px 24px rgba(150, 120, 255, 0.9);
  animation: shake 0.12s infinite;
}
.fly-btn.down.lvl5 {
  background: linear-gradient(90deg, #ff3a3a, #ffb03a, #ffe14a, #3aff7a, #3ab0ff, #b03aff);
  background-size: 300% 100%;
  box-shadow:
    0 0 0 4px #000,
    0 0 0 8px #fff,
    0 0 60px 30px rgba(255, 255, 255, 0.85);
  animation:
    shake 0.08s infinite,
    rainbow 0.8s linear infinite;
}
@keyframes shake {
  25% {
    transform: translate(5px, 7px);
  }
  75% {
    transform: translate(-5px, 5px);
  }
}
@keyframes rainbow {
  to {
    background-position: 300% 0;
  }
}
.ring {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  height: 6px;
  background: rgba(0, 0, 0, 0.35);
}
.ring::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: calc(var(--p) * 100%);
  background: #fff;
}
.label {
  position: relative;
  pointer-events: none;
}
</style>
