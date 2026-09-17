// ENG-2926 · ADA-FUSE-04 — Live Hotel Details & Rates Page: dialog close
// buttons, chevron label, strikethrough pricing, inline cancellation policy,
// section-nav pseudo-tabs.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2926.linear.md?raw'
import RoomBookingDialog from '../../presto/components/RoomBookingDialog.vue'
import RoomCardReserve from '../../presto/components/details/RoomCardReserve.vue'
import DetailTabs from '../../presto/components/details/DetailTabs.vue'
import PoliciesSection from '../../presto/components/details/PoliciesSection.vue'
import { base as roomDialog } from '../../presto/stories/patterns/RoomBookingDialog.stories.js'
import { policies as detailPolicies } from '../../presto/stories/details/_detail-data.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-04 – Live Hotel Details & Rates Page',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2926'),
}

const ID = 'ENG-2926'

const ITEMS = {
  close: { n: 1, title: 'Dialog close buttons have no accessible name', wcag: ['4.1.2'], element: 'Modal · icon-only close button', where: 'LiveRoomDetailsDialog.vue:30-34 · LiveRateCard.vue:176-181' },
  chevron: { n: 2, title: 'A literal " >" is concatenated onto a button label', wcag: ['1.3.1', '4.1.2'], element: 'Button label · rate card', where: 'fuse/src/modules/hotel/components/rates/LiveRateCard.vue:250' },
  strike: { n: 3, title: 'Strikethrough pricing isn’t announced as original vs discounted', wcag: ['1.3.1', '1.4.3'], element: 'Price · strikethrough rate', where: 'Live rate pricing (Linear cites no file:line for this item)' },
  policy: { n: 4, title: 'Inline cancellation policy lacks heading and list semantics', wcag: ['1.3.1'], element: 'Policy section · heading + list', where: 'fuse/src/modules/hotel/components/rates/LiveRateSelection.vue' },
  tabs: { n: 5, title: 'Section nav uses pseudo-tabs (plus an extra "Accessibility" tab)', wcag: ['1.3.1', '4.1.2'], element: 'Section navigation · tabs', where: 'fuse/src/modules/hotel/components/details/LiveHotelDetails.vue:84-111' },
}

// Room card sample — the "Available" args from RoomCardReserve.stories.js.
const roomCard = {
  roomType: 'Two-Room Suite King', bedConfig: '1 King Bed, Separate Living Room',
  maxOccupancy: 4, pricePerNight: 269, total: 5821.56, roomCount: 6, availability: 'available',
  nights: [{ date: 'Thu, 7/9/2026', roomsLeft: 5 }, { date: 'Fri, 7/10/2026', roomsLeft: 6 }, { date: 'Sat, 7/11/2026', roomsLeft: 5 }],
}
const shortPolicies = detailPolicies.slice(0, 3)

