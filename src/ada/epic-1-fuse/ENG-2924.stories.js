// ENG-2924 · ADA-FUSE-02 — Hotel Search Results, Filtering & Google Map:
// filter grouping, unnamed slider/inputs, star toggles, map markers, carousel
// arrows, card contrast + toggle semantics, loading/end-of-results status.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, computed } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2924.linear.md?raw'
import ParentBrandField from '../../presto/components/browse/filter-rail/ParentBrandField.vue'
import RoomTypeField from '../../presto/components/browse/filter-rail/RoomTypeField.vue'
import SearchRadiusField from '../../presto/components/browse/filter-rail/SearchRadiusField.vue'
import BudgetField from '../../presto/components/browse/filter-rail/BudgetField.vue'
import StarRatingField from '../../presto/components/browse/filter-rail/StarRatingField.vue'
import HotelCardReserve from '../../presto/components/browse/HotelCardReserve.vue'
import ResultsToolbar from '../../presto/components/browse/ResultsToolbar.vue'
import { sampleRooms } from '../../presto/stories/browse/_rooms-sample.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-02 – Hotel Search Results, Filtering & Map',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2924'),
}

const ID = 'ENG-2924'

const ITEMS = {
  groups: { n: 1, title: 'Filter groups have no fieldset or legend', wcag: ['1.3.1'], element: 'Form groups · filter rail', where: 'fuse/src/modules/hotel/components/results/HotelSearchFilters.vue:287-458' },
  names: { n: 2, title: 'Distance slider, radius and max-price inputs have no accessible name', wcag: ['4.1.2', '3.3.2'], element: 'Form fields · slider, number inputs', where: 'fuse/src/modules/hotel/components/results/HotelSearchFilters.vue:343-351,355-366,386-398' },
  stars: { n: 3, title: 'Star rating filter shows selection only with a border', wcag: ['4.1.2'], element: 'Toggle buttons · star rating filter', where: 'fuse/src/modules/hotel/components/results/HotelSearchFilters.vue:418-425' },
  markers: { n: 4, title: 'Google Map markers are mouse-only and have no alt text', wcag: ['2.1.1', '4.1.2', '1.1.1'], element: 'Map markers · price, search-location, venue, single-hotel', where: 'fuse/src/modules/hotel/components/MapComponent.vue:174-192 (+ all other marker types)' },
  carousel: { n: 5, title: 'Carousel arrows have no aria-label; slide click has no keyboard equivalent', wcag: ['4.1.2', '2.1.1'], element: 'Image carousel · prev/next buttons', where: 'fuse/src/components/ImageCarousel.vue:85-109' },
  card: { n: 6, title: 'Live card city text fails contrast; Contracted availability toggle is a div; stars have no text', wcag: ['1.4.3', '4.1.2', '1.1.1'], element: 'Hotel result cards · city text, availability toggle, star rating', where: 'LiveHotelCard.vue:214-217 · ContractedHotelCard.vue:200-201,233-234 · stars: ContractedHotelCard.vue:115-125, LiveHotelCard.vue:148-159' },
  status: { n: 7, title: 'Loading and no-more-results regions are not announced', wcag: ['4.1.3'], state: 'corrected', element: 'Status messages · results list', where: 'fuse/src/modules/hotel/components/results/HotelResultsDesktop.vue:100-111,144-162' },
}

const hotel = {
  name: 'The Minuteman Inn', city: 'Acton', stars: 2.5, distance: '3.48 miles from Acton Boxborough',
  preferred: true, refundable: true, fromNightly: 100, total: 400, rooms: sampleRooms,
  imageCategories: ['exterior', 'lobby', 'rooms'], seed: 1,
}

const svg = (text, fill) =>
  'data:image/svg+xml,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="55%" font-family="sans-serif" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">${text}</text></svg>`)
