# Authoring an ADA issue component

Every Linear issue in **ADA / WCAG 2.1 AA Compliance** is one Storybook
component with exactly three stories: **Issue → Before → Proposal**. The
reference implementation is `src/ada/epic-1-fuse/ENG-2922.stories.js`. Copy
its structure.

## Files per issue

```
src/ada/<epic-dir>/<ENG-id>.linear.md     ← Linear description, VERBATIM
src/ada/<epic-dir>/<ENG-id>.stories.js    ← the component (3 stories)
```

Epic directories: `epic-1-fuse`, `epic-2-platform-reservation`,
`epic-3-platform-group-block`, `epic-4-platform-self-service`,
`epic-5-platform-order-management`, `epic-6-blitz-live-inventory`.

## Story file contract

```js
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-XXXX.linear.md?raw'

export default {
  title: '<Epic title exactly as in issues.js EPICS>/<ADA-KEY> – <Short title>',
  tags: ['autodocs'],
  parameters: issueParams('ENG-XXXX'),
}
export const Issue = { parameters: VIEW_PARAMS.issue, render: … }
export const Before = { parameters: VIEW_PARAMS.before, render: … }
export const Proposal = { parameters: VIEW_PARAMS.proposal, render: … }
```

* `title` and `tags` **must be string literals** (Storybook indexes them
  statically). Use ` – ` (en dash) between key and title. Never use `/` inside
  the short title, or `·`.
* Define an `ITEMS` object once, and use `v-bind="I.x"` on `<ada-item>` in all
  three stories so item N is the same element in each view.
* One `<ada-item>` per numbered problem in the Linear issue. Keep Linear's
  numbering and order. If Linear lists a "New" or "Corrected" finding, give it
  `state="new"` / `state="corrected"`. Use `state="refuted"` for ❌ REFUTED
  items and `state="unverified"` for "not independently verifiable" items.
* Each item carries `wcag`, `element` (what kind of thing it is: screen,
  heading, form field, color token, modal, table, link…), and `where` (the
  production file:line Linear cites, copied exactly).

## The three views

**Issue:** per item, restate the problem in plain language (faithful to
Linear, never contradicting it). Add an `<ada-code tone="bad">` snippet of the
flawed production pattern, a `<contrast-pair>` for any color finding, and an
optional `<sr-output>`. Then add **at least one** `<agent-check>`: pick the
specialist whose rules match (see table) and state the rule applied. Verdict:

* `agrees`: the rules confirm the finding and the fix.
* `refines`: agrees, but adds a nuance, a numeric correction, or a better
  pattern.
* `disagrees`: the rules conflict with Linear. Explain why. Never edit
  Linear's text to match.

Verify every contrast number yourself (`src/presto/stories/_contrast.js`).
If it differs from Linear by more than 0.05, record that in a `refines`
agent-check.

**Before:** per item, show the matching **presto-2026** element (import
real components from `../../presto/components/**`, with sample data from
`../../presto/stories/**`). Wrap it in `<ada-before>` with:

* `status="applies"`: the redesign repeats the defect (inspect the presto
  component source to confirm, and say where).
* `status="partial"` / `status="resolved"`: explain what's already right.
* `status="no-equivalent"`: presto-2026 has no such screen or element.
  Render **no** component, and optionally replace the `#empty` slot text.

Link `source`/`href` to the live presto-2026 story
(`PRESTO.story('<story-id>')`) or prototype (`PRESTO.prototype`,
`PRESTO.prototypeMobile`). Only use story IDs that exist in the published
presto-2026 index. Use a `#notes` slot to explain the verdict. Never
fabricate a defect in a presto component; only report what its source shows.

**Proposal:** per item, `<div class="ada-options ada-options--2">` containing:

* **Option A**: exactly the Linear acceptance-criteria fix
  (`origin="linear"`, usually `recommended`), with a **live, accessible demo**
  built from Quasar/presto components where practical, plus `code`.
* **Option B/C** (only when they add real value): `origin="agent"
  agent="<slug>"`, with a `#why` slot. Examples: a palette color that also
  fits the Presto tokens, table vs list, a `<dialog>` pattern.
* Refuted items: a single Option A titled "No change needed", which restates
  what Linear says to keep.

Proposal demos **must pass axe**. Before stories may show axe findings only if
they come from the presto component itself, and those should line up with the
item.

## Agent roster (Community-Access/accessibility-agents)

| Topic | Agent slug |
|---|---|
| ARIA roles/states, tabs, carousels, custom widgets | `aria-specialist` |
| Contrast, color-only cues, focus indicator color | `contrast-master` |
| Token-level color / focus-ring contracts | `design-system-auditor` |
| Labels, errors, validation, wizards, grouping | `forms-specialist` |
| Keyboard access, focus order, skip links | `keyboard-navigator` |
| Dialogs, alertdialogs, popovers, focus trap/return | `modal-specialist` |
| Tables, rosters, comparison grids | `tables-data-specialist` |
| Loading, status, timers, results counts, copy confirmations | `live-region-controller` |
| Alt text, headings, landmarks, page language | `alt-text-headings` |
| Link purpose, new-tab warnings, dead `href="#"` | `link-checker` |
| Timing, plain language, error recovery | `cognitive-accessibility` |

Agent definitions: `~/.claude/plugins/cache/community-access/accessibility-agents/*/agents/<slug>.md`.
Read the relevant file(s) and apply their rules. Quote or paraphrase the
specific rule in `rule="…"`.

## Kit components (`src/ada/_kit`)

`<ada-issue issue-id view linear-md summary>` · `<ada-item n title wcag state element where>` ·
`<agent-check agent verdict rule>` · `<ada-before status source href>` (+ `#notes`, `#empty`) ·
`<ada-option letter title origin agent recommended code lang>` (+ `#why`) ·
`<ada-code code lang caption tone="bad|good">` · `<contrast-pair fg bg label size="normal|large|ui" pill>` ·
`<sr-output before after>`.
Helper classes: `ada-options ada-options--2`, `ada-row`, `ada-stack`, `ada-note`,
`ada-mini-frame`, `ada-focus-demo` (visible focus ring on descendants), `ada-sr-only`.

Vue template gotchas: the template is a JS template literal, so escape
backticks and `${`. Inside the template, write `&lt;` / `&gt;` for literal
angle brackets in prose, and pass code through the `code` prop (single-quoted
attribute if the code contains double quotes). Don't use inline `onfocus`/
`onclick` attributes; use Vue `@click.prevent` or kit CSS classes. Demo links
use `href="#…"` with `@click.prevent`.

## Checking your work

A Storybook dev server runs at `http://127.0.0.1:6006`. Story IDs are the
lower-kebab title: e.g. `epic-1-fuse-ada-fuse-00-global-foundations--issue`.

```
node scripts/ada-check.mjs <id>--issue <id>--before <id>--proposal
OUT=/some/dir node scripts/ada-check.mjs …   # also saves screenshots
```

Notes:
* Story IDs drop `&` and other punctuation, so "A & B" becomes `a-b`. Always
  confirm them in `http://127.0.0.1:6006/index.json`.
* `ALL_NODES=1` lists every failing node. `SCOPE=body` also scans teleported
  dialogs.
* In zsh, pass several IDs as separate words (or use an array), not as one
  quoted string.
* `v-close-popup` is registered globally.

Fix every console error, empty render, and Proposal/Issue axe violation.
Look at the screenshots.
