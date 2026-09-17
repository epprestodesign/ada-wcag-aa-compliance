// ENG-2952 · ADA-BLITZ-RES-03 — End-user reservation card: keyboard access,
// new-window warning, headings, status pill palette.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2952.linear.md?raw'
import HotelCardReserve from '../../presto/components/browse/HotelCardReserve.vue'
import { sampleRooms } from '../../presto/stories/browse/_rooms-sample.js'

export default {
  title: 'Epic 6 – blitz Live Inventory/ADA-BLITZ-RES-03 – Reservation Card & Accessible Status Badges',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2952'),
}

const ID = 'ENG-2952'
const CARD = 'blitz/src/modules/reservation/components/EndUserReservationCard.vue'
const PILL = 'blitz/src/components/event/reservations/ReservationStatusPill.vue'

const ITEMS = {
  keyboard: { n: 1, title: 'Clickable card can’t be reached by keyboard', wcag: ['2.1.1', '4.1.2'], element: 'Card · click handler', where: `${CARD}:85` },
  newWindow: { n: 2, title: 'window.open(_blank) with no warning', wcag: ['2.4.4', '3.2.5'], element: 'External navigation', where: `${CARD}:71-74, :158, :165` },
  headings: { n: 3, title: 'Event and hotel names are styled divs', wcag: ['1.3.1'], element: 'Card headings', where: `${CARD}:90, :102` },
  pills: { n: 4, title: 'Status pills fail contrast (white text)', wcag: ['1.4.3'], element: 'Status pill · color palette', where: `${PILL}:38, :45-58` },
}

// Presto card sample (same as the Hotel Listing Card story).
const hotel = {
  name: 'The Minuteman Inn', city: 'Acton', stars: 2.5, distance: '3.48 miles from Acton Boxborough',
  preferred: true, refundable: true, fromNightly: 100, total: 400, rooms: sampleRooms,
  imageCategories: ['exterior', 'lobby', 'rooms'], seed: 1,
}

// Production pill fills (white text) — Linear item 4.
const PILLS_NOW = [
  { label: 'Upcoming / Expired', hex: '#f9a000', line: 58 },
  { label: 'Cancelled', hex: '#f86969', line: 50 },
  { label: 'Waitlisted / Past', hex: '#9ca2b3', line: 54 },
  { label: 'Processed (.status-processed)', hex: '#51a57f', line: '45-47' },
]

// Option A: keep white text, move each fill to a passing Presto palette step.
const PILLS_SOLID = [
  { status: 'Upcoming', token: 'amber-700', hex: '#B45309' },
  { status: 'Expired', token: 'amber-700', hex: '#B45309' },
  { status: 'Cancelled', token: 'red-700', hex: '#B91C1C' },
  { status: 'Waitlisted', token: 'slate-600', hex: '#475569' },
  { status: 'Past', token: 'slate-600', hex: '#475569' },
  { status: 'Processed', token: 'emerald-700', hex: '#047857' },
]

// Option B: tinted pill (-800 text on -50/-100 fill) + a distinct icon per status.
const PILLS_TINT = [
  { status: 'Upcoming', icon: 'event', fg: '#92400E', bg: '#FFFBEB', token: 'amber-800 on amber-50' },
  { status: 'Expired', icon: 'history', fg: '#92400E', bg: '#FFFBEB', token: 'amber-800 on amber-50' },
  { status: 'Cancelled', icon: 'cancel', fg: '#991B1B', bg: '#FEF2F2', token: 'red-800 on red-50' },
  { status: 'Waitlisted', icon: 'hourglass_empty', fg: '#334155', bg: '#F1F5F9', token: 'slate-700 on slate-100' },
  { status: 'Past', icon: 'done_all', fg: '#334155', bg: '#F1F5F9', token: 'slate-700 on slate-100' },
  { status: 'Processed', icon: 'check_circle', fg: '#065F46', bg: '#ECFDF5', token: 'emerald-800 on emerald-50' },
]

