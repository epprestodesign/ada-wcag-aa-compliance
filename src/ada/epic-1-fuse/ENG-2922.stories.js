// ENG-2922 · ADA-FUSE-00 — Global Foundations: focus outlines, viewport zoom,
// skip link, theme contrast, nested anchors.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2922.linear.md?raw'
import GlobalNav from '../../presto/components/GlobalNav.vue'
import HotelCardReserve from '../../presto/components/browse/HotelCardReserve.vue'
import { sampleRooms } from '../../presto/stories/browse/_rooms-sample.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-00 – Global Foundations',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2922'),
}

const ID = 'ENG-2922'

const ITEMS = {
  focus: { n: 1, title: 'Keyboard focus is invisible app-wide', wcag: ['2.4.7'], element: 'Global CSS · all interactive controls', where: 'fuse/src/assets/global.css (all 5 lines) · Quasar `no-outline` render class' },
  zoom: { n: 2, title: 'Viewport meta blocks pinch-to-zoom', wcag: ['1.4.4'], element: 'Document · viewport meta', where: 'fuse/index.html:6' },
  skip: { n: 3, title: 'No skip-to-content link', wcag: ['2.4.1'], element: 'App shell · header', where: 'fuse/src/App.vue:56-63' },
  secondary: { n: 4, title: 'Default secondary color fails contrast (#8C92A0 ≈ 3.12:1)', wcag: ['1.4.3'], element: 'Color token · --q-secondary', where: 'fuse/src/main.ts:57 (fetchCustomColors(), L48-61)' },
  nested: { n: 5, title: 'Buttons nested inside <a> (header + hotel cards)', wcag: ['4.1.2'], element: 'Header links · hotel result cards', where: 'CompanyHeader.vue:103-105, :124-133 · ContractedHotelCard.vue:64-258 · LiveHotelCard.vue:115-201' },
}

