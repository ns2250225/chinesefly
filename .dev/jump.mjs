import { chromium } from 'playwright'
const [w='420', h='860'] = process.argv.slice(2)
const dists = (process.argv[4] || '').split(',').map(Number)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h } })
p.on('console', m => { if (['error','warning'].includes(m.type()) && !m.text().includes('GL Driver')) console.log('console:', m.text()) })
p.on('pageerror', e => console.log('pageerror:', e.message))
await p.goto('http://localhost:5173/'); await p.waitForTimeout(1500)
await p.click('.start', { force: true }); await p.waitForTimeout(400)
await p.keyboard.down('Space'); await p.waitForTimeout(2500)
let i = 0
for (const d of dists) {
  await p.evaluate((d) => window.__game.bus.emit('debug', d), d)
  await p.waitForTimeout(+(process.env.WAIT||3500))
  await p.screenshot({ path: `/tmp/j_${i++}.png` })
  console.log(d, JSON.stringify(await p.evaluate(() => { const s = window.__game.store; return [s.hud.altitude, s.hud.speed, s.hud.gear, s.hud.zoneIndex+1, s.hud.zoneName, s.effectiveQuality] })))
}
await b.close()
