// ENG-2933 · ADA-PLAT-RES-03 — Hotel details & inventory selection matrix
// (platform, Go/Plush): hotel name not a heading, Glide carousel alt/arrows,
// length-of-stay alert contrast, room table headers, Join Waitlist anchors,
// unlabeled info-popover buttons.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, onMounted } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2933.linear.md?raw'
import HotelSummaryHeader from '../../presto/components/details/HotelSummaryHeader.vue'
import GalleryHero from '../../presto/components/details/GalleryHero.vue'
import RoomCardReserve from '../../presto/components/details/RoomCardReserve.vue'
import { popularAmenities } from '../../presto/lib/amenities.js'
import { loadImagery } from '../../presto/lib/imagery'
import lobby from '../../presto/assets/hotel/lobby.jpg'
import exterior from '../../presto/assets/hotel/exterior.jpg'
import pool from '../../presto/assets/hotel/pool.jpg'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-03 – Hotel Details & Inventory Matrix',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2933'),
}

const ID = 'ENG-2933'

const ITEMS = {
  name: { n: 1, title: 'Hotel name is a <div>; the page has no <h1>', wcag: ['1.3.1'], element: 'Heading · hotel name', where: 'platform/app/templates/enduser/booking/show.plush.html:55-57' },
  carousel: { n: 2, title: 'Glide carousel: alt="slider" and unlabeled arrow buttons', wcag: ['1.1.1', '4.1.2'], state: 'corrected', element: 'Carousel · slides, arrow buttons', where: 'show.plush.html:103 (slide alt) · :108-115 (arrows, shifted from 109-114)' },
  los: { n: 3, title: 'Minimum-night (length-of-stay) alert at 1.85:1 contrast', wcag: ['1.4.3'], state: 'corrected', element: 'Alert box · color', where: 'show.plush.html:140' },
  table: { n: 4, title: 'Room inventory table has no <thead>, <th scope="col"> or <caption>', wcag: ['1.3.1'], state: 'corrected', element: 'Data table · room inventory', where: 'show.plush.html:241-364 (was cited as 241-260)' },
  waitlist: { n: 5, title: '"Join Waitlist" anchors have no href or button role (two instances)', wcag: ['2.1.1', '4.1.2'], state: 'corrected', element: 'Action · anchor used as button', where: 'show.plush.html:253 and :261' },
  info: { n: 6, title: 'Icon-only info-popover buttons have no aria-label', wcag: ['4.1.2'], state: 'new', element: 'Icon button · popover trigger', where: 'show.plush.html:280-293' },
}

