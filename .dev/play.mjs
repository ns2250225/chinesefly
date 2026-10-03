import { chromium } from 'playwright'
const [w='420', h='860'] = process.argv.slice(2)
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
p.on('console', m => { if (['error','warning'].includes(m.type()) && !m.text().includes('GL Driver')) console.log('console:', m.text()) })
p.on('pageerror', e => console.log('pageerror:', e.message))
await p.goto('http://localhost:5173/'); await p.waitForTimeout(1500)
await p.screenshot({ path: '/tmp/s_title.png' })
await p.click('.start', { force: true }); await p.waitForTimeout(700)
await p.screenshot({ path: '/tmp/s_ready.png' })
await p.keyboard.down('Space')
const shots = [3, 10, 20, 32, 45, 58]
let t = 0
for (const s of shots) { await p.waitForTimeout((s - t) * 1000); t = s
  await p.screenshot({ path: `/tmp/s_${s}.png` })
  console.log(s, JSON.stringify(await p.evaluate(() => { const s = window.__game.store; return [s.hud.altitude, s.hud.speed, s.hud.gear, s.hud.zoneName] })))
}
await b.close()
