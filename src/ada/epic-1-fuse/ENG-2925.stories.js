// ENG-2925 · ADA-FUSE-03 — Contracted Hotel Details & Room Rates: pseudo-tab
// section nav, hotel name heading, rate-card close + text chevron, inert
// "Unavailable" button, unnamed back button, privacy link contrast.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2925.linear.md?raw'
import DetailTabs from '../../presto/components/details/DetailTabs.vue'
import HotelSummaryHeader from '../../presto/components/details/HotelSummaryHeader.vue'
import RoomCardReserve from '../../presto/components/details/RoomCardReserve.vue'
import { reserveRooms, hotelBase } from '../../presto/stories/details/_detail-data.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-03 – Contracted Hotel Details & Room Rates',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2925'),
}

const ID = 'ENG-2925'

const ITEMS = {
  tabs: { n: 1, title: 'Section nav is a div of buttons: no nav landmark, tabs or current state', wcag: ['1.3.1', '4.1.2'], element: 'Section navigation · sticky header', where: 'fuse/src/modules/hotel/components/details/ContractedHotelDetails.vue:73-95' },
  name: { n: 2, title: 'Hotel name is a styled div, not a heading', wcag: ['1.3.1', '2.4.6'], state: 'corrected', element: 'Heading · hotel name', where: 'fuse/src/modules/hotel/components/details/HotelName.vue:19 (used by ContractedHotelAbout.vue:28, LiveHotelAbout.vue:29)' },
  close: { n: 3, title: 'Rate-card dialog close is unnamed; " >" chevron is read as "greater than"', wcag: ['4.1.2', '1.3.1'], element: 'Icon-only button · text chevron', where: 'fuse/src/modules/hotel/components/rates/ContractedRateCard.vue:100-104 (close), :160 + :182 (chevron)' },
  unavail: { n: 4, title: '"Unavailable" room button is focusable but does nothing', wcag: ['4.1.2'], element: 'Button · disabled state', where: 'fuse/src/modules/hotel/components/rates/ReserveRoomButton.vue:79-86' },
  back: { n: 5, title: 'Icon-only back button has no accessible name', wcag: ['4.1.2', '2.4.6'], element: 'Icon-only button · back', where: 'fuse/src/modules/hotel/components/details/HotelImages.vue:38-50,85-96' },
  privacy: { n: 6, title: 'Privacy policy link fails contrast (3.78:1)', wcag: ['1.4.3'], element: 'Link · footer', where: 'fuse/src/components/PrivacyFooter.vue:42-46' },
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'about', label: 'About' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'policies', label: 'Policies' },
]

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The contracted hotel details page has no page heading, a section nav that is only a row of buttons, and several controls whose name or state is missing. The privacy link also fails contrast.">

  <ada-item v-bind="I.tabs">
    <p>The sticky Overview / About / Rooms / Policies bar is a plain <code>&lt;div&gt;</code> of <code>q-btn</code>s. It isn't a navigation landmark, it has no tab semantics, and nothing marks which section is current.</p>
    <ada-code tone="bad" caption="Production pattern — ContractedHotelDetails.vue:73-95" lang="vue" code='<div class="sticky-nav">
  <q-btn flat label="Overview" @click="scrollTo(&quot;overview&quot;)" />
  <q-btn flat label="About"    @click="scrollTo(&quot;about&quot;)" />
  <q-btn flat label="Rooms"    @click="scrollTo(&quot;rooms&quot;)" />
  <q-btn flat label="Policies" @click="scrollTo(&quot;policies&quot;)" />
</div>' />
    <agent-check agent="aria-specialist" verdict="refines" rule="Tabs require tabpanels that swap content plus arrow-key navigation; don't use tab roles for in-page links.">
      <p>Agrees there's a gap. Of the two fixes in the criteria, pick <code>&lt;nav aria-label&gt;</code>. These buttons scroll to sections that are all on the page, so this is in-page navigation, not tabs. Use links with <code>aria-current="true"</code> on the section in view. Tab roles would promise hidden panels and arrow-key behavior this bar doesn't have.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.name">
    <p>The shared <code>HotelName.vue</code> renders the hotel name as a styled <code>&lt;div&gt;</code>. Both the Contracted and Live details pages use it, so neither page has a heading for its main subject. (Linear corrected the location from an earlier draft.)</p>
    <ada-code tone="bad" caption="Production — HotelName.vue:19" lang="vue" code='<div class="hotel-name text-h5">{{ hotel.name }}</div>' />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Exactly one H1 per page, and it names the page's purpose.">
      <p>Agrees. Make it the page's <code>&lt;h1&gt;</code>; a generic heading isn't enough. The star-class icons next to it need a text version ("4-star hotel") that isn't just a <code>title</code> tooltip.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.close">
    <p>The rate-card dialog's close button is icon-only with no name. The mobile duplicate builds its label with <code>+ ' &gt;'</code>, so screen readers read "greater than" at the end.</p>
    <ada-code tone="bad" caption="Production pattern — ContractedRateCard.vue:100-104, :160, :182" lang="vue" code='<q-btn flat round icon="close" v-close-popup />