const CODE = {
  keyboardBad: `<!-- ${CARD}:85 -->
<div class="reservation-card" @click.prevent="openReservation">
  …   <!-- not focusable, no role, no key handler -->
</div>`,
  newWindowBad: `// ${CARD}:71-74 (also :158, :165)
function openReservation () {
  window.open(url, '_blank')   // nothing tells the guest a new window opens
}`,
  headingsBad: `<!-- ${CARD}:90, :102 -->
<div class="event-name …">{{ eventName }}</div>
<div class="hotel-name …">{{ hotelName }}</div>`,
  pillsBad: `// ${PILL}
color: white;                          // :38
.status-processed { background: #51a57f; }  // :45-47
.status-cancelled { background: #f86969; }  // :50
.status-grey      { background: #9ca2b3; }  // :54 (Waitlisted / Past)
.status-orange    { background: #f9a000; }  // :58 (Upcoming / Expired)`,
  keyboardA: `<div class="reservation-card" role="link" tabindex="0"
     :aria-label="\`\${hotelName}, \${eventName} (opens in a new window)\`"
     @click="openReservation"
     @keydown.enter="openReservation">
  …
</div>`,
  keyboardB: `<article class="reservation-card" style="position:relative">
  <h2>{{ eventName }}</h2>
  <h3>
    <a :href="url" target="_blank" rel="noopener noreferrer" class="stretched">
      {{ hotelName }}<span class="sr-only"> (opens in a new window)</span>
    </a>
  </h3>
  …
</article>
.stretched::after { content: ""; position: absolute; inset: 0; }`,
  newWindowA: `<q-btn flat no-caps label="View reservation"
       aria-label="View reservation (opens in a new window)"
       @click="openReservation" />
// window.open(url, '_blank', 'noopener')`,
  newWindowB: `<a :href="url" target="_blank" rel="noopener noreferrer">
  View reservation
  <q-icon name="open_in_new" aria-hidden="true" />
  <span class="sr-only">(opens in a new window)</span>
</a>`,
  headingsA: `<h2 class="event-name …">{{ eventName }}</h2>
<h3 class="hotel-name …">{{ hotelName }}</h3>`,
  pillsA: `// ${PILL} — keep white text, darken the fills
color: white;
.status-orange    { background: #B45309; } // amber-700   5.02:1
.status-cancelled { background: #B91C1C; } // red-700     6.47:1
.status-grey      { background: #475569; } // slate-600   7.58:1
.status-processed { background: #047857; } // emerald-700 5.48:1`,
  pillsB: `<!-- ReservationStatusPill.vue -->
<span class="status-pill" :class="\`status-pill--\${tone}\`">
  <q-icon :name="icon" size="14px" aria-hidden="true" />
  {{ label }}
</span>

.status-pill--amber   { color: #92400E; background: #FFFBEB; } // 6.84:1
.status-pill--red     { color: #991B1B; background: #FEF2F2; } // 7.60:1
.status-pill--slate   { color: #334155; background: #F1F5F9; } // 9.45:1
.status-pill--emerald { color: #065F46; background: #ECFDF5; } // 7.29:1`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE, PILLS_NOW }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Each card in the blitz reservations list shows an event, a hotel and a status pill, and opens the reservation in a new window. Keyboard, structure and color all fall short.">

  <ada-item v-bind="I.keyboard">
    <p>The whole card is a click target (<code>@click.prevent</code>), but it's a plain element with no <code>tabindex</code>, role or key handler. Keyboard users can't open a reservation.</p>
    <ada-code tone="bad" caption="Production pattern" lang="vue" :code="CODE.keyboardBad" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="Use native interactive elements; tabindex=&quot;0&quot; on a div also needs a role and Enter handling.">
      <p>Agrees. Linear allows either fix. <code>tabindex="0"</code> alone isn't enough: the card also needs a role and an Enter key handler. The hotel-name link (Option B) gets all of that from native HTML, so it's the safer choice.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.newWindow">
    <p>The card opens the reservation with <code>window.open(url, '_blank')</code>. Nothing tells the guest a new window will open, which is disorienting, especially for screen-reader users who then lose the Back button.</p>
    <ada-code tone="bad" caption="Production" lang="js" :code="CODE.newWindowBad" />
    <agent-check agent="link-checker" verdict="refines" rule="Links that open in a new window or tab must say so.">
      <p>Agrees. Also add a visible icon, so sighted users get the same warning. A real <code>&lt;a target="_blank" rel="noopener noreferrer"&gt;</code> is better than <code>window.open</code>: it's announced as a link and supports middle-click and "copy link". If <code>window.open</code> stays, pass <code>'noopener'</code>.</p>
    </agent-check>
    <agent-check agent="cognitive-accessibility" verdict="agrees" rule="COGA guidance: reduce surprise and cognitive load (the agent reviews WCAG 2.2 AA and AAA criteria).">
      <p>Confirmed. Note that 3.2.5 is Level AAA, which Linear calls "best practice". The Level A/AA part of this item is 2.4.4.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.headings">
    <p>The event name and hotel name look like titles but are <code>&lt;div&gt;</code>s. Screen-reader users can't jump from card to card by heading.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.headingsBad" />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Heading levels follow the page outline without skipping.">
      <p>Agrees. With ENG-2951's <code>&lt;h1&gt;</code> ("N Reservations") above the list, event <code>&lt;h2&gt;</code> and hotel <code>&lt;h3&gt;</code> fit without skipping levels. Keep them in that order inside each card.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.pills">
    <p>The pill sets <code>color: white</code> (line 38) on light fills. All four fills fail. The ratios below match Linear.</p>
    <div class="ada-contrast-grid">
      <contrast-pair v-for="p in PILLS_NOW" :key="p.hex" fg="#FFFFFF" :bg="p.hex" :label="p.label + ' · line ' + p.line" pill :sample="p.label.split(' ')[0]" />
    </div>
    <ada-code tone="bad" caption="Production values (selector names are illustrative; Linear cites lines only)" lang="scss" :code="CODE.pillsBad" />
    <agent-check agent="contrast-master" verdict="agrees" rule="Small pill text is normal text and needs 4.5:1.">
      <p>Confirmed: 2.09, 2.91, 2.55 (the corrected value) and 2.98, all matching Linear.</p>
    </agent-check>
    <agent-check agent="contrast-master" verdict="refines" rule="1.4.1: never convey information through color alone.">
      <p>The pill shows its label, so it passes 1.4.1 today. But opposite statuses share a color (Upcoming and Expired are both orange; Waitlisted and Past are both grey), so color alone doesn't tell them apart. Option B adds a distinct icon for each status.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, HotelCardReserve },
    setup: () => ({ ID, I: ITEMS, PRESTO, hotel }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no guest reservation card. The hotel result card is the closest match: a card with a title, a status line and a call to action.">

  <ada-item v-bind="I.keyboard">
    <ada-before status="resolved" source="presto-2026 Storybook › Hotel Listing Card › Fully Available" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--fully-available')">
      <div style="max-width:1040px"><hotel-card-reserve v-bind="hotel" availability="available" /></div>
      <template #notes><p>The presto-2026 card isn't a click target. Its actions (photo arrows, Availability toggle, the call-to-action) are all real <code>&lt;button&gt;</code>s, so each one is reachable with Tab.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.newWindow">
    <ada-before status="no-equivalent">
      <template #empty>No presto-2026 component opens a new window: there's no <code>window.open</code> or <code>target="_blank"</code> in <code>src/presto/components</code>. The Proposal story shows the warning pattern to use if one is added.</template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.headings">
    <ada-before status="resolved" source="presto-2026 › HotelCardReserve.vue:88">
      <ada-code tone="good" caption="presto-2026 — the card title is a real heading" lang="vue" code='<h3 class="hc__name">{{ name }}</h3>' />
      <template #notes><p>The hotel name is an <code>&lt;h3&gt;</code>. The presto card has no event name to compare with.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.pills">
    <ada-before status="applies" source="presto-2026 Storybook › Hotel Listing Card › Doesn't Match Filters" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--doesnt-match-filters')">
      <div style="max-width:1040px"><hotel-card-reserve v-bind="hotel" availability="unmatched" /></div>
      <div class="ada-row" style="align-items:center;margin-top:12px">
        <q-chip dense text-color="white" color="positive">Confirmed</q-chip>
        <q-chip dense text-color="white" color="warning">Pending</q-chip>
      </div>
      <div class="ada-contrast-grid" style="margin-top:8px">
        <contrast-pair fg="#EA580C" bg="#FFFFFF" label="Card status · orange-600 text (16px semibold)" sample="Adjust your search" />
        <contrast-pair fg="#FFFFFF" bg="#16A34A" label="Table chip · white on $positive" pill sample="Confirmed" />
        <contrast-pair fg="#FFFFFF" bg="#FACC15" label="Table chip · white on $warning" pill sample="Pending" />
      </div>
      <template #notes>
        <p><strong>Handled:</strong> the card status pairs its text with an icon or dot, so it isn't color-only.</p>
        <p><strong>Still present:</strong> the "Adjust your search parameters" status uses <code>--ds-palette-orange-600</code> (<code>HotelCardReserve.vue:155</code>) at 3.56:1. At 16px it isn't large text, so it fails. The Table story's status chips (white on <code>$positive</code> and <code>$warning</code>) fail too.</p>
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
      const opened = ref('')
      const open = (what) => { opened.value = `Would open ${what} in a new window.` }
      return { ID, I: ITEMS, CODE, PILLS_SOLID, PILLS_TINT, opened, open }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press Tab and Enter on the demo cards.">

  <ada-item v-bind="I.keyboard">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Focusable card with keyboard support" recommended lang="vue" :code="CODE.keyboardA">
        <div class="ada-stack ada-focus-demo">
          <div class="ada-mini-frame" role="link" tabindex="0" style="cursor:pointer"
               aria-label="The Minuteman Inn, Summer Soccer Classic 2027 (opens in a new window)"
               @click="open('the reservation')" @keydown.enter="open('the reservation')">
            <p style="margin:0;font-weight:700">Summer Soccer Classic 2027</p>
            <p style="margin:0">The Minuteman Inn · Jun 16–19</p>
          </div>
          <p class="ada-note" role="status">{{ opened }}</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="keyboard-navigator" title="Hotel name as the link, stretched over the card" lang="vue" :code="CODE.keyboardB">
        <article class="ada-mini-frame ada-focus-demo" style="position:relative">
          <h2 style="margin:0;font-size:14px;font-weight:700">Summer Soccer Classic 2027</h2>
          <h3 style="margin:2px 0 4px;font-size:18px"><a href="#reservation" class="ada-stretched" @click.prevent="open('the reservation')">The Minuteman Inn<span class="ada-sr-only"> (opens in a new window)</span></a></h3>
          <p class="ada-note">Jun 16–19 · 1 room</p>
        </article>
        <template #why><p>The whole card stays clickable through the link's overlay, but keyboard and screen-reader users get one native link with a clear name. No custom key handling is needed.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.newWindow">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label that says it opens a new window" recommended lang="vue" :code="CODE.newWindowA">
        <div class="ada-focus-demo"><q-btn outline color="primary" no-caps label="View reservation" aria-label="View reservation (opens in a new window)" @click="open('the reservation')" /></div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="link-checker" title="Real link with a visible new-window icon" lang="vue" :code="CODE.newWindowB">
        <div class="ada-focus-demo">
          <a href="#reservation-b" @click.prevent="open('the reservation')" style="display:inline-flex;align-items:center;gap:4px">View reservation <q-icon name="open_in_new" size="16px" aria-hidden="true" /><span class="ada-sr-only">(opens in a new window)</span></a>
        </div>
        <template #why><p>Sighted users see the same warning that screen-reader users hear, and a native link supports middle-click and "copy link".</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.headings">
    <ada-option letter="A" title="Event name as h2, hotel name as h3" recommended lang="vue" :code="CODE.headingsA">
      <div class="ada-mini-frame">
        <h2 style="margin:0;font-size:16px;font-weight:700;line-height:1.3">Summer Soccer Classic 2027</h2>
        <h3 style="margin:2px 0 0;font-size:15px;font-weight:700;line-height:1.3">The Minuteman Inn</h3>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.pills">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darker fills that pass 4.5:1 with white text" recommended lang="scss" :code="CODE.pillsA">
        <div class="ada-row" style="margin-bottom:10px">
          <span v-for="p in PILLS_SOLID" :key="p.status" :style="{ background: p.hex, color: '#fff', borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }">{{ p.status }}</span>
        </div>
        <div class="ada-contrast-grid">
          <contrast-pair fg="#FFFFFF" bg="#B45309" label="Upcoming / Expired → amber-700" pill sample="Upcoming" />
          <contrast-pair fg="#FFFFFF" bg="#B91C1C" label="Cancelled → red-700" pill sample="Cancelled" />
          <contrast-pair fg="#FFFFFF" bg="#475569" label="Waitlisted / Past → slate-600" pill sample="Waitlisted" />
          <contrast-pair fg="#FFFFFF" bg="#047857" label=".status-processed → emerald-700" pill sample="Processed" />
        </div>
        <p class="ada-note" style="margin-top:8px">Linear asks for a passing palette without naming colors. These are Presto palette steps, the same ones used in ENG-2949 Option B.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="contrast-master" title="Tinted pills with a distinct icon per status" lang="vue" :code="CODE.pillsB">
        <div class="ada-row" style="margin-bottom:10px">
          <span v-for="p in PILLS_TINT" :key="p.status" :style="{ background: p.bg, color: p.fg, borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }">
            <q-icon :name="p.icon" size="14px" aria-hidden="true" />{{ p.status }}
          </span>
        </div>
        <div class="ada-contrast-grid">
          <contrast-pair fg="#92400E" bg="#FFFBEB" label="amber-800 on amber-50" sample="Upcoming" />
          <contrast-pair fg="#991B1B" bg="#FEF2F2" label="red-800 on red-50" sample="Cancelled" />
          <contrast-pair fg="#334155" bg="#F1F5F9" label="slate-700 on slate-100" sample="Waitlisted" />
          <contrast-pair fg="#065F46" bg="#ECFDF5" label="emerald-800 on emerald-50" sample="Processed" />
        </div>
        <template #why><p>This follows the Presto and audit-kit convention (a dark shade on a light tint), with 6.8–9.5:1 contrast. Statuses that share a color, like Upcoming and Expired, now have different icons, so the difference isn't carried by the text alone.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
