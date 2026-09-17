// Screenshot + axe check for ADA stories against a running Storybook
// (dev server or a served static build).
//   node scripts/ada-check.mjs <storyId> [...storyId]
//   node scripts/ada-check.mjs --all        every story in <BASE>/index.json
//
//   BASE=http://127.0.0.1:6006 (default)  OUT=<dir> to save full-page PNGs
//   ALL_NODES=1 to list every failing node (default: first 3 per rule)
//   SCOPE=body to also scan teleported content (open q-dialog / DsModal)
//
// Exit code is 1 when any story has a console error or renders empty, or when
// an Issue / Proposal / Overview story has an axe violation. "Before" stories
// document existing presto-2026 defects, so their axe findings are reported
// but don't fail the run. Contrast swatches ([data-ada-swatch]) are excluded —
// they render the failing production color on purpose.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeSrc = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const BASE = (process.env.BASE || 'http://127.0.0.1:6006').replace(/\/$/, '')
const OUT = process.env.OUT
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

let ids = process.argv.slice(2)
if (ids.includes('--all')) {
  const index = await (await fetch(`${BASE}/index.json`)).json()
  ids = Object.values(index.entries).filter((e) => e.type === 'story').map((e) => e.id)
}
if (!ids.length) {
  console.error('Usage: node scripts/ada-check.mjs <storyId…> | --all')
  process.exit(2)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
let errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)))
page.on('console', (m) => {
  if (m.type() === 'error' || (m.type() === 'warning' && /Vue warn/.test(m.text()))) errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`)
})

const failures = []
let advisory = 0
for (const id of ids) {
  errors = []
  await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const empty = await page.evaluate(() => !document.querySelector('#storybook-root')?.children.length)
  if (OUT) await page.screenshot({ path: `${OUT}/${id}.png`, fullPage: true })

  // Storybook's a11y addon runs its own axe in the preview; inject ours only if
  // absent and retry while the addon's run is still in progress.
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: axeSrc })
  let violations
  for (let attempt = 0; ; attempt++) {
    try {
      violations = await page.evaluate(async ({ tags, all, scope }) => {
        const r = await window.axe.run(
          { include: [[scope]], exclude: [['[data-ada-swatch]']] },
          { runOnly: { type: 'tag', values: tags } },
        )
        return r.violations.map((v) => `${v.id} ×${v.nodes.length} → ${v.nodes.slice(0, all ? undefined : 3).map((n) => n.target.join(' ')).join(' | ')}`)
      }, { tags: TAGS, all: !!process.env.ALL_NODES, scope: process.env.SCOPE || '#storybook-root' })
      break
    } catch (e) {
      if (attempt >= 5 || !/already running/i.test(String(e))) throw e
      await page.waitForTimeout(500)
    }
  }

  const isBefore = id.endsWith('--before')
  const blocking = empty || errors.length || (violations.length && !isBefore)
  if (blocking) failures.push(id)
  else if (violations.length) advisory++

  console.log(`\n== ${id}${empty ? '  ⚠ EMPTY RENDER' : ''}${violations.length && isBefore ? '  (advisory: Before story)' : ''}`)
  console.log(`   axe: ${violations.length ? violations.join('\n        ') : 'clean'}`)
  if (errors.length) console.log(`   console:\n     ${[...new Set(errors)].slice(0, 10).join('\n     ')}`)
}
await browser.close()

console.log(`\nChecked ${ids.length} stories: ${ids.length - failures.length} passed, ${failures.length} failed, ${advisory} Before stories with advisory findings.`)
if (failures.length) console.log(`Failed:\n  ${failures.join('\n  ')}`)
process.exit(failures.length ? 1 : 0)
