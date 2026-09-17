// ENG-2951 · ADA-BLITZ-RES-02 — End-user reservations dashboard: count title,
// search label, loading spinner, pagination, empty results.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, computed, watch } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2951.linear.md?raw'
import BrowseFilter from '../../presto/components/browse/Filter.vue'
import DsEmptyState from '../../presto/components/DsEmptyState.vue'

export default {
  title: 'Epic 6 – blitz Live Inventory/ADA-BLITZ-RES-02 – Reservations Dashboard & Search Controls',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2951'),
}

const ID = 'ENG-2951'
const VIEW = 'blitz/src/modules/reservation/views/EndUserReservationListView.vue'

const ITEMS = {
  title: { n: 1, title: 'Count title is a styled div, not an h1', wcag: ['1.3.1', '2.4.6'], element: 'Page heading', where: `${VIEW}:87` },
  search: { n: 2, title: 'Search input has only a placeholder', wcag: ['3.3.2', '1.3.1'], element: 'Form field · search', where: `${VIEW}:91-101` },
  spinner: { n: 3, title: 'Loading spinner has no role="status"', wcag: ['4.1.3'], element: 'Loading state · spinner', where: `${VIEW}:114` },
  pagination: { n: 4, title: 'Pagination has no nav landmark or page-change announcement', wcag: ['1.3.1', '4.1.3'], element: 'Pagination', where: `${VIEW}:127-137` },
  empty: { n: 5, title: 'Zero-result searches show nothing', wcag: ['4.1.3'], state: 'new', element: 'Empty state · search results', where: `${VIEW}:117-139` },
}