const CODE = {
  closeBad: `<q-dialog v-model="open">
  <q-card>
    <q-btn flat round icon="close" v-close-popup />   <!-- no name -->
    …
  </q-card>
</q-dialog>`,
  chevronBad: `<q-btn flat :label="detailsLabel + ' >'" />`,
  strikeBad: `<span class="text-strike text-grey">{{ rate.original }}</span>
<span class="text-bold">{{ rate.discounted }}</span>`,
  policyBad: `<div class="text-bold">Cancellation Policy</div>
<div v-for="rule in policy.rules">{{ rule }}</div>`,
  tabsBad: `<div class="details-tabs">
  <div class="tab" @click="scrollTo('overview')">Overview</div>
  <div class="tab" @click="scrollTo('rooms')">Rooms</div>
  …
  <div class="tab" @click="scrollTo('accessibility')">Accessibility</div>
</div>`,
  prestoTabs: `<!-- presto-2026 DetailTabs.vue:28-38 -->
<nav class="dtabs" role="tablist">          <!-- role overrides the nav landmark -->
  <button role="tab" :aria-selected="…"      <!-- no aria-controls / tabpanel -->
          @click="select(t.name)">…</button>  <!-- scrolls to #hdp-{name} -->
</nav>`,
  closeFix: `<q-dialog v-model="open">
  <q-card>
    <q-btn flat round icon="close" aria-label="Close" v-close-popup />
    …
  </q-card>
</q-dialog>`,
  chevronFix: `<q-btn flat no-caps :label="detailsLabel" icon-right="chevron_right" />
<!-- QIcon renders aria-hidden="true", so the name is just the label -->`,
  strikeFix: `<s class="price-was">
  <span class="sr-only">Original price: </span>{{ rate.original }}
</s>
<strong class="price-now">
  <span class="sr-only">Discounted price: </span>{{ rate.discounted }}
</strong>`,
  strikeVisible: `<p class="price">
  <span class="price-was">Was <s>{{ rate.original }}</s></span>
  <strong>Now {{ rate.discounted }}</strong>
</p>
.price-was { color: var(--ds-palette-slate-600); } /* 7.58:1 */`,
  policyFix: `<section aria-labelledby="cxl-h">
  <h3 id="cxl-h">Cancellation policy</h3>
  <ul>
    <li v-for="rule in policy.rules" :key="rule">{{ rule }}</li>
  </ul>
</section>`,
  policyDl: `<h3>Cancellation policy</h3>
<dl>
  <div v-for="r in policy.rules" :key="r.when">
    <dt>{{ r.when }}</dt>
    <dd>{{ r.fee }}</dd>
  </div>
</dl>`,
  tabsFix: `<nav aria-label="Hotel sections">
  <ul class="details-tabs">
    <li v-for="s in sections" :key="s.id">
      <a :href="'#' + s.id" :aria-current="active === s.id ? 'true' : undefined">
        {{ s.label }}
      </a>
    </li>
  </ul>
</nav>`,
  tabsApg: `<div role="tablist" aria-label="Hotel details">
  <button v-for="(t, i) in tabs" :id="'tab-' + t.id" role="tab"
    :aria-selected="i === sel" :aria-controls="'panel-' + t.id"
    :tabindex="i === sel ? 0 : -1" @keydown="onArrow">{{ t.label }}</button>
</div>
<div v-for="(t, i) in tabs" v-show="i === sel" :id="'panel-' + t.id"
  role="tabpanel" :aria-labelledby="'tab-' + t.id" tabindex="0">…</div>`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Five problems on the Live (supplier-rate) hotel details page. Most are unnamed or mislabeled controls and missing structure. Linear corrected the file list: there is no separate cancellation-policy modal; the policy renders inline.">

  <ada-item v-bind="I.close">
    <p>Both the room-details dialog and the rate card's own dialog close with an icon-only <code>q-btn</code>. Quasar hides the <code>close</code> ligature from assistive tech, so the button has no name at all.</p>
    <ada-code tone="bad" caption="Production pattern — LiveRoomDetailsDialog.vue:30-34 / LiveRateCard.vue:176-181" :code="CODE.closeBad" />
    <sr-output before="button" after="Close, button" />
    <agent-check agent="modal-specialist" verdict="agrees" rule="Every dialog should have a visible close button; an icon-only close button needs aria-label=&quot;Close&quot;.">
      <p>Confirmed. Linear notes <code>q-dialog</code> already traps focus. Also check that focus goes back to the button that opened the dialog when it closes.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.chevron">
    <p>The button text ends with a typed <code>&gt;</code>. Screen readers read it as "greater than", or skip it, depending on settings. It's decoration, not part of the label.</p>
    <ada-code tone="bad" caption="Production pattern — LiveRateCard.vue:250" :code="CODE.chevronBad" />
    <sr-output before="[button label] greater than, button" after="[button label], button" />
    <agent-check agent="aria-specialist" verdict="agrees" rule="Hide decorative icons and glyphs from assistive tech; the accessible name should be only the meaningful words.">
      <p>Confirmed. A <code>q-icon</code> is hidden from assistive tech (<code>aria-hidden="true"</code>) automatically, so moving the chevron into an icon fixes the name.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.strike">
    <p>When a rate is discounted, the old price is shown with a line through it. Screen readers don't announce strikethrough styling, so users hear two prices with no hint of which one they'll pay.</p>
    <ada-code tone="bad" caption="Production pattern — dynamic rate display" :code="CODE.strikeBad" />
    <sr-output before="$189 $149" after="Original price: $189. Discounted price: $149" />
    <agent-check agent="aria-specialist" verdict="agrees" rule="If information is conveyed visually, expose it in text; don't rely on styling alone.">
      <p>Confirmed. Most screen readers ignore <code>&lt;s&gt;</code> and <code>&lt;del&gt;</code> by default too, so the visually hidden text is still needed if the markup changes to <code>&lt;s&gt;</code>.</p>
    </agent-check>
    <agent-check agent="contrast-master" verdict="refines" rule="Muted or disabled-looking text still needs 4.5:1; never rely on a visual effect alone (1.4.1).">
      <p>The ticket lists 1.4.3, but none of the numbered items gives a contrast value. Struck-through "was" prices are usually light grey. Whatever color is used must still reach 4.5:1. The Before view shows two presto-2026 price-area colors that don't.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.policy">
    <p>The cancellation policy renders inline in <code>LiveRateSelection.vue</code>. Its title is a bold <code>&lt;div&gt;</code> and each rule is another <code>&lt;div&gt;</code>. Screen-reader users can't jump to it by heading or hear how many rules there are.</p>
    <ada-code tone="bad" caption="Production pattern — LiveRateSelection.vue" :code="CODE.policyBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Section titles must be real heading elements at the correct level; never style a div to look like one.">
      <p>Confirmed. Pick a level that fits under the rate section's heading (usually <code>&lt;h3&gt;</code>) and don't skip levels.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.tabs">
    <p>The details page has a row of tab-looking items that scroll to page sections. They are clickable <code>&lt;div&gt;</code>s with no role, name or state. The Live flow adds a fifth "Accessibility" item to the same pattern as ADA-FUSE-03.</p>
    <ada-code tone="bad" caption="Production pattern — LiveHotelDetails.vue:84-111" :code="CODE.tabsBad" />
    <agent-check agent="aria-specialist" verdict="refines" rule="First Rule of ARIA: use native HTML when it expresses the semantics. Tabs need tabpanels, aria-controls, roving tabindex and arrow keys.">
      <p>The acceptance criteria say "<code>&lt;nav aria-label&gt;</code>/tab semantics". These are two different patterns, so pick one. The items <em>scroll to sections</em> on the same page, so they're navigation: <code>&lt;nav aria-label&gt;</code> with in-page links and <code>aria-current</code>. Only use <code>role="tab"</code> if the control swaps panels, and then implement the whole APG tabs pattern. Don't put <code>role="tablist"</code> on a <code>&lt;nav&gt;</code>: the role replaces the landmark.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, RoomBookingDialog, RoomCardReserve, DetailTabs, PoliciesSection },
    setup: () => ({ ID, I: ITEMS, PRESTO, CODE, roomDialog, roomCard, shortPolicies, tab: ref('overview') }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same elements on the presto-2026 hotel details screen. The redesign names its dialog close buttons already. The chevron glyph and the pseudo-tab semantics are still wrong.">

  <ada-item v-bind="I.close">
    <ada-before status="resolved" source="presto-2026 Storybook › Room Booking Dialog / Base" :href="PRESTO.story('hotel-details-components-book-reservation-room-booking-dialog--base')">
      <room-booking-dialog v-bind="roomDialog" />
      <template #notes>
        <p><code>RoomBookingDialog.vue:90</code> gives its icon-only close button <code>aria-label="Close"</code> (Share and the photo arrows are named too). <code>DsModal.vue:59/:66</code>, which <code>PriceDetailsDialog</code> uses, does the same in both header layouts.</p>
        <p><strong>Still open (not this item):</strong> <code>DsModal</code> is a <code>div role="dialog"</code> with no focus trap and no focus return, and the carousel dots are clickable <code>&lt;span&gt;</code>s that the keyboard can't reach.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.chevron">
    <ada-before status="applies" source="presto-2026 Storybook › Room Card / Available" :href="PRESTO.story('hotel-details-components-book-reservation-room-card--available')">
      <room-card-reserve v-bind="roomCard" />
      <template #notes>
        <p><code>RoomCardReserve.vue:59</code> renders <code>Price Details ›</code>: a literal U+203A inside the button text. Screen readers read it as "right-pointing angle quotation mark", or skip it, depending on verbosity settings. Same defect as production, different glyph.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.strike">
    <ada-before status="no-equivalent" source="presto-2026 › src/components (no line-through / <s> / <del>)">
      <template #empty>presto-2026 has no discounted or strikethrough rate yet. Room cards, Price Details and the checkout summary show one price each. The Proposal shows the pattern to use when discounts are added.</template>
      <template #notes>
        <p><strong>Related 1.4.3 findings near the price</strong> (<code>RoomCardReserve.vue</code> <code>.rcr__sub</code> / <code>.rcr__left.is-limited</code>, and <code>RoomBookingDialog.vue</code> <code>.rbd__avail</code>). axe flags both in the frames above:</p>
        <div class="ada-contrast-grid">
          <contrast-pair fg="#94A3B8" bg="#FFFFFF" label="“1 room · incl. taxes & fees” — text-subtlest (Slate 400), 13px" sample="incl. taxes & fees" />
          <contrast-pair fg="#EA580C" bg="#FFFFFF" label="“Only 2 left” / “4 rooms left” — Orange 600, 15–16px bold (not large text)" sample="Only 2 left" />
        </div>
        <p>Any future "was" price must not reuse <code>--ds-color-text-subtlest</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.policy">
    <ada-before status="partial" source="presto-2026 Storybook › Policies & Property / Policies" :href="PRESTO.story('hotel-details-components-policies-property--policies')">
      <div style="max-width:760px"><policies-section :policies="shortPolicies" /></div>
      <template #notes>
        <p><strong>Right:</strong> each policy is a <code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code> pair in a <code>&lt;dl&gt;</code>, so the list semantics are there.</p>
        <p><strong>Still wrong:</strong> the "Property Policies" title comes from <code>DsSectionHeader.vue:11</code>, which renders <code>&lt;div class="text-h6"&gt;</code>. It isn't a heading. (Checkout's <code>PoliciesAgreement</code> does use real <code>&lt;h3&gt;</code>/<code>&lt;h4&gt;</code>.)</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.tabs">
    <ada-before status="applies" source="presto-2026 Storybook › Detail Tabs / Default" :href="PRESTO.story('hotel-details-components-detail-tabs--default')">
      <div style="max-width:1040px"><detail-tabs v-model="tab" /></div>
      <ada-code tone="bad" :code="CODE.prestoTabs" />
      <template #notes>
        <p>presto-2026 uses real buttons, so they're focusable and have names. The semantics are still wrong in a different way. <code>role="tablist"</code> sits on the <code>&lt;nav&gt;</code>, so the navigation landmark is lost. The tablist has no name. No <code>tabpanel</code>s or <code>aria-controls</code> exist. Every tab is a Tab stop, and arrow keys do nothing. On the page (<code>HotelDetailPage.vue:83</code> <code>onTab</code>) each "tab" just scrolls to a section, so this is navigation, not tabs.</p>
        <p>presto has five items (Overview · Rooms · Property · Amenities · Policies) and no "Accessibility" tab.</p>
      </template>
    </ada-before>
  </ada-item>
