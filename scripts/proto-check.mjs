// Accessibility check for the accessible prototypes (Playwright + axe-core).
//   node scripts/proto-check.mjs [screen…]      default: every screen, both flows
//   BASE=http://127.0.0.1:6100 (default)  OUT=<dir> to save full-page PNGs
//   WIDTH=1440 (use 390 for the phone layout)
//
// The prototype deep-links through the URL (?screen=…&flow=…), so each screen is
// audited directly. Exits 1 on any violation, console error or empty render.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeSrc = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const BASE = (process.env.BASE || 'http://127.0.0.1:6100').replace(/\/$/, '')
const OUT = process.env.OUT
const WIDTH = Number(process.env.WIDTH || 1440)
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// screen, flow, extra query — enough state for the screen to render fully.
const DEFAULT = [
  ['landing', 'reserve', ''],
  ['browse', 'reserve', ''],
  ['details', 'reserve', '&hotel=The%20Minuteman%20Inn&city=Acton'],
  ['checkout', 'reserve', '&hotel=The%20Minuteman%20Inn&city=Acton&n=1'],
  ['confirmation', 'reserve', '&hotel=The%20Minuteman%20Inn&city=Acton&n=1'],
  ['browse', 'group', '&rooms=10'],
  ['details', 'group', '&hotel=The%20Minuteman%20Inn&city=Acton&rooms=10'],
  ['checkout', 'group', '&hotel=The%20Minuteman%20Inn&city=Acton&n=1&rooms=10'],
  ['confirmation', 'group', '&hotel=The%20Minuteman%20Inn&city=Acton&n=1&rooms=10'],
]

const wanted = process.argv.slice(2)
const targets = wanted.length ? DEFAULT.filter(([s]) => wanted.includes(s)) : DEFAULT

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: WIDTH, height: 1000 } })
let errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)))
page.on('console', (m) => {
  if (m.type() === 'error' || (m.type() === 'warning' && /Vue warn/.test(m.text()))) errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`)
})

let failed = 0
for (const [screen, flow, extra] of targets) {
  errors = []
  const id = `${screen}-${flow}`
  await page.goto(`${BASE}/?screen=${screen}&flow=${flow}${extra}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const empty = await page.evaluate(() => !document.querySelector('#app')?.children.length)
  if (OUT) await page.screenshot({ path: `${OUT}/proto-${id}-${WIDTH}.png`, fullPage: true })
  await page.addScriptTag({ content: axeSrc })
  const violations = await page.evaluate(async (tags) => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } })
    return r.violations.map((v) => `${v.id} ×${v.nodes.length} → ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | ')}`)
  }, TAGS)
  if (empty || errors.length || violations.length) failed++
  console.log(`\n== ${id} @${WIDTH}${empty ? '  ⚠ EMPTY' : ''}`)
  console.log(`   axe: ${violations.length ? violations.join('\n        ') : 'clean'}`)
  if (errors.length) console.log(`   console:\n     ${[...new Set(errors)].slice(0, 8).join('\n     ')}`)
}
await browser.close()
console.log(`\n${targets.length - failed}/${targets.length} screens clean`)
process.exit(failed ? 1 : 0)