const hotel = {
  name: 'The Minuteman Inn', city: 'Acton', stars: 2.5, distance: '3.48 miles from Acton Boxborough',
  preferred: true, refundable: true, fromNightly: 100, total: 400, rooms: sampleRooms,
  imageCategories: ['exterior', 'lobby', 'rooms'], seed: 1, availability: 'available',
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Five app-wide foundations in fuse. Each is small, but together they block keyboard, low-vision and screen-reader users on every page.">

  <ada-item v-bind="I.focus">
    <p>Every Quasar interactive component renders with a built-in <code>no-outline</code> class, and nothing in app CSS adds a focus indicator back. The only cue is <code>.q-focus-helper</code>, a 15%-opacity tint that looks the same on hover.</p>
    <ada-code tone="bad" caption="Production — Quasar render output (no app override)" code='<button class="q-btn ... no-outline" tabindex="0">…</button>' />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Every focusable element needs a visible indicator; never remove outlines without a replacement.">
      <p>Confirmed: Tab-only users can't tell where they are.</p>
    </agent-check>
    <agent-check agent="contrast-master" verdict="refines" rule="WCAG 2.4.11 / 1.4.11: focus indicators need ≥3:1 against adjacent colors.">
      <p>A <code>var(--q-primary)</code> outline passes only while primary stays dark. Whitelabel primaries can be light (e.g. yellow), so the ring color should be checked against the page as part of the same contrast contract as item 4.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.zoom">
    <p><code>maximum-scale=1</code> stops pinch-to-zoom on mobile Safari and Chrome, so low-vision users can't enlarge text.</p>
    <ada-code tone="bad" caption="Production — fuse/index.html:6" code='<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Never disable user scaling (maximum-scale < 5 or user-scalable=no).">
      <p>Confirmed. Also check that no <code>user-scalable=no</code> is added elsewhere.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.skip">
    <p>The shell is just <code>&lt;q-layout&gt;&lt;q-page-container&gt;&lt;CompanyHeader/&gt;&lt;router-view/&gt;</code>. There's no skip link, and no <code>&lt;main&gt;</code> for one to point to.</p>
    <ada-code tone="bad" caption="Production — fuse/src/App.vue:56-63" lang="vue" code="<q-layout>
  <q-page-container>
    <CompanyHeader />
    <router-view />
  </q-page-container>
</q-layout>" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="Skip link must be the first focusable element and target a focusable landmark.">
      <p>Agrees. Also give the <code>#main-content</code> target <code>tabindex="-1"</code> and render it as <code>&lt;main&gt;</code>, or some browsers won't move focus when the link is used.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.secondary">
    <contrast-pair fg="#8C92A0" bg="#FFFFFF" label="Production default --q-secondary on white" />
    <p>This is the stubbed whitelabel value from <code>fetchCustomColors()</code>, so fixing the default alone won't stop a customer brand color from failing later.</p>
    <agent-check agent="design-system-auditor" verdict="refines" rule="Validate contrast at the token source, not per component.">
      <p>Agrees it fails at 3.12:1. <strong>Number check:</strong> Linear's proposed <code>#596070</code> measures <strong>6.30:1</strong> on white, not the ≈5.8:1 in the ticket. It still passes; only the cited figure is off.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.nested">
    <p>Interactive content inside an <code>&lt;a&gt;</code> is invalid HTML. Screen readers read it as one link with a garbled name, and a click on the inner button also fires the link.</p>
    <ada-code tone="bad" caption="Production pattern — CompanyHeader.vue / ContractedHotelCard.vue" code='<a :href="url" target="_blank">
  <q-btn label="Manage Booking" />
</a>

<a :href="hotelUrl">          <!-- whole card -->
  …
  <q-btn icon="close" />      <!-- L103-111 -->
  <ReserveButton />           <!-- L241 -->
</a>' />
    <agent-check agent="aria-specialist" verdict="agrees" rule="Interactive elements must not be nested (axe: nested-interactive).">
      <p>Confirmed. For the cards, use the "stretched link" pattern (item 5, Option B) so the whole card stays clickable without nesting.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, GlobalNav, HotelCardReserve },
    setup: () => ({ ID, I: ITEMS, hotel, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same foundations in the presto-2026 redesign. Press Tab through each frame to see what keyboard users see.">

  <ada-item v-bind="I.focus">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Global Nav" :href="PRESTO.story('app-shell-global-nav-cart-book-reservation--reserve-cart')">
      <global-nav brand="Soccer League" />
      <template #notes>
        <p>presto-2026 imports Quasar's CSS unchanged and has no <code>:focus-visible</code> rule in <code>src/css/*</code>. Tab onto <strong>Manage Booking</strong> and you get the same faint tint as production.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.zoom">
    <ada-before status="resolved" source="presto-2026 prototype › index.html" :href="PRESTO.prototype">
      <ada-code tone="good" caption="presto-2026/prototype/index.html:5 (also prototype-mobile)" code='<meta name="viewport" content="width=device-width, initial-scale=1.0" />' />
      <template #notes><p>No <code>maximum-scale</code>, so zoom works in the redesign. Carry this meta over when fuse adopts it.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.skip">
    <ada-before status="applies" source="presto-2026 Storybook › Global Nav + Page Frame" :href="PRESTO.prototype">
      <global-nav brand="Soccer League" />
      <template #notes><p>The first Tab stop is the brand link. There's no skip link in the nav, <code>PageFrame</code> or the prototype <code>App.vue</code>.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.secondary">
    <ada-before status="resolved" source="presto-2026 › src/css/quasar.variables.scss:17">
      <contrast-pair fg="#475569" bg="#FFFFFF" label="presto-2026 $secondary (Slate 600) on white" />
      <template #notes><p>The redesign already uses Slate 600 (7.58:1). The whitelabel contract is still open: nothing stops a tenant color from overriding it.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.nested">
    <ada-before status="resolved" source="presto-2026 Storybook › Hotel Listing Card / Book Reservations" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--fully-available')">
      <div style="max-width:1040px"><hotel-card-reserve v-bind="hotel" /></div>
      <template #notes>
        <p>The presto-2026 card isn't wrapped in an <code>&lt;a&gt;</code>. Its CTA and carousel controls are separate controls, so no nesting.</p>
        <p><strong>Partial:</strong> the Global Nav's "Contact Us" is an <code>&lt;a href="#"&gt;</code> used as a dropdown toggle. That's not nesting, but it's the wrong role; see ENG-2930 item 4.</p>
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
    setup: () => ({ ID, I: ITEMS }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press Tab through the demos to check them.">

  <ada-item v-bind="I.focus">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Global :focus-visible outline in global.css" recommended
        code=":focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}" lang="css">
        <div class="ada-row ada-focus-demo">
          <q-btn unelevated color="primary" label="Search hotels" no-caps />
          <q-btn outline color="primary" label="Manage Booking" no-caps />
          <a href="#focus-demo" @click.prevent>Privacy policy</a>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="contrast-master" title="Two-tone ring that survives any brand color"
        code=":focus-visible {
  outline: 2px solid #FFFFFF;           /* inner ring */
  box-shadow: 0 0 0 4px #7DD3FC;        /* outer ring */
}" lang="css">
        <div class="ada-row" style="background:#01113E;padding:12px;border-radius:4px">
          <q-btn unelevated color="primary" no-caps label="Search hotels" class="ada-ring-demo" />
          <q-btn outline color="white" no-caps label="Manage Booking" class="ada-ring-demo" />
        </div>
        <template #why><p>The white inner ring keeps the indicator visible even when a tenant's primary is light, or when the control sits on a primary-colored background.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.zoom">
    <ada-option letter="A" title="Drop maximum-scale from the viewport meta" recommended
      code='<meta name="viewport" content="width=device-width, initial-scale=1">' />
  </ada-item>

  <ada-item v-bind="I.skip">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Skip link as first child of App.vue, targeting #main-content" recommended lang="vue"
        code='<q-layout>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <CompanyHeader />
  <q-page-container>
    <main id="main-content" tabindex="-1">
      <router-view />
    </main>
  </q-page-container>
</q-layout>

.skip-link { position:absolute; left:-9999px; }
.skip-link:focus { left:16px; top:16px; z-index:9999; }'>
        <div class="ada-mini-frame ada-focus-demo" style="position:relative;min-height:120px;padding-top:48px">
          <a href="#ada-skip-target" class="ada-skip-demo">Skip to main content</a>
          <p class="ada-note">Click here, then press <kbd>Tab</kbd>: the skip link appears first.</p>
          <nav aria-label="Demo header" class="ada-row" style="margin:8px 0"><a href="#n1" @click.prevent>Brand</a><a href="#n2" @click.prevent>Contact Us</a><a href="#n3" @click.prevent>Manage Booking</a></nav>
          <main id="ada-skip-target" tabindex="-1" style="padding:8px;border:1px dashed #94A3B8">Main content</main>
        </div>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.secondary">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken default secondary to #596070 and flag fetchCustomColors()" recommended lang="ts"
        code="// main.ts — fetchCustomColors()
secondary: '#596070', // 6.30:1 on white
// TODO(a11y): tenant colors must pass a contrast contract before use">
        <contrast-pair fg="#596070" bg="#FFFFFF" label="Proposed default secondary" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Reuse presto-2026 Slate 600 and add a runtime guard for tenant colors" lang="ts"
        code="const MIN = 4.5
function safeBrand(hex, fallback = '#475569') {
  return contrast(hex, '#FFFFFF') >= MIN ? hex : fallback
}
setCssVar('secondary', safeBrand(tenant.secondary))">
        <contrast-pair fg="#475569" bg="#FFFFFF" label="presto-2026 Slate 600" />
        <template #why><p>This matches the redesign's token and turns the "contrast contract" into code: a failing tenant color falls back to a passing one instead of shipping.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.nested">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Remove the <a> wrapper — use q-btn :href / target" recommended lang="vue"
        code='<q-btn :href="manageUrl" target="_blank" label="Manage Booking"
       aria-label="Manage Booking (opens in a new tab)" />'>
        <q-btn outline color="primary" no-caps href="#manage" label="Manage Booking" aria-label="Manage Booking (opens in a new tab)" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Cards: stretched-link pattern keeps the whole card clickable" lang="html"
        code='<article class="card" style="position:relative">
  <h3><a href="/hotel/123" class="stretched">The Minuteman Inn</a></h3>
  …
  <button class="card__action" style="position:relative;z-index:1">Reserve</button>
</article>
.stretched::after { content:""; position:absolute; inset:0; }'>
        <article class="ada-mini-frame ada-focus-demo" style="position:relative;max-width:360px">
          <h3 style="margin:0 0 4px;font-size:16px"><a href="#hotel" @click.prevent style="text-decoration:none" class="ada-stretched">The Minuteman Inn</a></h3>
          <p class="ada-note" style="margin-bottom:8px">Acton · 3.48 miles away</p>
          <q-btn unelevated color="primary" no-caps label="Reserve" style="position:relative;z-index:1" aria-label="Reserve at The Minuteman Inn" />
        </article>
        <template #why><p>The card is clickable through the heading link's <code>::after</code> overlay. The Reserve button sits above it as its own control, and a screen reader hears one clear link name.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