// Reservation rows — same sample as presto-2026's Table story.
const columns = [
  { name: 'guest', label: 'Guest', field: 'guest', align: 'left' },
  { name: 'room', label: 'Room', field: 'room', align: 'left' },
  { name: 'checkin', label: 'Check-in', field: 'checkin', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]
const rows = [
  { guest: 'Ada Lovelace', room: 'Deluxe King', checkin: 'Jun 2', status: 'Confirmed' },
  { guest: 'Alan Turing', room: 'Twin/Double', checkin: 'Jun 3', status: 'Confirmed' },
  { guest: 'Grace Hopper', room: 'Ocean Suite', checkin: 'Jun 5', status: 'Pending' },
  { guest: 'Katherine Johnson', room: 'Family Room', checkin: 'Jun 6', status: 'Cancelled' },
]

const CODE = {
  titleBad: `<!-- ${VIEW}:87 -->
<div class="text-h5 ...">{{ count }} Reservations</div>`,
  searchBad: `<!-- ${VIEW}:91-101 -->
<q-input v-model="search" outlined placeholder="Search…">
  <template #prepend><q-icon name="search" /></template>
</q-input>`,
  spinnerBad: `<!-- ${VIEW}:114 -->
<q-spinner v-if="loading" size="40px" />   <!-- no role, no text -->`,
  paginationBad: `<!-- ${VIEW}:127-137 -->
<div class="...">
  <q-pagination v-model="page" :max="pages" />
</div>   <!-- no nav wrapper, page change is silent -->`,
  emptyBad: `<!-- ${VIEW}:117-139 — every branch needs a non-empty array -->
<template v-if="reservations.length">
  <EndUserReservationCard v-for="r in reservations" … />
  …pagination…
</template>
<!-- nothing renders when a search matches 0 reservations -->`,
  titleA: `<h1 class="text-h5 q-my-none">{{ count }} Reservations</h1>`,
  searchA: `<q-input v-model="search" outlined placeholder="Search…"
         aria-label="Search reservations">
  <template #prepend><q-icon name="search" /></template>
</q-input>`,
  searchB: `<form role="search" @submit.prevent>
  <q-input v-model="search" outlined label="Search reservations"
           hint="Guest name, hotel, or confirmation number">
    <template #prepend><q-icon name="search" /></template>
  </q-input>
</form>`,
  spinnerA: `<div v-if="loading" role="status" class="flex flex-center">
  <q-spinner size="40px" aria-hidden="true" />
  <span class="sr-only">Loading reservations…</span>
</div>`,
  spinnerB: `<!-- The status region is always mounted; only its text changes -->
<div role="status" class="sr-only">{{ loading ? 'Loading reservations…' : '' }}</div>
<q-spinner v-if="loading" size="40px" aria-hidden="true" />`,
  paginationA: `<nav aria-label="Reservation pages">
  <q-pagination v-model="page" :max="pages" direction-links />
</nav>
<div aria-live="polite" class="sr-only">{{ pageAnnouncement }}</div>

// script
watch(page, (p) => { pageAnnouncement.value = \`Page \${p} of \${pages.value}\` })`,
  emptyA: `<div role="status" class="sr-only">{{ resultsMessage }}</div>
<template v-if="reservations.length">…</template>
<p v-else-if="search" class="text-body1">
  No reservations found for “{{ search }}”.
</p>

// script
const resultsMessage = computed(() => reservations.value.length
  ? \`\${reservations.value.length} reservations found\`
  : 'No reservations found')`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The signed-in guest's list of reservations in blitz, with a search box and pagination. Structure and status changes aren't exposed to assistive technology.">

  <ada-item v-bind="I.title">
    <p>The count title ("N Reservations") is a <code>&lt;div class="text-h5"&gt;</code>. It looks like the page heading, but it isn't one, so the page has no <code>&lt;h1&gt;</code>.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.titleBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Each page has exactly one h1 that describes its purpose.">
      <p>Confirmed.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="refines" rule="Result counts that change after a search belong in a polite status region.">
      <p>The number in the heading changes when the guest searches, but a heading change isn't announced. Keep the <code>&lt;h1&gt;</code>, and also announce the new count (see item 5).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.search">
    <p>The search box has a placeholder and an icon, but no label. The placeholder disappears when the guest types, and many screen readers don't use it as a name.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.searchBad" />
    <sr-output before="edit text" after="Search reservations, edit text" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Never use a placeholder as the only label; prefer a visible label, and aria-label is acceptable for a search field.">
      <p>Agrees. <code>aria-label</code> is enough to pass. A visible label is better, and wrapping the field in <code>role="search"</code> lets screen-reader users jump to it (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.spinner">
    <p>While reservations load, a bare <code>&lt;q-spinner&gt;</code> shows. In the Quasar 2.33 installed here it renders an SVG with no role or text, so nothing is announced.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.spinnerBad" />
    <agent-check agent="live-region-controller" verdict="refines" rule="A live region must exist in the DOM before its content changes.">
      <p>Agrees. But if <code>role="status"</code> goes on the <code>v-if</code> spinner wrapper itself, the region and its text appear together, and some screen readers skip it. A status region that stays mounted is more reliable (Option B). Also hide the SVG with <code>aria-hidden="true"</code>.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.pagination">
    <p>The page controls aren't in a labeled navigation landmark, and changing the page updates the list without telling screen-reader users.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.paginationBad" />
    <agent-check agent="aria-specialist" verdict="refines" rule="Landmarks should be unique and not duplicated by nesting.">
      <p><code>QPagination</code> already renders <code>role="navigation"</code> and <code>aria-current</code> on the current page. In Quasar 2.19.3 (presto-2026's version) that landmark has no name; newer 2.x releases add <code>aria-label="Pagination"</code>. An extra <code>&lt;nav&gt;</code> wrapper therefore creates two nested navigation landmarks. Name the component's own landmark instead (<code>&lt;q-pagination aria-label="Reservation pages"&gt;</code>) and add the announcement.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="agrees" rule='Pagination changes are announced politely, e.g. "Page 2 of 5".'>
      <p>Confirmed.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.empty">
    <p>When a search matches nothing, the list, the cards and the pagination all disappear, and no message replaces them. Sighted users see a blank area, and screen-reader users hear nothing.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.emptyBad" />
    <agent-check agent="live-region-controller" verdict="agrees" rule='Announce result counts, including "No results found", through a polite status region.'>
      <p>Confirmed. Show a visible message, and announce the result count (including zero) in a status region.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, BrowseFilter, DsEmptyState },
    setup: () => ({ ID, I: ITEMS, PRESTO, columns, rows, search: ref(''), page: ref(3) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no guest reservations dashboard, but it has the same building blocks: a reservations table, a text search, spinners, pagination and empty states.">

  <ada-item v-bind="I.title">
    <ada-before status="applies" source="presto-2026 Storybook › Table / With Status Chips" :href="PRESTO.story('components-layout-structure-table--with-status-chips')">
      <q-table title="Reservations" :rows="rows" :columns="columns" row-key="guest" flat bordered hide-bottom style="max-width:760px" />
      <template #notes><p>The Table story's "Reservations" title is QTable's <code>title</code> prop, which renders <code>&lt;div class="q-table__title"&gt;</code>, not a heading. It's the same defect.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.search">
    <ada-before status="applies" source="presto-2026 Storybook › Search & Filters › Property Search" :href="PRESTO.story('browse-hotels-components-left-rail-search-filters--property-search')">
      <div style="max-width:420px"><browse-filter type="propertySearch" v-model="search" /></div>
      <template #notes><p><code>Filter.vue:387</code> renders <code>&lt;input :placeholder&gt;</code> with no label. The "Search By Property Name" <code>&lt;h3&gt;</code> above it isn't linked to it, so the input has no accessible name, like blitz.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.spinner">
    <ada-before status="applies" source="presto-2026 Storybook › Progress / Spinners" :href="PRESTO.story('components-feedback-status-progress--spinners')">
      <div class="ada-row" style="align-items:center"><q-spinner size="40px" color="primary" /><q-spinner-dots size="40px" color="primary" /><span class="ada-note">Two animated Quasar spinners (QSpinner, QSpinnerDots)</span></div>
      <template #notes><p>presto-2026 uses Quasar's spinners as they are. They have no role and no text, so they're silent to screen readers.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.pagination">
    <ada-before status="partial" source="presto-2026 Storybook › Footer / Pagination › Rich" :href="PRESTO.story('browse-hotels-components-footer-pagination--rich')">
      <q-pagination v-model="page" :max="15" :max-pages="6" boundary-numbers direction-links color="primary" />
      <template #notes>
        <p><strong>Handled:</strong> in Quasar 2.19.3, <code>QPagination</code> renders <code>role="navigation"</code> and marks the current page with <code>aria-current</code>. <strong>Gap:</strong> the landmark has no name, so it's announced as just "navigation".</p>
        <p><strong>Missing:</strong> no story or results page announces the new page after a change.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.empty">
    <ada-before status="partial" source="presto-2026 Storybook › Empty States › No Results" :href="PRESTO.story('browse-hotels-components-results-empty-states--no-results')">
      <ds-empty-state icon="search_off" title="No hotels match your filters"
        description="Try widening your dates, raising your price range, or removing a filter.">
        <template #action><q-btn flat color="primary" label="Clear filters" /></template>
      </ds-empty-state>
      <template #notes>
        <p><strong>Handled:</strong> presto-2026 has a visible no-results state that explains what to do next.</p>
        <p><strong>Missing:</strong> <code>DsEmptyState.vue:12</code> renders the title as <code>&lt;div class="text-h6"&gt;</code>, not a heading, and nothing puts the message in a status region, so it isn't announced when results empty out.</p>
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
    setup() {
      const searchA = ref('')
      const searchB = ref('')
      const loadingA = ref(false)
      const loadingB = ref(false)
      const load = (r) => { r.value = true; setTimeout(() => { r.value = false }, 1800) }
      const page = ref(1)
      const pages = 5
      const pageMsg = ref('')
      watch(page, (p) => { pageMsg.value = `Page ${p} of ${pages}` })
      const pageB = ref(1)
      const pageMsgB = ref('')
      watch(pageB, (p) => { pageMsgB.value = `Page ${p} of ${pages}` })
      const q = ref('')
      const matches = computed(() => rows.filter((r) => r.guest.toLowerCase().includes(q.value.trim().toLowerCase())))
      const resultsMsg = computed(() => (matches.value.length ? `${matches.value.length} reservations found` : 'No reservations found'))
      return { ID, I: ITEMS, CODE, searchA, searchB, loadingA, loadingB, load, page, pages, pageMsg, pageB, pageMsgB, q, matches, resultsMsg }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press Tab through the demos and try the search and pagination.">

  <ada-item v-bind="I.title">
    <ada-option letter="A" title="Make the count title an h1" recommended lang="vue" :code="CODE.titleA">
      <div class="ada-mini-frame"><h1 class="text-h5" style="margin:0">4 Reservations</h1></div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.search">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add aria-label to the search input" recommended lang="vue" :code="CODE.searchA">
        <div class="ada-focus-demo" style="max-width:360px">
          <q-input v-model="searchA" outlined dense placeholder="Search…" aria-label="Search reservations">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Visible label inside a search landmark" lang="vue" :code="CODE.searchB">
        <form role="search" class="ada-focus-demo" style="max-width:360px" @submit.prevent>
          <q-input v-model="searchB" outlined dense label="Search reservations" hint="Guest name, hotel, or confirmation number">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </form>
        <template #why><p>The label stays visible while the guest types. The search landmark lets screen-reader users jump straight to the field.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.spinner">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="role=&quot;status&quot; plus visually hidden loading text" recommended lang="vue" :code="CODE.spinnerA">
        <div class="ada-stack ada-focus-demo">
          <div><q-btn unelevated color="primary" no-caps label="Reload reservations" @click="load(loadingA)" /></div>
          <div v-if="loadingA" role="status" class="ada-row" style="align-items:center">
            <q-spinner size="32px" color="primary" aria-hidden="true" />
            <span class="ada-sr-only">Loading reservations…</span>
          </div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="A status region that stays mounted" lang="vue" :code="CODE.spinnerB">
        <div class="ada-stack ada-focus-demo">
          <div><q-btn unelevated color="primary" no-caps label="Reload reservations" @click="load(loadingB)" /></div>
          <div role="status" class="ada-note">{{ loadingB ? 'Loading reservations…' : '' }}</div>
          <q-spinner v-if="loadingB" size="32px" color="primary" aria-hidden="true" />
        </div>
        <template #why><p>The region exists before the text changes, so every screen reader announces it. The text is visible here to show it working; in blitz it can use <code>sr-only</code>.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.pagination">
    <div class="ada-options ada-options--2">
    <ada-option letter="A" title="Labeled nav plus an aria-live page announcement" lang="vue" :code="CODE.paginationA">
      <div class="ada-stack ada-focus-demo">
        <nav aria-label="Reservation pages">
          <q-pagination v-model="page" :max="pages" direction-links color="primary" />
        </nav>
        <div aria-live="polite" class="ada-note">{{ pageMsg }}</div>
      </div>
      <template #why><p>As written in Linear. Note that <code>QPagination</code> already renders <code>role="navigation"</code>, so this wrapper nests a second navigation landmark. Option B avoids that.</p></template>
    </ada-option>
    <ada-option letter="B" origin="agent" agent="aria-specialist" title="Name QPagination's own landmark; keep the announcement" recommended lang="vue"
      code='<q-pagination v-model="page" :max="pages" direction-links
              aria-label="Reservation pages" />
<div class="sr-only" aria-live="polite">{{ pageMsg }}</div>'>
      <div class="ada-stack ada-focus-demo">
        <q-pagination v-model="pageB" :max="pages" direction-links color="primary" aria-label="Reservation pages, option B" />
        <div aria-live="polite" class="ada-note">{{ pageMsgB }}</div>
      </div>
      <template #why><p><code>QPagination</code> is already a navigation landmark (Quasar 2.19.3 and later), so labelling it directly gives one clearly named landmark instead of two nested ones.</p></template>
    </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.empty">
    <ada-option letter="A" title="Visible no-results message plus an announced count" recommended lang="vue" :code="CODE.emptyA">
      <div class="ada-stack ada-focus-demo" style="max-width:420px">
        <q-input v-model="q" outlined dense label="Search reservations by guest" hint="Try &quot;zz&quot; for no results" />
        <div role="status" class="ada-note">{{ resultsMsg }}</div>
        <ul v-if="matches.length" style="margin:0;padding-left:20px">
          <li v-for="r in matches" :key="r.guest">{{ r.guest }} · {{ r.room }}</li>
        </ul>
        <p v-else style="margin:0">No reservations found for “{{ q }}”.</p>
      </div>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