…
<q-btn flat :label="label + &quot; >&quot;" @click="openDialog" />' />
    <sr-output before="button · … greater than, button" after="Close room details, button · …, button" />
    <agent-check agent="modal-specialist" verdict="agrees" rule="The dialog's close button has an accessible name; Escape closes and focus returns to the trigger.">
      <p>Confirmed. While fixing the name, check that focus returns to the rate card that opened the dialog.</p>
    </agent-check>
    <agent-check agent="aria-specialist" verdict="agrees" rule="Decorative icons are hidden from screen readers.">
      <p>A <code>q-icon</code> chevron is already <code>aria-hidden</code> in Quasar, so replacing the text with the icon removes "greater than" and needs no extra label.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.unavail">
    <p>The "Unavailable" room button has no <code>disable</code>, no <code>aria-disabled</code> and no <code>@click</code>. Keyboard users can tab to it and hear an active button that does nothing.</p>
    <ada-code tone="bad" caption="Production pattern — ReserveRoomButton.vue:79-86" lang="vue" code='<q-btn v-else unelevated color="grey-5" label="Unavailable" />' />
    <sr-output before="Unavailable, button" after="Unavailable, button, dimmed (skipped by Tab)" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="Disabled standalone controls leave the tab order (disabled attribute); aria-disabled keeps them focusable.">
      <p>The criteria say <code>disable</code> <em>or</em> <code>aria-disabled</code>. Use <code>disable</code>: this is a standalone button, and <code>aria-disabled</code> alone would keep it in the tab order and still need a click guard. The reason ("sold out for your dates") must be visible text next to it, because a disabled button can't be focused to discover it.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.back">
    <p>At both breakpoints the details page's back button is an icon-only <code>q-btn</code> with no accessible name. It's read as just "button".</p>
    <ada-code tone="bad" caption="Production pattern — HotelImages.vue:38-50, :85-96" lang="vue" code='<q-btn round icon="arrow_back" @click="router.back()" />' />
    <sr-output before="button" after="Back to hotel results, button" />
    <agent-check agent="aria-specialist" verdict="agrees" rule="Icon-only buttons need an accessible name that says what they do.">
      <p>Confirmed. Name the destination ("Back to hotel results"), not just "Back".</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.privacy">
    <contrast-pair fg="#007BFF" bg="#F9F9FA" label="Production privacy link on the app's #f9f9fa background" />
    <agent-check agent="contrast-master" verdict="agrees" rule="Link text needs 4.5:1; links in text also need a non-color cue such as an underline.">
      <p>Confirmed at <strong>3.78:1</strong>, matching Linear. It still fails on pure white (3.98:1), so changing the background alone won't fix it. Bootstrap's own darker link shade <code>#0056B3</code> measures 6.69:1 on <code>#F9F9FA</code>.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, DetailTabs, HotelSummaryHeader, RoomCardReserve },
    setup: () => ({ ID, I: ITEMS, PRESTO, tab: ref('overview'), hotelBase, room: reserveRooms[0], soldRoom: reserveRooms[4] }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same hotel details elements in presto-2026. The dialog close, disabled state and back button are already fixed; the section nav and hotel name still aren't.">

  <ada-item v-bind="I.tabs">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Details / Detail Tabs" :href="PRESTO.story('hotel-details-components-detail-tabs--default')">
      <div style="max-width:760px"><detail-tabs v-model="tab" /></div>
      <template #notes>
        <p><code>DetailTabs.vue:28-38</code> uses real buttons with <code>role="tab"</code> and <code>aria-selected</code>, so the current section is exposed. But the wrapper is <code>&lt;nav role="tablist"&gt;</code>. The role replaces the navigation landmark, and the list has no <code>aria-label</code>.</p>
        <p>The tabs have no <code>aria-controls</code> or tab panels and no arrow-key handling, and <code>HotelDetailPage.vue:84-88</code> uses them to scroll to <code>#hdp-*</code> sections. That's the in-page-nav vs. tabs mix the agent flags.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.name">
    <ada-before status="applies" source="presto-2026 Storybook › Hotel Details / Hotel Summary Header" :href="PRESTO.story('hotel-details-components-hotel-summary-header--no-map')">
      <div style="max-width:1000px"><hotel-summary-header v-bind="hotelBase" :show-map="false" /></div>
      <template #notes>
        <p><code>HotelSummaryHeader.vue:49-54</code>: the name is <code>&lt;div class="dhead__name"&gt;&lt;span&gt;</code>. The star icons have only a <code>title</code> tooltip. <code>HotelDetailPage.vue</code> has no <code>&lt;h1&gt;</code> at all (in presto, only the landing page and checkout have one).</p>
        <p>The block is also a page-level <code>&lt;header&gt;</code> (L42). Next to Global Nav's <code>&lt;header&gt;</code>, that creates a second banner landmark.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.close">
    <ada-before status="partial" source="presto-2026 Storybook › Room Card / Available" :href="PRESTO.story('hotel-details-components-book-reservation-room-card--available')">
      <room-card-reserve v-bind="room" />
      <template #notes>
        <p><strong>Resolved:</strong> the room dialog's close button has <code>aria-label="Close"</code> (<code>RoomBookingDialog.vue:90</code>), and so does <code>DsModal.vue:59/66</code>.</p>
        <p><strong>Still present:</strong> "Price Details ›" (<code>RoomCardReserve.vue:59</code>) puts a text glyph (U+203A) in the button name. Depending on punctuation settings, some screen readers read it as "right-pointing angle quotation mark". It's the same kind of problem as <code>' &gt;'</code>.</p>
        <p>Also in this card: the "1 room · incl. taxes &amp; fees" line (<code>.rcr__sub</code>, Slate 400 at 13px) is 2.56:1 on white. That's a presto-only contrast failure.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.unavail">
    <ada-before status="resolved" source="presto-2026 Storybook › Room Card / Sold Out" :href="PRESTO.story('hotel-details-components-book-reservation-room-card--sold-out')">
      <room-card-reserve v-bind="soldRoom" />
      <template #notes>
        <p><code>RoomCardReserve.vue:64-65</code>: <code>&lt;button disabled&gt;Unavailable&lt;/button&gt;</code>, followed by the visible reason "At least one night in your selected range is sold out". It's out of the tab order and the reason is readable, which matches the agent's rule.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.back">
    <ada-before status="resolved" source="presto-2026 Storybook › Hotel Details / Mobile" :href="PRESTO.story('hotel-details-mobile--hotel-detail-page')">
      <ada-code tone="good" caption="presto-2026 — HotelDetailPage.vue:113-115 (desktop) and :120-122 (phone)" lang="vue" code='<button v-if="!isPhone" type="button" class="hdp__back" @click="emit(&quot;back&quot;)">
  <q-icon name="chevron_left" /> Back to Hotel listing
</button>
…
<button v-if="isPhone" type="button" class="hdp__backfab"
        aria-label="Back to hotel listing" @click="emit(&quot;back&quot;)">
  <q-icon name="arrow_back" />
</button>' />
      <template #notes><p>Desktop has visible text, and the phone's round button has an <code>aria-label</code>. Both name the destination. <code>GalleryHero.vue</code> has no back button of its own.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.privacy">
    <ada-before status="partial" source="presto-2026 › PageFrame.vue:29 / LandingPage.vue:138">
      <ada-code tone="neutral" caption="presto-2026 — PageFrame.vue:29 (footer)" code='<span class="pf__legal">© 2026 EventPipe · Terms · Privacy · Contact</span>' />
      <contrast-pair fg="#475569" bg="#FFFFFF" label="presto footer legal text (--ds-color-text-subtle) on white" />
      <template #notes>
        <p>The footer text passes easily (7.58:1). But "Privacy" is plain text in a <code>&lt;span&gt;</code>, not a link, so presto has no privacy link to check yet. When it becomes one, use the link token (item 6, Option B) and an underline.</p>
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
      const current = ref('overview')
      const dialogMsg = ref('')
      return { ID, I: ITEMS, SECTIONS, current, dialogMsg }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press Tab through the demos to check them.">

  <ada-item v-bind="I.tabs">
    <ada-option letter="A" title="&lt;nav aria-label&gt; with in-page links and a current-section state" recommended lang="vue"
      code='<nav aria-label="Hotel sections" class="sticky-nav">
  <a v-for="s in sections" :key="s.id" :href="&quot;#&quot; + s.id"
     :aria-current="active === s.id ? &quot;true&quot; : null">{{ s.label }}</a>
</nav>
<!-- active is updated by an IntersectionObserver as sections scroll into view -->'>
      <nav aria-label="Hotel sections" class="ada-row ada-focus-demo" style="gap:4px;border-bottom:1px solid #CBD5E1">
        <a v-for="s in SECTIONS" :key="s.id" :href="'#demo-' + s.id" :aria-current="current === s.id ? 'true' : null"
          :style="{ padding: '10px 14px', textDecoration: 'none', color: current === s.id ? '#0F172A' : '#475569', fontWeight: current === s.id ? 700 : 500, borderBottom: current === s.id ? '3px solid #01113E' : '3px solid transparent' }"
          @click.prevent="current = s.id">{{ s.label }}</a>
      </nav>
      <p class="ada-note" style="margin-top:8px">Current section: {{ SECTIONS.find(s => s.id === current).label }}. Screen readers hear "About, link, current".</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.name">
    <ada-option letter="A" title="Render HotelName.vue as a real heading (the page h1)" recommended lang="vue"
      code='<h1 class="hotel-name text-h5">
  {{ hotel.name }}
  <span role="img" :aria-label="hotel.stars + &quot;-star hotel&quot;" class="stars">
    <q-icon v-for="n in hotel.stars" :key="n" name="star" />
  </span>
</h1>'>
      <div class="ada-mini-frame">
        <h4 style="margin:0;font-size:28px;line-height:1.2;display:flex;flex-wrap:wrap;align-items:center;gap:12px">
          Hilton Orlando Lake Buena Vista
          <span role="img" aria-label="4-star hotel" style="display:inline-flex;color:#0F172A"><q-icon v-for="n in 4" :key="n" name="star" size="20px" /></span>
        </h4>
        <p class="ada-note" style="margin-top:6px">In the product this is the page's <code>&lt;h1&gt;</code>. It's shown as an <code>&lt;h4&gt;</code> here so this audit page keeps a valid heading outline.</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.close">
    <ada-option letter="A" title="aria-label on the dialog close; q-icon chevron instead of ' >'" recommended lang="vue"
      code='<q-btn flat round icon="close" aria-label="Close room details" v-close-popup />
…
<q-btn flat no-caps @click="openDialog">
  {{ label }} <q-icon name="chevron_right" />
</q-btn>'>
      <div class="ada-mini-frame ada-focus-demo" style="max-width:360px">
        <div class="ada-row" style="justify-content:space-between;align-items:center">
          <strong>Urban King</strong>
          <q-btn flat round dense icon="close" aria-label="Close room details" @click="dialogMsg = 'Dialog closed; focus returns to the rate card.'" />
        </div>
        <q-btn flat no-caps color="primary" class="q-mt-sm" @click="dialogMsg = 'Room details opened.'">View room details <q-icon name="chevron_right" /></q-btn>
        <p class="ada-note" aria-live="polite">{{ dialogMsg }}</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.unavail">
    <ada-option letter="A" title="disable the “Unavailable” button (with a visible reason)" recommended lang="vue"
      code='<q-btn v-else unelevated disable label="Unavailable" />
<p class="sold-note">Sold out for at least one night of your stay.</p>'>
      <div class="ada-row ada-focus-demo" style="align-items:center">
        <q-btn unelevated color="primary" no-caps label="Reserve room" />
        <q-btn unelevated disable no-caps label="Unavailable" />
      </div>
      <p class="ada-note">Sold out for at least one night of your stay. Tab moves from "Reserve room" straight past "Unavailable".</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.back">
    <ada-option letter="A" title="aria-label on HotelImages.vue's back button (both breakpoints)" recommended lang="vue"
      code='<q-btn round icon="arrow_back" aria-label="Back to hotel results" @click="router.back()" />'>
      <div class="ada-row ada-focus-demo">
        <q-btn round unelevated color="white" text-color="dark" icon="arrow_back" aria-label="Back to hotel results" style="box-shadow:0 1px 5px rgba(0,0,0,.3)" />
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.privacy">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken the privacy link so it passes on #f9f9fa" recommended lang="css"
        code=".privacy-footer a {
  color: #0056B3;            /* 6.69:1 on #f9f9fa */
  text-decoration: underline;
}">
        <p class="ada-focus-demo" style="margin:0;padding:12px;background:#F9F9FA;border-radius:4px">By booking you agree to our <a href="#privacy" style="color:#0056B3" @click.prevent>Privacy Policy</a>.</p>
        <contrast-pair fg="#0056B3" bg="#F9F9FA" label="Proposed link color on the app background" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Use presto's --ds-color-link token" lang="css"
        code=".privacy-footer a {
  color: var(--ds-color-link);   /* Navy 900 — 17.34:1 on #f9f9fa */
  text-decoration: underline;
}">
        <p class="ada-focus-demo" style="margin:0;padding:12px;background:#F9F9FA;border-radius:4px">By booking you agree to our <a href="#privacy-b" style="color:#01113E" @click.prevent>Privacy Policy</a>.</p>
        <contrast-pair fg="#01113E" bg="#F9F9FA" label="presto --ds-color-link on the app background" />
        <template #why><p>Links then follow the redesign's link token, and future tenant themes are checked in one place. That also makes the presto footer's plain "Privacy" text ready to become a link.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
