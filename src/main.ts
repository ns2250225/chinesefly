import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 点击按钮后移除焦点，避免空格键再次触发按钮
document.addEventListener('click', (e) => (e.target as HTMLElement).closest?.('button')?.blur())

createApp(App).mount('#app')
