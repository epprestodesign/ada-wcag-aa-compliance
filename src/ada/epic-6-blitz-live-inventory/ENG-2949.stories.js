// ENG-2949 · ADA-BLITZ-RES-00 — Global blitz foundation: viewport zoom, skip
// link + <main>, focus outlines, secondary + status color palette.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2949.linear.md?raw'
import GlobalNav from '../../presto/components/GlobalNav.vue'
import PageFrame from '../../presto/components/PageFrame.vue'

export default {
  title: 'Epic 6 – blitz Live Inventory/ADA-BLITZ-RES-00 – Global Foundation, Focus & Color Palette',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2949'),
}

const ID = 'ENG-2949'

const ITEMS = {
  zoom: { n: 1, title: 'Viewport meta blocks pinch-to-zoom', wcag: ['1.4.4'], element: 'Document · viewport meta', where: 'blitz/index.html:7' },
  bypass: { n: 2, title: 'No skip link and no <main> landmark', wcag: ['2.4.1'], element: 'App shell · skip link + main landmark', where: 'blitz/src/App.vue' },
  focus: { n: 3, title: 'Focus is only a 15% tint, same as hover', wcag: ['2.4.7'], element: 'Global CSS · all interactive controls', where: 'blitz (no :focus-visible styling anywhere) · Quasar .q-focus-helper' },
  palette: { n: 4, title: 'Secondary and six status colors fail contrast', wcag: ['1.4.3'], element: 'Color tokens · --q-secondary + status classes', where: 'blitz/src/main.ts:41 · blitz/src/css/status-colors.scss' },
}

// Production status classes (Linear item 4). `mode` says how the color is used.
const STATUS_NOW = [
  { cls: '.status-orange', hex: '#FFA000', mode: 'fill' },
  { cls: '.status-cyan', hex: '#3ADEFF', mode: 'fill' },
  { cls: '.status-pink', hex: '#ff8ebd', mode: 'fill' },
  { cls: '.status-red-2', hex: '#F86969', mode: 'fill' },
  { cls: '.status-outlined-green', hex: '#60C540', mode: 'text' },
  { cls: '.status-processed', hex: '#51a57f', mode: 'fill' },
]

// Agent Option B: each failing class mapped to a Presto palette step
// (src/presto/css/ds-palette.scss) that keeps the hue and clears 4.5:1.
const STATUS_FIX = [
  { cls: '.status-orange', token: '--ds-palette-amber-700', hex: '#B45309', mode: 'fill' },
  { cls: '.status-cyan', token: '--ds-palette-cyan-800', hex: '#155E75', mode: 'fill' },
  { cls: '.status-pink', token: '--ds-palette-pink-700', hex: '#BE185D', mode: 'fill' },
  { cls: '.status-red-2', token: '--ds-palette-red-700', hex: '#B91C1C', mode: 'fill' },
  { cls: '.status-outlined-green', token: '--ds-palette-green-700', hex: '#15803D', mode: 'text' },
  { cls: '.status-processed', token: '--ds-palette-emerald-700', hex: '#047857', mode: 'fill' },
]