const PHOTOS = [
  { src: svg('Exterior', '#01113E'), alt: 'The Minuteman Inn exterior at dusk' },
  { src: svg('Lobby', '#334155'), alt: 'Lobby with a fireplace and seating area' },
  { src: svg('King room', '#15803D'), alt: 'King room with a work desk' },
]
const PINS = [
  { id: 1, name: 'The Minuteman Inn', price: 179, x: 22, y: 30 },
  { id: 2, name: 'Acton Suites', price: 149, x: 58, y: 55 },
  { id: 3, name: 'Boxborough Hotel', price: 205, x: 74, y: 22 },
]

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The results page mixes an unlabeled filter form, a mouse-only map, and cards whose state is shown only visually. Screen-reader and keyboard users can see the results but can't reliably narrow them or tell what changed.">

  <ada-item v-bind="I.groups">
    <p>Each filter group (By Brand, Amenities, Distance, Budget, Star Rating, Room Type) starts with a styled <code>&lt;div class="filter-title"&gt;</code>. The file has no <code>&lt;fieldset&gt;</code> or <code>&lt;legend&gt;</code>, so a checkbox like "King" is read without its "Room Type" context.</p>
    <ada-code tone="bad" caption="Production pattern — HotelSearchFilters.vue" lang="vue" code='<div class="filter-title">Room Type</div>
<q-checkbox v-for="t in roomTypes" v-model="selected" :val="t" :label="t" />' />
    <agent-check agent="forms-specialist" verdict="refines" rule="Checkbox and radio sets need fieldset + legend; a single field needs a label, not a group.">
      <p>Agrees for Brand, Amenities, Star Rating and Room Type. Distance and Budget are single controls, so a visible <code>&lt;label&gt;</code> is enough there (item 2). A fieldset around one input adds noise without adding context.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.names">
    <p>The distance slider, the radius input and the max-price input have no accessible name. The max-price field has no label, placeholder or <code>aria-label</code>, so it's read as just "edit text".</p>
    <ada-code tone="bad" caption="Production pattern — HotelSearchFilters.vue:343-398" lang="vue" code='<q-slider v-model="distance" :min="0" :max="25" />
<q-input v-model="radius" type="number" />
<q-input v-model="maxPrice" type="number" prefix="$" />' />
    <sr-output before="slider, 5 · edit text" after="Distance from venue, slider, 5 miles · Maximum price per night, edit text, dollars" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Every input has a programmatic label; placeholder is never the only label.">
      <p>Agrees. The slider also needs <code>aria-valuetext</code> with the unit ("5 miles"). Without it the value is read as a bare number. In Quasar, <code>label-value</code> sets it.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.stars">
    <p>The 1–5 star buttons show the selected one only with a CSS border class. There's no <code>aria-pressed</code> and no <code>aria-label</code>, so the selection state is invisible to assistive tech.</p>
    <ada-code tone="bad" caption="Production pattern — HotelSearchFilters.vue:418-425" lang="vue" code='<q-btn v-for="n in 5" :key="n" flat icon="star"
       :class="{ selected: minStars === n }" @click="minStars = n" />' />
    <sr-output before="button · button · button" after="3 stars and up, toggle button, pressed" />
    <agent-check agent="aria-specialist" verdict="refines" rule="Use the widget role that matches behavior; aria-pressed for independent toggles, radios for a single choice.">
      <p>Agrees with <code>aria-pressed</code> + <code>aria-label</code>. Minimum star rating is a <em>single</em> choice, though, and a radio group says that directly: "3 stars and up, radio button, 3 of 6". See Option B.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.markers">
    <p>Every marker type (price pills, search location, venue, single hotel) is a plain <code>div</code> or <code>img</code> with only a mouse <code>click</code> handler. They have no <code>tabindex</code>, <code>role</code> or key handler, and the marker icons have no <code>alt</code>.</p>
    <ada-code tone="bad" caption="Production pattern — MapComponent.vue:174-192" lang="vue" code='<div class="price-marker" @click="selectHotel(hotel)">\${{ hotel.price }}</div>
