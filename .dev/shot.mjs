import { chromium } from 'playwright'
const [url, out, w='1400', h='1800', wait='800'] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h } })
p.on('console', m => { if (m.type()==='error' || m.type()==='warning') console.log('console:', m.text()) })
p.on('pageerror', e => console.log('pageerror:', e.message))
await p.goto(url); await p.waitForTimeout(+wait)
await p.screenshot({ path: out, fullPage: true }); await b.close()
