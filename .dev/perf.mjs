import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 420, height: 860 } })
p.on('pageerror', e => console.log('pageerror:', e.message))
await p.goto('http://localhost:5173/'); await p.waitForTimeout(1500)
await p.click('.start', { force: true }); await p.waitForTimeout(300)
console.log(await p.evaluate(() => { const a = window.__game.audio; return [a.ctx.state, a.bgmBuffer?.duration, !!a.bgmSource] }))
await p.keyboard.down('Space')
const stat = () => p.evaluate(() => { const sc = window.__game.game.scene.getScene('Main'); return [sc.children.length, sc.chunks.pool.count, window.__game.store.hud.zoneIndex+1, Math.round(sc.game.loop.actualFps)] })
for (const d of [0, 200000, 500000, 900000, 1500000, 2500000]) {
  if (d) await p.evaluate((d) => window.__game.bus.emit('debug', d), d)
  for (let i = 0; i < 3; i++) { await p.waitForTimeout(5000); console.log(d, JSON.stringify(await stat())) }
}
await p.screenshot({ path: '/tmp/perf.png' })
await b.close()