<img :src="venueIcon" @click="showVenue()" />' />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="All functionality is available from the keyboard (WCAG 2.1.1).">
      <p>Confirmed. Tab skips the whole map, so the hotel popups can only be opened with a mouse.</p>
    </agent-check>
    <agent-check agent="aria-specialist" verdict="refines" rule="First rule of ARIA: a native &lt;button&gt; beats div role=&quot;button&quot;.">
      <p>Render marker content as a real <code>&lt;button&gt;</code> (or use Google's <code>AdvancedMarkerElement</code> with <code>gmpClickable</code>, which handles focus and Enter/Space). That avoids hand-written keydown handlers. The accessible name belongs on the button ("The Minuteman Inn, $179 per night"). The icon inside it should get <code>alt=""</code>, or the name is read twice.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.carousel">
    <p>The prev/next buttons have no <code>aria-label</code> anywhere in the file. The slide image also has a click handler (open the gallery) that can't be reached by keyboard.</p>
    <ada-code tone="bad" caption="Production pattern — ImageCarousel.vue:85-109" lang="vue" code='<q-btn round icon="chevron_left" @click="prev" />
<img :src="images[i]" @click="openGallery" />
<q-btn round icon="chevron_right" @click="next" />' />
    <agent-check agent="aria-specialist" verdict="refines" rule="Carousel: labelled prev/next, each slide a group with “N of M”, no mouse-only actions.">
      <p>Agrees with the labels. The acceptance criteria don't cover the slide click. Wrap the image in a <code>&lt;button aria-label="Open photo gallery"&gt;</code>, and expose the position ("Photo 2 of 3") so users know when they've looped.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.card">
    <p>Two different card defects. The <strong>Live</strong> card's city text is <code>#98A2B3</code> on white (the Contracted card shows no city). The <strong>Contracted</strong> card's room-availability toggle is a clickable <code>&lt;div&gt;</code> with no role, <code>tabindex</code> or <code>aria-expanded</code>. The acceptance criteria also ask for a text version of both cards' star ratings.</p>
    <contrast-pair fg="#98A2B3" bg="#FFFFFF" label="Production LiveHotelCard city text on white" />
    <ada-code tone="bad" caption="Production pattern — ContractedHotelCard.vue:200-201, 233-234" lang="vue" code='<div class="room-availability" @click="showRooms = !showRooms">
  Room Availability <q-icon name="expand_more" />
</div>' />
    <agent-check agent="contrast-master" verdict="agrees" rule="Secondary text still needs 4.5:1; “it's just a caption” is not an exception.">
      <p>Confirmed at <strong>2.58:1</strong> (Linear: ≈2.57). The same gray ramp has passing shades: <code>#667085</code> at 4.98:1 and <code>#475467</code> at 7.69:1.</p>
    </agent-check>
    <agent-check agent="aria-specialist" verdict="refines" rule="Disclosure: native button with aria-expanded and aria-controls.">
      <p>Use a native <code>&lt;button&gt;</code> rather than adding <code>role</code> and <code>tabindex</code> to the div, and point <code>aria-controls</code> at the panel. For stars, one <code>role="img"</code> wrapper with <code>aria-label="2.5 out of 5 stars"</code> is enough; hide the individual icons.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.status">
    <p>Linear corrected an earlier draft: fuse has no results-counter element. The real gap is that the loading spinner and the "no more results" message appear without <code>aria-live</code> or <code>role="status"</code>, so nothing is announced when more hotels load or when the list ends.</p>
    <ada-code tone="bad" caption="Production pattern — HotelResultsDesktop.vue:100-111, 144-162" lang="vue" code='<div v-if="loading" class="loading"><q-spinner /></div>
<div v-if="noMoreResults" class="end">No more results</div>' />
    <agent-check agent="live-region-controller" verdict="refines" rule="The live region must exist in the DOM before its content changes; use aria-busy during batch updates.">
      <p>Agrees. Wrapping the existing <code>v-if</code> blocks in <code>role="status"</code> won't work reliably, because the region appears together with its text. Keep one status element mounted and change only its text. Also set <code>aria-busy</code> on the list while it loads, and announce the outcome ("12 more hotels loaded").</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ParentBrandField, RoomTypeField, SearchRadiusField, BudgetField, StarRatingField, HotelCardReserve, ResultsToolbar },
    setup: () => ({ ID, I: ITEMS, hotel, PRESTO, radius: ref(5), budget: ref({ basis: 'night', max: '' }), minStars: ref(3), brands: ref([]), roomTypes: ref([]) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The Browse Hotels filter rail, map and result cards in presto-2026. The cards and carousel are mostly fixed; the filter form and results status repeat the production gaps.">

  <ada-item v-bind="I.groups">
    <ada-before status="partial" source="presto-2026 Storybook › Browse Hotels / Filter Rail" :href="PRESTO.story('browse-hotels-components-left-rail-filter-rail--default')">
      <div class="ada-row" style="gap:32px">
        <div style="width:260px"><parent-brand-field v-model="brands" /></div>
        <div style="width:260px"><room-type-field v-model="roomTypes" /></div>
      </div>
      <template #notes>
        <p>Each section title is an <code>&lt;h3 class="fr__title"&gt;</code> (e.g. <code>ParentBrandField.vue:21</code>, <code>RoomTypeField.vue:21</code>), so users can jump between groups by heading. That's better than production's div.</p>
        <p><strong>Partial:</strong> the checkboxes still aren't in a <code>fieldset</code> or <code>role="group"</code>, so "King" is read without "Room Type".</p>
        <p>Axe also reports <code>target-size</code> here. The <code>dense</code> <code>q-checkbox</code> (L22) is smaller than 24×24px (WCAG 2.5.8). That's a presto-only issue, outside Linear's scope.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.names">
    <ada-before status="applies" source="presto-2026 Storybook › Search & Filters / Budget" :href="PRESTO.story('browse-hotels-components-left-rail-search-filters--budget')">
      <div class="ada-row" style="gap:32px">
        <div style="width:260px"><search-radius-field v-model="radius" /></div>
        <div style="width:260px"><budget-field v-model="budget" /></div>
      </div>
      <template #notes>
        <p><code>SearchRadiusField.vue:25</code>: the <code>q-slider</code> has no name. The value box beside it (L27) is a read-only input with only <code>placeholder="Any"</code>.</p>
        <p><code>BudgetField.vue:35</code>: the max input has only a placeholder ("Max per night") and a <code>$</code> prefix. The Per Night / Total Stay buttons (L32-33) show which one is on only by fill color, with no <code>aria-pressed</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.stars">
    <ada-before status="applies" source="presto-2026 Storybook › Search & Filters / Star Rating" :href="PRESTO.story('browse-hotels-components-left-rail-search-filters--star-rating')">
      <div style="width:300px"><star-rating-field v-model="minStars" /></div>
      <template #notes>
        <p><code>StarRatingField.vue:20-28</code>: only the <code>is-on</code> class shows the selection. The star icon is <code>aria-hidden</code>, so each button is named just "1" to "5". The "3★ minimum &amp; up" text under the buttons (L30) helps sighted users, but it isn't linked to the buttons or announced.</p>
        <p>presto's <code>DsChoiceChips</code> (Components/Forms/Choice Chips › Star Rating) already uses <code>role="group"</code> + <code>aria-pressed</code>, but the rail doesn't use it.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.markers">
    <ada-before status="partial" source="presto-2026 Storybook › Browse Hotels / Hotel Map" :href="PRESTO.story('browse-hotels-components-left-rail-hotel-map--default')">
      <ada-code tone="good" caption="presto-2026 — HotelMap.vue:213-217 (hotel pills) and :253-256 (event pin)" lang="js" code="new g.marker.AdvancedMarkerElement({
  position, content: pillEl, gmpClickable: true, title: h.name,
})" />
      <ada-code tone="bad" caption="presto-2026 — HotelMap.vue:230-238 (clusters), :145 (popup link), :356 (popup close)" lang="js" code="// cluster bubble: no gmpClickable, no title — announced as a bare number
return new g.marker.AdvancedMarkerElement({ position, content: el, zIndex: 1000 + count })

const url = h.url || '#'                       // popup links default to a dead href
.gm-style-iw .gm-ui-hover-effect { display: none !important; }  // InfoWindow close hidden" />
      <template #notes>
        <p>The map needs a Google Maps key, so it isn't rendered here. From the source: hotel and event markers use <code>gmpClickable</code> + <code>title</code>, which Google makes focusable and operable with Enter/Space. That covers most of Linear's criterion.</p>
        <p><strong>Still open:</strong> cluster bubbles have no name and aren't keyboard targets. The popup's close button is hidden with CSS, and popup links fall back to <code>href="#"</code>. The accessible name is the hotel name only; the price in the pill isn't in it.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.carousel">
    <ada-before status="resolved" source="presto-2026 Storybook › Hotel Listing Card / Book Reservations" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--fully-available')">
      <div style="max-width:1040px"><hotel-card-reserve v-bind="hotel" availability="available" /></div>
      <template #notes>
        <p><code>HotelCardReserve.vue:80-81</code>: the arrows are native buttons with <code>aria-label="Previous photo"</code> / <code>"Next photo"</code>. The image (L76) has no click handler, and its alt text comes from the imagery library.</p>
        <p>The agent's refinement is still open: nothing announces "Photo 2 of 3".</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.card">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Listing Card / Doesn't Match Filters" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--doesnt-match-filters')">
      <div style="max-width:1040px"><hotel-card-reserve v-bind="hotel" availability="unmatched" /></div>
      <template #notes>
        <p><strong>Resolved:</strong> city text uses <code>--ds-color-text-subtle</code> (Slate 600, 7.58:1). The Availability toggle (<code>HotelCardReserve.vue:103</code>) is a native <code>&lt;button&gt;</code> with <code>aria-expanded</code>, though it has no <code>aria-controls</code>.</p>
        <p><strong>Still present:</strong> the stars (L90) are icons only, with no text version. There's also a presto-only contrast failure: the orange "Adjust your search parameters" status (<code>.hc__status--warning</code>, 16px/600) is too light.</p>
        <contrast-pair fg="#EA580C" bg="#FFFFFF" label="presto --ds-palette-orange-600 status text on white" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.status">
    <ada-before status="applies" source="presto-2026 Storybook › Result States / Loading" :href="PRESTO.story('browse-hotels-components-results-result-states-book-reservation--loading')">
      <div style="max-width:760px"><results-toolbar :count="12" /></div>
      <template #notes>
        <p>presto adds a results count (<code>ResultsToolbar.vue:28-39</code>), but it isn't a live region. <code>HotelListPage.vue:298-313</code> shows loading skeletons with no <code>role="status"</code> or <code>aria-busy</code>. The empty state (L324) and error state (L316) swap in with no announcement.</p>
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
      const rooms = ref(['King'])
      const radius = ref(5)
      const maxPrice = ref('')
      const minA = ref(3)
      const minB = ref(3)
      const starOptions = [
        { label: 'Any rating', value: 0 },
        ...[1, 2, 3, 4, 5].map((n) => ({ label: `${n} star${n > 1 ? 's' : ''} and up`, value: n })),
      ]
      // Map demo
      const pickedA = ref(null)
      const pickedB = ref(null)
      const pinName = (p) => `${p.name}, $${p.price} per night`
      // Carousel demo
      const slide = ref(0)
      const slideB = ref(0)
      const wrap = (v, d) => (v + d + PHOTOS.length) % PHOTOS.length
      const go = (d) => { slide.value = wrap(slide.value, d) }
      const goB = (d) => { slideB.value = wrap(slideB.value, d) }
      const galleryMsg = ref('')
      // Card demo
      const open = ref(false)
      // Status demo
      const loaded = ref(6)
      const loading = ref(false)
      const statusMsg = ref('')
      const loadMore = () => {
        loading.value = true
        statusMsg.value = 'Loading more hotels…'
        setTimeout(() => {
          loading.value = false
          if (loaded.value < 12) { loaded.value += 6; statusMsg.value = '6 more hotels loaded. Showing 12 of 12.' } else statusMsg.value = 'No more results.'
        }, 700)
      }
      return {
        ID, I: ITEMS, PHOTOS, PINS,
        rooms, radius, maxPrice, minA, minB, starOptions,
        pickedA, pickedB, pinName, slide, slideB, go, goB, galleryMsg, open,
        loaded, loading, statusMsg, loadMore,
        cur: computed(() => PHOTOS[slide.value]), curB: computed(() => PHOTOS[slideB.value]),
      }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press Tab through each demo; the map, carousel and results demos are interactive.">

  <ada-item v-bind="I.groups">
    <ada-option letter="A" title="Wrap each filter group in fieldset + legend" recommended lang="vue"
      code='<fieldset class="filter-group">
  <legend class="filter-title">Room Type</legend>
  <q-checkbox v-for="t in roomTypes" :key="t" v-model="selected" :val="t" :label="t" />
</fieldset>

.filter-group { border: 0; padding: 0; margin: 0 0 16px; }'>
      <fieldset style="border:0;padding:0;margin:0;max-width:260px">
        <legend style="font-size:18px;font-weight:700;color:#01113E;padding:0;margin-bottom:4px">Room Type</legend>
        <q-checkbox v-for="t in ['King', 'Double', 'Queen', 'Suite']" :key="t" v-model="rooms" :val="t" :label="t" color="primary" style="display:flex" />
      </fieldset>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.names">
    <ada-option letter="A" title="Accessible names on the slider and both numeric inputs" recommended lang="vue"
      code='<q-slider v-model="distance" :min="0" :max="25"
          aria-label="Distance from venue" :label-value="distance + &quot; miles&quot;" />
<q-input v-model="radius" type="number" label="Search radius (miles)" />
<q-input v-model="maxPrice" type="number" prefix="$" label="Maximum price per night" />'>
      <div class="ada-stack" style="max-width:320px">
        <div>
          <span id="dist-lbl" style="font-weight:700">Distance from venue: {{ radius }} miles</span>
          <q-slider v-model="radius" :min="0" :max="25" :step="1" color="primary" aria-labelledby="dist-lbl" :label-value="radius + ' miles'" />
        </div>
        <q-input v-model.number="radius" type="number" outlined dense label="Search radius (miles)" />
        <q-input v-model="maxPrice" type="number" outlined dense prefix="$" label="Maximum price per night" />
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.stars">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-pressed + aria-label on each star button" recommended lang="vue"
        code='<div role="group" aria-labelledby="stars-lbl">
  <button v-for="n in 5" :key="n" type="button"
          :aria-pressed="minStars === n"
          :aria-label="n + &quot; stars and up&quot;"
          @click="minStars = minStars === n ? 0 : n">
    {{ n }}<q-icon name="star" />
  </button>
</div>'>
        <p id="stars-a" style="margin:0 0 6px;font-weight:700">Minimum star rating</p>
        <div role="group" aria-labelledby="stars-a" class="ada-row ada-focus-demo" style="gap:8px">
          <button v-for="n in 5" :key="n" type="button" :aria-pressed="String(minA === n)" :aria-label="n + (n > 1 ? ' stars' : ' star') + ' and up'"
            :style="{ width: '48px', height: '44px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', border: '1px solid #01113E', background: minA === n ? '#01113E' : '#fff', color: minA === n ? '#fff' : '#01113E' }"
            @click="minA = minA === n ? 0 : n">{{ n }}<q-icon name="star" size="15px" /></button>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Radio group with an explicit “Any rating” option" lang="vue"
        code='<fieldset>
  <legend>Minimum star rating</legend>
  <q-option-group v-model="minStars" type="radio" :options="starOptions" />
</fieldset>'>
        <fieldset style="border:0;padding:0;margin:0">
          <legend style="font-weight:700;padding:0">Minimum star rating</legend>
          <q-option-group v-model="minB" type="radio" :options="starOptions" color="primary" />
        </fieldset>
        <template #why><p>Only one minimum applies at a time. Radios say that ("3 stars and up, 4 of 6"), and arrow keys move between them. "Any rating" replaces the hidden "click again to clear" behavior.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.markers">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="tabindex, role=&quot;button&quot; and a keydown handler on every marker" recommended lang="vue"
        code='<div class="price-marker" role="button" tabindex="0"
     :aria-label="hotel.name + &quot;, $&quot; + hotel.price + &quot; per night&quot;"
     @click="selectHotel(hotel)"
     @keydown.enter.prevent="selectHotel(hotel)"
     @keydown.space.prevent="selectHotel(hotel)">\${{ hotel.price }}</div>

<img :src="venueIcon" :alt="venue.name" … />'>
        <div class="ada-focus-demo" style="position:relative;height:200px;border-radius:8px;background:#E2E8F0;overflow:hidden">
          <div v-for="p in PINS" :key="p.id" role="button" tabindex="0" :aria-label="pinName(p)" :aria-pressed="String(pickedA === p.id)"
            :style="{ position: 'absolute', left: p.x + '%', top: p.y + '%', padding: '5px 12px', borderRadius: '999px', font: '600 13px/1 inherit', cursor: 'pointer', border: '3px solid #01113E', background: pickedA === p.id ? '#fff' : '#01113E', color: pickedA === p.id ? '#01113E' : '#fff' }"
            @click="pickedA = p.id" @keydown.enter.prevent="pickedA = p.id" @keydown.space.prevent="pickedA = p.id">\${{ p.price }}</div>
        </div>
        <p class="ada-note" aria-live="polite">{{ pickedA ? 'Selected: ' + PINS.find(p => p.id === pickedA).name : 'Tab to a price and press Enter.' }}</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Native &lt;button&gt; marker content (or gmpClickable)" lang="js"
        code="const pin = document.createElement('button')
pin.type = 'button'
pin.className = 'price-marker'
pin.textContent = '$' + hotel.price
pin.setAttribute('aria-label', hotel.name + ', $' + hotel.price + ' per night')
pin.addEventListener('click', () => selectHotel(hotel))   // Enter/Space for free
new google.maps.marker.AdvancedMarkerElement({ map, position, content: pin })">
        <div class="ada-focus-demo" style="position:relative;height:200px;border-radius:8px;background:#E2E8F0;overflow:hidden">
          <button v-for="p in PINS" :key="p.id" type="button" :aria-label="pinName(p)" :aria-pressed="String(pickedB === p.id)"
            :style="{ position: 'absolute', left: p.x + '%', top: p.y + '%', padding: '5px 12px', borderRadius: '999px', font: '600 13px/1 inherit', cursor: 'pointer', border: '3px solid #01113E', background: pickedB === p.id ? '#fff' : '#01113E', color: pickedB === p.id ? '#01113E' : '#fff' }"
            @click="pickedB = p.id">\${{ p.price }}</button>
        </div>
        <p class="ada-note" aria-live="polite">{{ pickedB ? 'Selected: ' + PINS.find(p => p.id === pickedB).name : 'Tab to a price and press Enter.' }}</p>
        <template #why><p>A real button gets focus, Enter and Space, and the right role with no custom key handling. The same approach fixes the venue and search-location markers. Keep the results list as the non-map way to reach every hotel.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.carousel">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label on the carousel arrows" recommended lang="vue"
        code='<q-btn round icon="chevron_left" aria-label="Previous photo" @click="prev" />
<q-btn round icon="chevron_right" aria-label="Next photo" @click="next" />'>
        <div style="position:relative;width:320px;max-width:100%">
          <img :src="cur.src" :alt="cur.alt" width="320" height="180" style="display:block;border-radius:6px;max-width:100%" />
          <q-btn round dense color="dark" icon="chevron_left" aria-label="Previous photo" style="position:absolute;left:8px;top:50%;transform:translateY(-50%)" @click="go(-1)" />
          <q-btn round dense color="dark" icon="chevron_right" aria-label="Next photo" style="position:absolute;right:8px;top:50%;transform:translateY(-50%)" @click="go(1)" />
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Announce the position and make the gallery action a button" lang="vue"
        code='<div role="group" aria-roledescription="carousel" aria-label="Hotel photos">
  <q-btn icon="chevron_left" aria-label="Previous photo" @click="prev" />
  <q-btn icon="chevron_right" aria-label="Next photo" @click="next" />
  <button type="button" class="slide" aria-label="Open photo gallery">
    <img :src="photo.src" :alt="photo.alt" />
  </button>
  <p aria-live="polite">Photo {{ i + 1 }} of {{ photos.length }}</p>
</div>'>
        <div role="group" aria-roledescription="carousel" aria-label="Hotel photos" style="width:320px;max-width:100%">
          <div class="ada-row" style="justify-content:space-between;align-items:center;margin-bottom:6px">
            <q-btn round dense outline color="primary" icon="chevron_left" aria-label="Previous photo" @click="goB(-1)" />
            <span aria-live="polite" style="font-weight:600">Photo {{ slideB + 1 }} of {{ PHOTOS.length }}</span>
            <q-btn round dense outline color="primary" icon="chevron_right" aria-label="Next photo" @click="goB(1)" />
          </div>
          <button type="button" aria-label="Open photo gallery" style="padding:0;border:0;background:none;cursor:pointer;display:block" @click="galleryMsg = 'Gallery would open here.'">
            <img :src="curB.src" :alt="curB.alt" width="320" height="180" style="display:block;border-radius:6px;max-width:100%" />
          </button>
          <p class="ada-note" aria-live="polite">{{ galleryMsg }}</p>
        </div>
        <template #why><p>This covers the slide-click half of Linear's problem, which the acceptance criteria leave out. "Photo 2 of 3" also tells users when the carousel has wrapped around.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.card">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Passing city color, button semantics on the toggle, text star rating" recommended lang="vue"
        code='<div class="city" style="color:#667085">{{ hotel.city }}</div>   <!-- 4.98:1 -->
<span role="img" :aria-label="hotel.stars + &quot; out of 5 stars&quot;">
  <q-icon v-for="s in starIcons" :name="s" aria-hidden="true" />
</span>
<button type="button" :aria-expanded="open" aria-controls="avail-123" @click="open = !open">
  Room Availability <q-icon :name="open ? &quot;expand_less&quot; : &quot;expand_more&quot;" />
</button>
<div id="avail-123" v-show="open">…</div>'>
        <div class="ada-mini-frame ada-focus-demo" style="max-width:340px">
          <p style="margin:0;font-size:18px;font-weight:700;color:#01113E">The Minuteman Inn</p>
          <p style="margin:0 0 6px;color:#667085">Acton</p>
          <span role="img" aria-label="2.5 out of 5 stars" style="color:#01113E;display:inline-flex">
            <q-icon name="star" size="18px" /><q-icon name="star" size="18px" /><q-icon name="star_half" size="18px" /><q-icon name="star_border" size="18px" /><q-icon name="star_border" size="18px" />
          </span>
          <div style="margin-top:10px">
            <button type="button" :aria-expanded="String(open)" aria-controls="card-avail" style="background:none;border:0;padding:4px 0;color:#01113E;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;display:inline-flex;align-items:center;gap:4px" @click="open = !open">
              Room Availability <q-icon :name="open ? 'expand_less' : 'expand_more'" size="18px" />
            </button>
            <div id="card-avail" v-show="open" style="margin-top:6px">King: 5 rooms left · Double Queen: 2 rooms left</div>
          </div>
        </div>
        <contrast-pair fg="#667085" bg="#FFFFFF" label="City text in #667085 (same gray ramp as production)" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Use presto's text-subtle token instead of a one-off gray" lang="scss"
        code="// LiveHotelCard.vue
.city { color: var(--ds-color-text-subtle); }   // Slate 600, 7.58:1

// presto also fails here — fix at the token level:
.hc__status--warning { color: var(--ds-palette-orange-700); }">
        <contrast-pair fg="#475569" bg="#FFFFFF" label="presto --ds-color-text-subtle (Slate 600)" />
        <template #why><p>The redesign already defines a secondary-text token that passes with room to spare. Using the token instead of a hard-coded gray keeps the Live and Contracted cards from drifting apart again.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.status">
    <ada-option letter="A" title="aria-live=&quot;polite&quot; / role=&quot;status&quot; on the loading and no-more-results regions" recommended lang="vue"
      code='<!-- always mounted; only the text changes -->
<p role="status" aria-live="polite" class="results-status">
  {{ loading ? "Loading more hotels…" : noMoreResults ? "No more results." : "" }}
</p>
<ul class="results" :aria-busy="loading">…</ul>'>
      <div class="ada-stack" style="max-width:420px">
        <ul :aria-busy="String(loading)" style="margin:0;padding-left:20px">
          <li v-for="n in loaded" :key="n">Hotel result {{ n }}</li>
        </ul>
        <p role="status" aria-live="polite" style="margin:0;font-weight:600;min-height:1.5em">{{ statusMsg }}</p>
        <div class="ada-row"><q-btn unelevated color="primary" no-caps label="Load more hotels" :loading="loading" @click="loadMore" /></div>
      </div>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