const C = {
  nameBad: `<!-- booking/show.plush.html:55-57 (pattern per Linear) -->
<div class="hotel-name ...">
  <%= hotel.Name %>
</div>`,
  nameGood: `<h1 class="hotel-name ...">
  <%= hotel.Name %>
</h1>`,
  carouselBad: `<!-- show.plush.html:103 -->
<li class="glide__slide"><img src="<%= img.URL %>" alt="slider"></li>

<!-- show.plush.html:108-115 -->
<div class="glide__arrows" data-glide-el="controls">
  <button class="glide__arrow glide__arrow--left" data-glide-dir="<">
    <i class="fa fa-chevron-left"></i>
  </button>
  <button class="glide__arrow glide__arrow--right" data-glide-dir=">">
    <i class="fa fa-chevron-right"></i>
  </button>
</div>`,
  carouselGood: `<li class="glide__slide">
  <img src="<%= img.URL %>" alt="<%= hotel.Name %> – photo <%= i + 1 %> of <%= len(images) %>">
</li>
…
<button class="glide__arrow glide__arrow--left" data-glide-dir="<"
        aria-label="Previous photo">
  <i class="fa fa-chevron-left" aria-hidden="true"></i>
</button>
<button class="glide__arrow glide__arrow--right" data-glide-dir=">"
        aria-label="Next photo">
  <i class="fa fa-chevron-right" aria-hidden="true"></i>
</button>`,
  carouselAria: `<section class="glide" aria-roledescription="carousel"
         aria-label="<%= hotel.Name %> photos">
  <div class="glide__arrows" data-glide-el="controls"> …labelled buttons… </div>
  <div class="glide__track" data-glide-el="track">
    <ul class="glide__slides">
      <li class="glide__slide" role="group" aria-roledescription="slide"
          aria-label="<%= i + 1 %> of <%= len(images) %>">
        <img src="<%= img.URL %>" alt="<%= img.Caption %>">
      </li>
    </ul>
  </div>
  <p class="sr-only" aria-live="polite" id="slide-status"></p>
</section>
<!-- Glide: glide.on('run.after', () => status.textContent = …) ; autoplay: false -->`,
  losBad: `<!-- show.plush.html:140 (colors not given in Linear) -->
<div class="alert los-warning">
  This hotel requires a minimum stay of <%= hotel.MinNights %> nights.
</div>
/* recomputed contrast: 1.85:1 */`,
  losGood: `<!-- Bootstrap 4 stock warning alert: #856404 on #FFF3CD = 4.96:1 -->
<div class="alert alert-warning" role="note">
  This hotel requires a minimum stay of <%= hotel.MinNights %> nights.
</div>`,
  losToken: `.los-warning {
  color: #78350F;             /* Presto amber-900 */
  background: #FFFBEB;        /* Presto amber-50  → 8.75:1 */
  border-left: 4px solid #D97706; /* amber-600, 3:1 non-text */
}`,
  tableBad: `<!-- show.plush.html:241-364 (pattern per Linear) -->
<table class="table room-table">
  <tr>
    <td>Room Type</td><td>Tue 6/15</td><td>Wed 6/16</td><td>Rate</td>
  </tr>
  <tr>
    <td>King Bed</td><td>12 left</td><td>8 left</td><td>$120</td>
  </tr>
  …
</table>`,
  tableGood: `<table class="table room-table">
  <caption>Room availability for <%= hotel.Name %>, <%= checkIn %>–<%= checkOut %></caption>
  <thead>
    <tr>
      <th scope="col">Room type</th>
      <%= for (d) in dates { %><th scope="col"><%= d %></th><% } %>
      <th scope="col">Nightly rate</th>
    </tr>
  </thead>
  <tbody> … </tbody>
</table>`,
  tableRow: `<tbody>
  <%= for (room) in rooms { %>
  <tr>
    <th scope="row"><%= room.Name %></th>
    <%= for (n) in room.Nights { %><td><%= n.Left %> left</td><% } %>
    <td><%= room.Rate %></td>
  </tr>
  <% } %>
</tbody>`,
  waitBad: `<!-- show.plush.html:253 and :261 -->
<a class="btn btn-link join-waitlist" data-room="<%= room.ID %>">Join Waitlist</a>`,
  waitGood: `<button type="button" class="btn btn-link join-waitlist"
        data-room="<%= room.ID %>">
  Join Waitlist<span class="sr-only"> for <%= room.Name %></span>
</button>`,
  infoBad: `<!-- show.plush.html:280-293 -->
<button type="button" class="btn btn-link p-0" data-toggle="popover"
        data-content="<%= policy.Text %>">
  <i class="fa fa-info-circle"></i>
</button>`,
  infoGood: `<button type="button" class="btn btn-link p-0" data-toggle="popover"
        data-trigger="focus" data-content="<%= policy.Text %>"
        aria-label="About <%= policy.Name %>">
  <i class="fa fa-info-circle" aria-hidden="true"></i>
</button>`,
}

const S = {
  btn: 'font:inherit;font-weight:700;color:#fff;background:#01113E;border:0;border-radius:4px;padding:8px 14px;cursor:pointer',
  link: 'font:inherit;font-weight:700;color:#01113E;background:none;border:0;padding:4px 0;text-decoration:underline;cursor:pointer',
  icon: 'width:32px;height:32px;border-radius:50%;border:1px solid #01113E;background:#fff;color:#01113E;display:inline-flex;align-items:center;justify-content:center;cursor:pointer',
  th: 'text-align:left;padding:6px 10px;border-bottom:2px solid #334155',
  td: 'padding:6px 10px;border-bottom:1px solid #CBD5E1',
  cap: 'caption-side:top;text-align:left;font-weight:700;padding:0 0 6px',
}