</ada-issue>`,
  }),
}

/* --------------------------------------------------------------- Proposal */
const SECTIONS = [
  { id: 'fx-overview', label: 'Overview' },
  { id: 'fx-rooms', label: 'Rooms' },
  { id: 'fx-amenities', label: 'Amenities' },
  { id: 'fx-policies', label: 'Policies' },
  { id: 'fx-accessibility', label: 'Accessibility' },
]
const APG_TABS = [
  { id: 'rates', label: 'Rates', body: 'Two-Room Suite King · $269 / night' },
  { id: 'photos', label: 'Photos', body: '12 photos of rooms, lobby and pool' },
  { id: 'access', label: 'Accessibility', body: 'Roll-in shower, grab bars, visual alarms' },
]

export const Proposal = {
  parameters: VIEW_PARAMS.proposal,
  render: () => ({
    components: kit,
    setup: () => {
      const dialog = ref(false)
      const active = ref('fx-overview')
      const sel = ref(0)
      const tabEls = []
      const onArrow = (e) => {
        const n = APG_TABS.length
        const map = { ArrowRight: sel.value + 1, ArrowLeft: sel.value - 1, Home: 0, End: n - 1 }
        if (!(e.key in map)) return
        e.preventDefault()
        sel.value = (map[e.key] + n) % n
        tabEls[sel.value]?.focus()
      }
      return { ID, I: ITEMS, CODE, dialog, active, SECTIONS, APG_TABS, sel, tabEls, onArrow }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Use the keyboard on each demo: Tab to reach it, then Enter or the arrow keys.">

  <ada-item v-bind="I.close">
    <ada-option letter="A" title="aria-label=&quot;Close&quot; on both dialogs' close buttons" recommended lang="vue" :code="CODE.closeFix">
      <div class="ada-row ada-focus-demo">
        <q-btn outline color="primary" no-caps label="Room details" aria-haspopup="dialog" @click="dialog = true" />
      </div>
      <p class="ada-note" style="margin-top:8px">Open it, press <kbd>Tab</kbd> to reach Close, then <kbd>Enter</kbd> or <kbd>Esc</kbd>. Focus returns to "Room details".</p>
      <q-dialog v-model="dialog">
        <q-card style="min-width:300px">
          <q-card-section class="row items-center no-wrap">
            <h2 style="margin:0;font-size:18px;flex:1">Two-Room Suite King</h2>
            <q-btn flat round dense icon="close" aria-label="Close" @click="dialog = false" />
          </q-card-section>
          <q-card-section><p style="margin:0">1 King Bed · Sleeps 4 · $269 / night</p></q-card-section>
        </q-card>
      </q-dialog>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.chevron">
    <ada-option letter="A" title="Replace the ' >' concatenation with a q-icon" recommended lang="vue" :code="CODE.chevronFix">
      <div class="ada-row ada-focus-demo">
        <q-btn flat no-caps color="primary" label="Price Details" icon-right="chevron_right" />
        <q-btn unelevated no-caps color="primary" label="Reserve Room" />
      </div>
      <sr-output after="Price Details, button" />
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.strike">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="sr-only “Original price” / “Discounted price” spans" recommended lang="vue" :code="CODE.strikeFix">
        <p style="margin:0;font-size:18px">
          <s style="color:#475569"><span class="ada-sr-only">Original price: </span>$189.00</s>
          <strong style="margin-left:8px;color:#01113E"><span class="ada-sr-only">Discounted price: </span>$149.00</strong>
          <span style="color:#475569;font-size:15px"> / night</span>
        </p>
        <contrast-pair fg="#475569" bg="#FFFFFF" label="Struck-through price — Slate 600 (text-subtle)" sample="$189.00" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="contrast-master" title="Also say “Was / Now” visibly" lang="vue" :code="CODE.strikeVisible">
        <p style="margin:0;font-size:18px">
          <span style="color:#475569">Was <s>$189.00</s></span>
          <strong style="margin-left:8px;color:#01113E">Now $149.00</strong>
        </p>
        <template #why><p>Visible words help everyone: screen-reader users, low-vision users who can't see a thin line-through, and anyone scanning quickly. The strikethrough stops being the only cue (1.4.1), and no hidden text is needed.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.policy">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Real heading and list for the inline cancellation policy" recommended lang="vue" :code="CODE.policyFix">
        <section aria-labelledby="eng2926-cxl" class="ada-mini-frame">
          <h3 id="eng2926-cxl" style="margin:0 0 6px;font-size:16px">Cancellation policy</h3>
          <ul style="margin:0;padding-left:20px;line-height:1.5">
            <li>Free cancellation until Thu, 7/2/2026 at 4:00 PM.</li>
            <li>After that, a fee of one night's rate plus tax applies.</li>
            <li>No refund for no-shows.</li>
          </ul>
        </section>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="tables-data-specialist" title="Deadline → fee pairs as a <dl> (the presto PoliciesSection pattern)" lang="vue" :code="CODE.policyDl">
        <div class="ada-mini-frame">
          <h3 style="margin:0 0 6px;font-size:16px">Cancellation policy</h3>
          <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 16px">
            <dt style="font-weight:700">Before 7/2, 4:00 PM</dt><dd style="margin:0">Free</dd>
            <dt style="font-weight:700">After 7/2, 4:00 PM</dt><dd style="margin:0">1 night + tax</dd>
            <dt style="font-weight:700">No-show</dt><dd style="margin:0">Non-refundable</dd>
          </dl>
        </div>
        <template #why><p>When each rule is "when → what it costs", a description list keeps each pair together for screen readers. presto-2026's <code>PoliciesSection</code> already uses <code>&lt;dl&gt;</code>, so the fix matches the redesign once its title is a real heading.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.tabs">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="<nav aria-label> with in-page links and aria-current" recommended lang="vue" :code="CODE.tabsFix">
        <nav aria-label="Hotel sections" class="ada-focus-demo">
          <ul class="ada-row" style="list-style:none;margin:0;padding:0;border-bottom:1px solid #CBD5E1">
            <li v-for="s in SECTIONS" :key="s.id">
              <a :href="'#' + s.id" :aria-current="active === s.id ? 'true' : undefined"
                 @click.prevent="active = s.id"
                 :style="{ display: 'inline-block', padding: '10px 4px', color: '#01113E', fontWeight: active === s.id ? 700 : 500, textDecoration: 'none', borderBottom: active === s.id ? '2px solid #01113E' : '2px solid transparent' }">{{ s.label }}</a>
            </li>
          </ul>
        </nav>
        <sr-output after="Hotel sections, navigation · Overview, current page link" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Only if content is swapped: the full APG tabs pattern" lang="vue" :code="CODE.tabsApg">
        <div class="ada-focus-demo">
          <div role="tablist" aria-label="Hotel details" class="ada-row" style="gap:4px;border-bottom:1px solid #CBD5E1">
            <button v-for="(t, i) in APG_TABS" :key="t.id" :ref="(el) => { if (el) tabEls[i] = el }"
              :id="'eng2926-tab-' + t.id" type="button" role="tab"
              :aria-selected="i === sel ? 'true' : 'false'" :aria-controls="'eng2926-panel-' + t.id"
              :tabindex="i === sel ? 0 : -1" @click="sel = i" @keydown="onArrow"
              :style="{ padding: '10px 12px', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: '#01113E', fontWeight: i === sel ? 700 : 500, borderBottom: i === sel ? '2px solid #01113E' : '2px solid transparent' }">{{ t.label }}</button>
          </div>
          <div v-for="(t, i) in APG_TABS" :key="t.id" v-show="i === sel" :id="'eng2926-panel-' + t.id"
            role="tabpanel" :aria-labelledby="'eng2926-tab-' + t.id" tabindex="0" style="padding:10px 4px">{{ t.body }}</div>
        </div>
        <p class="ada-note">Tab to the tabs, then use <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd>.</p>
        <template #why><p>Use this only if Live details stops being one long page and shows one panel at a time. Then each tab needs a panel, only the selected tab is a Tab stop, and the arrow keys move between tabs.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