const CODE = {
  skip: `<!-- blitz/src/App.vue -->
<q-layout>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <q-page-container>
    <main id="main-content" tabindex="-1">
      <router-view />
    </main>
  </q-page-container>
</q-layout>

<style>
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 16px; top: 16px; z-index: 9999; }
</style>`,
  bypassBad: `<!-- blitz/src/App.vue (today) -->
<q-layout>
  <q-page-container>
    <router-view />   <!-- /reservations, /reservations/lookup -->
  </q-page-container>
</q-layout>`,
  focusBad: `/* Quasar's only focus cue — same on hover and focus */
.q-focus-helper { opacity: 0.15; background: currentColor; }
/* blitz adds no :focus-visible rule */`,
  focusFix: `/* blitz/src/css/app.scss */
:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}`,
  focusRing: `/* Fixed ring color that doesn't follow the tenant primary */
:root { --focus-ring: #01113E; } /* Presto --ds-color-border-focused */
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px; /* ring sits on the page, not on the pill fill */
}`,
  paletteA: `// blitz/src/main.ts:41
secondary: '#59606E', // 6.32:1 on white

// blitz/src/css/status-colors.scss — every class below needs a
// passing value (Linear gives none; see Option B):
// .status-orange .status-cyan .status-pink .status-red-2
// .status-outlined-green .status-processed
// Leave .status-confirmed and the grey fallback alone.`,
  paletteB: `// blitz/src/css/status-colors.scss — white text on a -700/-800 fill
.status-orange    { background: #B45309; color: #fff; } // amber-700   5.02:1
.status-cyan      { background: #155E75; color: #fff; } // cyan-800    7.27:1
.status-pink      { background: #BE185D; color: #fff; } // pink-700    6.04:1
.status-red-2     { background: #B91C1C; color: #fff; } // red-700     6.47:1
.status-processed { background: #047857; color: #fff; } // emerald-700 5.48:1
.status-outlined-green {                                 // text + border on white
  color: #15803D; border-color: #15803D;                 // green-700   5.02:1
}`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE, STATUS_NOW }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Four app-wide foundations in blitz, the live-inventory guest app. They affect every screen: the reservation lookup, the reservations list, and the modification dialog.">

  <ada-item v-bind="I.zoom">
    <p><code>maximum-scale=1</code> in the viewport meta stops pinch-to-zoom on mobile, so low-vision guests can't enlarge the page.</p>
    <ada-code tone="bad" caption="Production — blitz/index.html:7" code='<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Never disable user scaling (maximum-scale below 5, or user-scalable=no).">
      <p>Confirmed. It's the same defect as fuse (ENG-2922 item 2), so both apps can take the same one-line fix.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.bypass">
    <p>There's no skip link. There's also no <code>&lt;main&gt;</code> or <code>role="main"</code> on <code>/reservations</code> or <code>/reservations/lookup</code>, so a skip link would have nothing to target, and screen-reader users can't jump to the main content by landmark.</p>
    <ada-code tone="bad" caption="Production pattern — blitz/src/App.vue" lang="vue" :code="CODE.bypassBad" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule='The skip link must be the first focusable element and target a main landmark with tabindex="-1".'>
      <p>Agrees. Add <code>tabindex="-1"</code> to the <code>&lt;main&gt;</code> target, or some browsers scroll to it without moving focus.</p>
    </agent-check>
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Each page needs exactly one main landmark wrapping its primary content.">
      <p>Confirmed. Put <code>&lt;main&gt;</code> in <code>App.vue</code> around <code>&lt;router-view&gt;</code>, so every route gets it once, not in each view.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focus">
    <p>Quasar's <code>.q-focus-helper</code> is a 0.15-opacity background tint that shows the same way on hover and on keyboard focus. It isn't an outline, and nothing in blitz adds a <code>:focus-visible</code> style, so keyboard users can't see where they are.</p>
    <ada-code tone="bad" caption="Production — Quasar default, no blitz override" lang="css" :code="CODE.focusBad" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Every focusable element needs a visible indicator; a hover-identical tint doesn't count.">
      <p>Confirmed.</p>
    </agent-check>
    <agent-check agent="contrast-master" verdict="refines" rule="1.4.11: a focus indicator needs 3:1 against adjacent colors; use :focus-visible, 2px minimum.">
      <p>A <code>var(--q-primary)</code> ring only passes while primary is dark. On colored status pills or primary buttons it can disappear, so check the ring on every background, or use a two-tone ring (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.palette">
    <p>Linear's recomputed ratios are all confirmed below. Every class is white text on the color, except <code>.status-outlined-green</code>, which is green text and border on white.</p>
    <div class="ada-contrast-grid">
      <contrast-pair fg="#8C92A0" bg="#FFFFFF" label="--q-secondary text on white" />
      <template v-for="s in STATUS_NOW" :key="s.cls">
        <contrast-pair v-if="s.mode === 'fill'" fg="#FFFFFF" :bg="s.hex" :label="s.cls + ' (white text on fill)'" pill sample="Status" />
        <contrast-pair v-else :fg="s.hex" bg="#FFFFFF" :label="s.cls + ' (text on white)'" sample="Status" />
      </template>
    </div>
    <agent-check agent="contrast-master" verdict="agrees" rule="Normal text needs 4.5:1, including small status labels.">
      <p>All seven ratios match Linear to two decimals (3.12, 2.04, 1.61, 2.13, 2.91, 2.20, 2.98). The corrected values are right.</p>
    </agent-check>
    <agent-check agent="design-system-auditor" verdict="refines" rule="Fix contrast at the token source; every failing token needs a named, passing replacement.">
      <p>Linear names a replacement only for secondary: <code>#59606E</code>, which measures <strong>6.32:1</strong>. For the six status classes it just says "fix", so Option B maps each one to a Presto palette step. <code>.status-outlined-green</code> is text and a border, so its border also needs 3:1 (1.4.11); green-700 covers both.</p>
    </agent-check>
    <agent-check agent="contrast-master" verdict="refines" rule="1.4.1: never convey information through color alone.">
      <p>The status pills show a text label (ENG-2952 item 4 sets white label text), so they don't rely on color alone. But some opposite statuses share a color (Upcoming and Expired are both orange), so keep the label, and consider adding an icon.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, GlobalNav, PageFrame },
    setup: () => ({ ID, I: ITEMS, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no blitz screens, but it shares the same app shell and palette. Press Tab through the frames to see what keyboard users get.">

  <ada-item v-bind="I.zoom">
    <ada-before status="resolved" source="presto-2026 prototype › index.html" :href="PRESTO.prototype">
      <ada-code tone="good" caption="presto-2026/prototype/index.html:5" code='<meta name="viewport" content="width=device-width, initial-scale=1.0" />' />
      <template #notes><p>No <code>maximum-scale</code>, so zoom works in the redesign.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.bypass">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Page Frame" :href="PRESTO.story('app-shell-page-frame--book-reservation')">
      <page-frame brand="Presto">
        <div style="padding:24px"><p style="margin:0">Page body</p></div>
      </page-frame>
      <template #notes>
        <p><code>PageFrame.vue</code> renders <code>GlobalNav</code>, then <code>&lt;div class="pf__body"&gt;</code>, then the footer. There's no <code>&lt;main&gt;</code> and no skip link, and the prototype <code>App.vue</code> doesn't add them either.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Global Nav" :href="PRESTO.story('app-shell-global-nav-cart-book-reservation--reserve-cart')">
      <global-nav brand="Soccer League" />
      <template #notes>
        <p><code>src/presto/css/*</code> has no <code>:focus-visible</code> rule, and <code>app.scss</code> leaves Quasar's focus helper as is. The redesign has the same gap.</p>
        <p>Note: the audit kit adds its own focus ring inside this page, so this frame may look better than presto-2026 really is.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.palette">
    <ada-before status="partial" source="presto-2026 Storybook › Table / With Status Chips" :href="PRESTO.story('components-layout-structure-table--with-status-chips')">
      <div class="ada-flawed ada-row" style="align-items:center">
        <q-chip dense text-color="white" color="positive">Confirmed</q-chip>
        <q-chip dense text-color="white" color="warning">Pending</q-chip>
        <q-chip dense text-color="white" color="negative">Cancelled</q-chip>
      </div>
      <div class="ada-contrast-grid">
        <contrast-pair fg="#475569" bg="#FFFFFF" label="presto $secondary (Slate 600) on white" />
        <contrast-pair fg="#FFFFFF" bg="#16A34A" label="Chip · white on $positive" pill sample="Confirmed" />
        <contrast-pair fg="#FFFFFF" bg="#FACC15" label="Chip · white on $warning" pill sample="Pending" />
        <contrast-pair fg="#FFFFFF" bg="#DC2626" label="Chip · white on $negative" pill sample="Cancelled" />
      </div>
      <template #notes>
        <p><strong>Resolved:</strong> secondary is already Slate 600, 7.58:1 (<code>quasar.variables.scss:17</code>).</p>
        <p><strong>Still present:</strong> the Table story's status chips use white text on <code>$positive</code> (3.30:1) and <code>$warning</code> (1.53:1). Both fail, so presto-2026 has no passing status palette yet.</p>
      </template>
    </ada-before>
  </ada-item>
</ada-issue>`,
  }),
}

/* --------------------------------------------------------------- Proposal */
export const Proposal = {
  parameters: VIEW_PARAMS.proposal,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, CODE, STATUS_FIX }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press Tab through the demos to check them.">

  <ada-item v-bind="I.zoom">
    <ada-option letter="A" title="Remove maximum-scale=1" recommended
      code='<meta name="viewport" content="width=device-width, initial-scale=1">' />
  </ada-item>

  <ada-item v-bind="I.bypass">
    <ada-option letter="A" title="Skip link plus a main landmark in App.vue" recommended lang="vue" :code="CODE.skip">
      <div class="ada-mini-frame ada-focus-demo" style="position:relative;min-height:120px;padding-top:48px">
        <a href="#ada-2949-main" class="ada-skip-demo">Skip to main content</a>
        <p class="ada-note">Click here, then press <kbd>Tab</kbd>. The skip link appears first.</p>
        <nav aria-label="Demo header" class="ada-row" style="margin:8px 0"><a href="#r1" @click.prevent>Reservations</a><a href="#r2" @click.prevent>Find a reservation</a></nav>
        <main id="ada-2949-main" tabindex="-1" style="padding:8px;border:1px dashed #94A3B8">Main content</main>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.focus">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Global :focus-visible outline" recommended lang="css" :code="CODE.focusFix">
        <div class="ada-row ada-focus-demo">
          <q-btn unelevated color="primary" no-caps label="Find reservation" />
          <q-btn outline color="primary" no-caps label="Modify" />
          <a href="#privacy" @click.prevent>Privacy policy</a>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="contrast-master" title="Fixed Navy ring with an offset, separate from the brand color" lang="css" :code="CODE.focusRing">
        <div class="ada-row ada-focus-demo" style="align-items:center">
          <q-btn unelevated no-caps label="Upcoming" style="background:#B45309;color:#fff" />
          <q-btn unelevated no-caps label="Cancelled" style="background:#B91C1C;color:#fff" />
        </div>
        <template #why><p>The offset puts the ring on the white page (18.24:1), not on the colored fill. Its color comes from its own token, so a light tenant primary can't make it disappear. It matches presto's <code>--ds-color-border-focused</code>.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.palette">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken --q-secondary to #59606E and fix every failing status class" recommended lang="ts" :code="CODE.paletteA">
        <contrast-pair fg="#59606E" bg="#FFFFFF" label="Proposed --q-secondary" />
        <p class="ada-note" style="margin-top:8px">Linear lists the classes to fix but gives no replacement colors. Option B supplies them.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Map each status class to a Presto palette step" lang="scss" :code="CODE.paletteB">
        <div class="ada-contrast-grid">
          <template v-for="s in STATUS_FIX" :key="s.cls">
            <contrast-pair v-if="s.mode === 'fill'" fg="#FFFFFF" :bg="s.hex" :label="s.cls + ' → ' + s.token" pill sample="Status" />
            <contrast-pair v-else :fg="s.hex" bg="#FFFFFF" :label="s.cls + ' → ' + s.token" sample="Status" />
          </template>
        </div>
        <template #why><p>Each class keeps its hue but moves to a step from <code>ds-palette.scss</code>, so blitz and presto-2026 share one status palette. The same mapping fixes the pills in ENG-2952.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