const header = {
  name: 'Hilton Orlando Lake Buena Vista', stars: 4, address: 'Lake Buena Vista, Orlando, FL',
  distance: '2.4 mi from venue', score: 4.5, reviews: 1284, ratingLabel: 'Excellent',
  amenities: popularAmenities(), showMap: false,
}

const roomBase = {
  roomType: 'Two-Room Suite King', bedConfig: '1 King Bed, Separate Living Room',
  maxOccupancy: 4, pricePerNight: 269, total: 5821.56, roomCount: 6,
}
const roomLimited = { ...roomBase, availability: 'limited', nights: [
  { date: 'Thu, 7/9/2026', roomsLeft: 2 }, { date: 'Fri, 7/10/2026', roomsLeft: 1 }, { date: 'Sat, 7/11/2026', roomsLeft: 3 },
] }
const roomOk = { ...roomBase, roomType: 'Two-Room Suite Double', bedConfig: '2 Double Beds, Separate Living Room', maxOccupancy: 6, pricePerNight: 289, total: 6252.36, availability: 'available', nights: [
  { date: 'Thu, 7/9/2026', roomsLeft: 5 }, { date: 'Fri, 7/10/2026', roomsLeft: 6 }, { date: 'Sat, 7/11/2026', roomsLeft: 5 },
] }

const HERO_CATS = ['exterior', 'rooms', 'dining', 'suites', 'bar', 'pool', 'lobby']
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const slides = [
  { src: exterior, alt: 'Hilton Orlando Lake Buena Vista – hotel exterior' },
  { src: lobby, alt: 'Hilton Orlando Lake Buena Vista – lobby' },
  { src: pool, alt: 'Hilton Orlando Lake Buena Vista – outdoor pool' },
]

