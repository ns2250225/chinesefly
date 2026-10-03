# 中国人能飞 · 2D 像素无限飞行网页小游戏

Vue 3 + TypeScript + Phaser 3 + Web Audio API 实现，按 `prd.md` 开发。

## 运行

```bash
npm install
npm run dev      # 开发，默认 http://localhost:5173
npm run build    # 生产构建，输出到 dist/（可直接静态部署）
npm run preview  # 预览构建结果
```

## 操作

- 手机：长按底部「按住飞行」按钮（或按住画面任意位置）
- 电脑：鼠标长按按钮，或长按 `Space` / `↑` / `W`；`Esc` / `P` 暂停

## 目录

```
src/
├─ assets/audio/zhongguoren.mp3   背景音乐（Web Audio 无缝循环）
├─ game/
│  ├─ art/        像素美术（运行时逐像素绘制；主角参考 people.jpeg 重新设计）
│  ├─ scenes/     BootScene / StartScene / MainFlightScene / PauseScene
│  ├─ entities/   Player / EventObject / BackgroundObject（对象池）
│  ├─ systems/    Flight / Zone / Chunk / Event / Achievement / Audio / SetPiece / format
│  └─ config/     zones / themes / events / achievements
├─ components/    HUD / FlightButton / PauseMenu / SettingsPanel / ShareCard / AchievementPanel
└─ store/         gameStore（Vue 与 Phaser 的状态桥 + localStorage / IndexedDB）
```

## 版权说明

《中国人能飞》音乐若用于商业发布需获得授权。游戏内「设置 → 导入本地音乐」可替换 BGM（保存在 IndexedDB）。