const rows = [
  { name: 'King Bed', nights: ['12 left', '8 left', '15 left'], rate: '$120' },
  { name: 'Double Queen', nights: ['3 left', 'Sold out', '2 left'], rate: '$135' },
]
const dates = ['Tue 6/15', 'Wed 6/16', 'Thu 6/17']

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The hotel details page is where guests pick a room. It has no page heading, an unlabeled photo carousel, a hard-to-read stay warning, a room table without headers, and controls that keyboard users can't reach or identify.">

  <ada-item v-bind="I.name">
    <p>The hotel name is the page's title, but it's a styled <code>&lt;div&gt;</code>. There's no <code>&lt;h1&gt;</code> anywhere in <code>show.plush.html</code>, so heading navigation has no starting point.</p>
    <ada-code tone="bad" caption="Production — show.plush.html:55-57" :code="C.nameBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Exactly one H1 per page; it describes the page's purpose.">
      <p>Confirmed. Once the name is an <code>&lt;h1&gt;</code>, the sections below it (rooms, policies) should use <code>&lt;h2&gt;</code>.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.carousel">
    <p>Every slide is announced as "slider, image". The arrow buttons contain only an icon, so they're announced as "button" with no name.</p>
    <ada-code tone="bad" caption="Production — show.plush.html:103, :108-115" :code="C.carouselBad" />
    <sr-output before="slider, image … button … button" after="Hilton Orlando – photo 1 of 5, image … Previous photo, button … Next photo, button" />
    <agent-check agent="aria-specialist" verdict="refines" rule="Carousels: slides are role=&quot;group&quot; with aria-roledescription=&quot;slide&quot; and a position label; no auto-rotation; labelled prev/next buttons.">
      <p>Agrees with the labels. Also announce the slide position ("1 of 5"), hide the Font Awesome <code>&lt;i&gt;</code> icons with <code>aria-hidden</code>, and check that Glide's <code>autoplay</code> is off, or add a pause button (Option B).</p>
    </agent-check>
    <agent-check agent="alt-text-headings" verdict="refines" rule="Alt describes what the image shows, in context.">
      <p>"Photo 1 of 5" is better than "slider", but it's still generic. If platform stores a caption or category (lobby, pool…) for each image, use it in the alt.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.los">
    <p>Linear gives the recomputed ratio (1.85:1, down from the first estimate of 1.89:1) but <strong>not the colors</strong>, so the pair can't be shown or checked here.</p>
    <ada-code tone="bad" caption="Production — show.plush.html:140" :code="C.losBad" />
    <agent-check agent="contrast-master" verdict="refines" rule="Normal text needs 4.5:1; verify from the actual hex values.">
      <p>Agrees it fails. Two gaps in the ticket: (1) <strong>no hex values</strong>, so 1.85:1 can't be independently confirmed; (2) this problem has <strong>no acceptance criterion</strong>, and 1.4.3 isn't in the ticket's WCAG list. Add a checkbox such as "LOS alert text ≥ 4.5:1" so the fix isn't lost.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.table">
    <p>Without header cells, a screen reader reads each availability cell as a bare "8 left", with no date or room type.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:241-364" :code="C.tableBad" />
    <sr-output before="8 left" after="Double Queen, Wed 6/16, 8 left" />
    <agent-check agent="tables-data-specialist" verdict="refines" rule="caption is the first child; scope=&quot;col&quot; and scope=&quot;row&quot; are always explicit; <thead> itself adds no semantics.">
      <p>Agrees. <code>&lt;thead&gt;</code> alone doesn't help screen readers; the <code>&lt;th scope&gt;</code> cells do. This grid is two-dimensional, so each room name also needs to be <code>&lt;th scope="row"&gt;</code>. Otherwise the room type isn't announced with each cell (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.waitlist">
    <p>An <code>&lt;a&gt;</code> without <code>href</code> isn't focusable and has no role. Keyboard users can't join the waitlist at all, at either location.</p>
    <ada-code tone="bad" caption="Production — show.plush.html:253, :261" :code="C.waitBad" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Every interactive element must be reachable and operable with the keyboard; use native <button> for actions.">
      <p>Confirmed. A <code>&lt;button type="button"&gt;</code> fixes focus, role and Enter/Space together.</p>
    </agent-check>
    <agent-check agent="link-checker" verdict="refines" rule="Repeated identical control text inside a table needs row context in its accessible name.">
      <p>There are two or more "Join Waitlist" controls, each in a room row. Add the room name as visually hidden text so each has a unique name.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.info">
    <p>Icon-only buttons are announced as just "button", so users can't tell which policy each one explains.</p>
    <ada-code tone="bad" caption="Production — show.plush.html:280-293" :code="C.infoBad" />
    <sr-output before="button" after="About cancellation policy, button" />
    <agent-check agent="aria-specialist" verdict="refines" rule="Icon-only controls need an accessible name; hide decorative icons.">
      <p>Agrees. Also check the popover content itself: Bootstrap 4 appends it to <code>&lt;body&gt;</code> and doesn't link it to the button. Use <code>data-trigger="focus"</code> so it opens on keyboard focus, and make sure Esc closes it (WCAG 1.4.13).</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, HotelSummaryHeader, GalleryHero, RoomCardReserve },
    setup: () => {
      const images = ref([])
      onMounted(async () => {
        const lib = await loadImagery()
        images.value = HERO_CATS.flatMap((c, k) => (lib[c]?.length ? [{ src: lib[c][k % lib[c].length].url, title: cap(c) }] : []))
      })
      return { ID, I: ITEMS, PRESTO, header, images, roomLimited, roomOk }
    },
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same parts of the presto-2026 Hotel Details page. The redesign uses room cards instead of a table and has no waitlist or stay-length alert yet.">

  <ada-item v-bind="I.name">
    <ada-before status="applies" source="presto-2026 Storybook › Hotel Details / Hotel Summary Header" :href="PRESTO.story('hotel-details-components-hotel-summary-header--no-map')">
      <div style="max-width:1180px"><hotel-summary-header v-bind="header" /></div>
      <template #notes>
        <p>Same defect: <code>HotelSummaryHeader.vue</code> renders the name as <code>&lt;div class="dhead__name"&gt;&lt;span&gt;</code>, and neither it nor <code>HotelDetailPage.vue</code> has an <code>&lt;h1&gt;</code>. The star icons also have only a <code>title</code> tooltip, with no text alternative.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.carousel">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Details / Photo Gallery" :href="PRESTO.story('hotel-details-components-photo-gallery--default')">
      <div style="max-width:1180px"><gallery-hero :images="images" :all-images="images" /></div>
      <template #notes>
        <p><strong>Better:</strong> the desktop hero is a mosaic, not a sliding carousel, so there are no arrows to label. Photos get their category as alt text ("Exterior", "Pool"), and the "See all N photos" pill is a real button. On result cards, the carousel arrows are labeled "Previous photo" / "Next photo" (<code>HotelCardReserve.vue</code>).</p>
        <p><strong>Still present:</strong> each tile is a <code>&lt;div role="button" tabindex="0"&gt;</code> named only by its image alt, so it's announced as "Exterior, button" with no action. The last tile also nests the pill <code>&lt;button&gt;</code> inside that role=button (<code>GalleryHero.vue</code>).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.los">
    <ada-before status="partial" source="presto-2026 Storybook › Room Card (Only a Few Left)" :href="PRESTO.story('hotel-details-components-book-reservation-room-card--only-a-few-left')">
      <div class="ada-row">
        <div style="width:340px"><room-card-reserve v-bind="roomLimited" /></div>
        <contrast-pair fg="#EA580C" label="Rooms-left warning (orange-600) on white" />
      </div>
      <template #notes>
        <p>presto-2026 has no length-of-stay alert. The closest availability warning, the orange "Only N left" count, uses <code>--ds-palette-orange-600</code> at <strong>3.56:1</strong> (<code>RoomCardReserve.vue:90</code>). That's bold 16px text, which isn't "large", so it fails 4.5:1. It's the same kind of defect.</p>
        <p>Axe also flags the card's "6 rooms · incl. taxes &amp; fees" line (both cards): it uses <code>--ds-color-text-subtlest</code> (slate-400, 2.56:1) (<code>RoomCardReserve.vue:96</code>).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.table">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Details / Rooms" :href="PRESTO.story('hotel-details-components-book-reservation-rooms--default')">
      <div class="ada-row">
        <div style="width:340px"><room-card-reserve v-bind="roomOk" /></div>
      </div>
      <template #notes>
        <p><strong>Resolved differently:</strong> the redesign replaces the grid with one card per room type. Each card has an <code>&lt;h3&gt;</code> room name and an <code>&lt;h4&gt;Nights&lt;/h4&gt;</code>, so the room type always comes before its numbers.</p>
        <p><strong>Still weak:</strong> each night is a pair of <code>&lt;span&gt;</code>s ("Thu, 7/9/2026" and "5 left") with no list or <code>&lt;dl&gt;</code> structure. And the <code>&lt;h3&gt;</code> falls straight under item 1's missing <code>&lt;h1&gt;</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.waitlist">
    <ada-before status="no-equivalent" source="presto-2026 Storybook › Room Card (Sold Out)" :href="PRESTO.story('hotel-details-components-book-reservation-room-card--sold-out')">
      <template #empty>presto-2026 has no waitlist. A sold-out room shows a disabled "Unavailable" button and a note instead (<code>RoomCardReserve.vue</code>), so there's no Join Waitlist control to compare.</template>
      <template #notes><p>When a waitlist is designed, build it as a native <code>&lt;button&gt;</code> that includes the room name (see Proposal).</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.info">
    <ada-before status="resolved" source="presto-2026 Storybook › Hotel Details / Price Details" :href="PRESTO.story('hotel-details-components-book-reservation-price-details--one-fee')">
      <ada-code tone="good" caption="presto-2026 PriceDetailsDialog.vue:83-86 (same in CartReview, OrderSummary)" code='<button type="button" class="pd__info" :aria-label="\`About \${f.name}\`">
  <q-icon name="info" size="16px" />
  <q-tooltip …>{{ tipFor(f) }}</q-tooltip>
</button>' />
      <template #notes><p>Every icon-only info button has a name ("About Resort Fee"), which is what this item asks for. <strong>Separate gap:</strong> presto-2026 ships Quasar 2.19.3, whose <code>QTooltip</code> opens only on mouse hover and sets no <code>aria-describedby</code>, so keyboard and screen-reader users never get the tip text. See ENG-2935 item 5.</p></template>
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
    setup: () => {
      const idx = ref(0)
      const joined = ref([])
      const tip = ref(false)
      const go = (d) => { idx.value = (idx.value + d + slides.length) % slides.length }
      const join = (n) => { if (!joined.value.includes(n)) joined.value = [...joined.value, n] }
      return { ID, I: ITEMS, C, S, slides, idx, go, rows, dates, joined, join, tip }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria, written in platform's Plush templates. Press Tab through the demos to check them.">

  <ada-item v-bind="I.name">
    <ada-option letter="A" title="Change .hotel-name to <h1>" recommended :code="C.nameGood">
      <div class="ada-mini-frame">
        <p class="ada-note" style="margin-bottom:4px">Rendered as the page's level-1 heading:</p>
        <p style="margin:0;font-size:26px;font-weight:700" aria-hidden="true">Hilton Orlando Lake Buena Vista</p>
        <p class="ada-sr-only">Demo only: shown as text so this story keeps a single h1.</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.carousel">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label on the arrows, real alt on each slide" recommended :code="C.carouselGood">
        <div class="ada-focus-demo" style="position:relative;max-width:380px">
          <img :src="slides[idx].src" :alt="slides[idx].alt" style="display:block;width:100%;height:200px;object-fit:cover;border-radius:4px" />
          <div class="ada-row" style="margin-top:8px;align-items:center">
            <button type="button" aria-label="Previous photo" :style="S.icon" @click="go(-1)"><q-icon name="chevron_left" size="20px" aria-hidden="true" /></button>
            <button type="button" aria-label="Next photo" :style="S.icon" @click="go(1)"><q-icon name="chevron_right" size="20px" aria-hidden="true" /></button>
            <span class="ada-note">Photo {{ idx + 1 }} of {{ slides.length }}</span>
          </div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Full carousel pattern: roledescription, slide groups, polite status" :code="C.carouselAria">
        <section class="ada-focus-demo" aria-roledescription="carousel" aria-label="Hilton Orlando photos" style="max-width:380px">
          <div class="ada-row" style="margin-bottom:8px">
            <button type="button" aria-label="Previous photo" :style="S.icon" @click="go(-1)"><q-icon name="chevron_left" size="20px" aria-hidden="true" /></button>
            <button type="button" aria-label="Next photo" :style="S.icon" @click="go(1)"><q-icon name="chevron_right" size="20px" aria-hidden="true" /></button>
          </div>
          <div role="group" aria-roledescription="slide" :aria-label="(idx + 1) + ' of ' + slides.length">
            <img :src="slides[idx].src" :alt="slides[idx].alt" style="display:block;width:100%;height:200px;object-fit:cover;border-radius:4px" />
          </div>
          <p class="ada-note" aria-live="polite" style="margin-top:6px">Photo {{ idx + 1 }} of {{ slides.length }}</p>
        </section>
        <template #why><p>Controls come before the slides, each slide says where it sits in the set, and a polite status announces changes. Keep Glide's <code>autoplay</code> off so nothing moves on its own.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.los">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Meet 4.5:1 with Bootstrap's stock alert-warning (Linear gives no fix values)" recommended :code="C.losGood">
        <div class="ada-stack">
          <div role="note" style="color:#856404;background:#FFF3CD;border:1px solid #FFEEBA;border-radius:4px;padding:10px 14px">This hotel requires a minimum stay of 3 nights.</div>
          <contrast-pair fg="#856404" bg="#FFF3CD" label="Bootstrap 4 .alert-warning" />
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Presto amber tokens, with a 3:1 accent bar" lang="css" :code="C.losToken">
        <div class="ada-stack">
          <div role="note" style="color:#78350F;background:#FFFBEB;border-left:4px solid #D97706;border-radius:4px;padding:10px 14px"><q-icon name="warning" size="18px" aria-hidden="true" /> This hotel requires a minimum stay of 3 nights.</div>
          <contrast-pair fg="#78350F" bg="#FFFBEB" label="amber-900 on amber-50" />
          <contrast-pair fg="#D97706" bg="#FFFBEB" size="ui" label="amber-600 accent bar (non-text)" />
        </div>
        <template #why><p>This uses the same amber ramp as presto-2026's warning banner and gives a wide margin (8.75:1). The icon and accent bar mean the warning doesn't rely on color alone.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.table">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="<caption>, <thead> and <th scope=&quot;col&quot;>" recommended :code="C.tableGood">
        <table style="border-collapse:collapse;font-size:14px">
          <caption :style="S.cap">Room availability, Tue 6/15 – Thu 6/17</caption>
          <thead><tr><th scope="col" :style="S.th">Room type</th><th v-for="d in dates" :key="d" scope="col" :style="S.th">{{ d }}</th><th scope="col" :style="S.th">Nightly rate</th></tr></thead>
          <tbody><tr v-for="r in rows" :key="r.name"><td :style="S.td">{{ r.name }}</td><td v-for="(n, i) in r.nights" :key="i" :style="S.td">{{ n }}</td><td :style="S.td">{{ r.rate }}</td></tr></tbody>
        </table>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="tables-data-specialist" title="Also make each room name a row header" :code="C.tableRow">
        <table style="border-collapse:collapse;font-size:14px">
          <caption :style="S.cap">Room availability, Tue 6/15 – Thu 6/17</caption>
          <thead><tr><th scope="col" :style="S.th">Room type</th><th v-for="d in dates" :key="d" scope="col" :style="S.th">{{ d }}</th><th scope="col" :style="S.th">Nightly rate</th></tr></thead>
          <tbody><tr v-for="r in rows" :key="r.name"><th scope="row" :style="S.td">{{ r.name }}</th><td v-for="(n, i) in r.nights" :key="i" :style="S.td">{{ n }}</td><td :style="S.td">{{ r.rate }}</td></tr></tbody>
        </table>
        <template #why><p>With row headers, a cell is read as "Double Queen, Wed 6/16, Sold out" instead of just "Wed 6/16, Sold out". Users know which room they're on without going back to the first column.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.waitlist">
    <ada-option letter="A" title="Both Join Waitlist links become <button type=&quot;button&quot;>" recommended :code="C.waitGood">
      <div class="ada-stack ada-focus-demo">
        <div v-for="r in rows" :key="r.name" class="ada-row" style="align-items:center">
          <span style="min-width:120px">{{ r.name }}</span>
          <button type="button" :style="S.link" @click="join(r.name)">Join Waitlist<span class="ada-sr-only"> for {{ r.name }}</span></button>
          <span v-if="joined.includes(r.name)" class="ada-note">Added</span>
        </div>
        <p class="ada-sr-only" aria-live="polite">{{ joined.length ? 'Added to the waitlist for ' + joined[joined.length - 1] : '' }}</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.info">
    <ada-option letter="A" title="aria-label on every info-popover button" recommended :code="C.infoGood">
      <div class="ada-focus-demo ada-row" style="align-items:center">
        <span>Cancellation policy</span>
        <button type="button" aria-label="About cancellation policy" :aria-expanded="String(tip)" aria-controls="ada-2933-tip" :style="S.icon" @click="tip = !tip" @keydown.esc="tip = false">
          <q-icon name="info" size="18px" aria-hidden="true" />
        </button>
      </div>
      <p id="ada-2933-tip" v-show="tip" class="ada-mini-frame" style="margin-top:8px;max-width:360px">Free cancellation until 72 hours before check-in. Press Esc to close.</p>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
