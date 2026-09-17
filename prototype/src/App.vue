<script setup>
// App shell — renders the current screen and installs ONE document-level,
// capture-phase click handler that routes every intercepted CTA. The library
// page components emit no navigation events (we make ZERO library changes), so
// navigation is driven by matching the click target here. Capture phase + document
// scope also catches TELEPORTED nodes (the cart fly-out, menus) that render
// outside the active screen's DOM subtree.
import { onMounted, onBeforeUnmount, watch, nextTick, computed, reactive } from 'vue'
import { journey, holdTimer, a11y, nav, startFlow, openHotel, addActiveToCart, setRoomInHold, removeRoomFromHold, clearCart, cartRoomCount, backToBrowse, goToCheckout, resetJourney, setRoomsNeeded } from './store.js'
import { getHotelByName, getHotel } from './hotels.js'
import { loadImagery } from '@lib/lib/imagery'
import HoldTimerPill from '@lib/components/HoldTimerPill.vue'
import AddedToCartToast from '@lib/components/AddedToCartToast.vue'

// "Added to cart" toast — drops from the nav cart icon after a room is added.
const added = reactive({ show: false, key: 0, roomType: '', hotel: '', image: '', style: {}, notchRight: null })
async function resolveHotelImage(name) {
  const h = getHotelByName(name)
  if (!h) return ''
  const lib = await loadImagery()
  for (const c of h.imageCategories || []) { const arr = lib[c]; if (arr && arr.length) return arr[(h.seed || 0) % arr.length].url }
  return ''
}
function showAddedToast(roomType, hotelName) {
  const r = document.querySelector('.gnav__iconbtn')?.getBoundingClientRect()
  added.roomType = roomType
  added.hotel = hotelName
  added.image = ''
  // Phones: center the toast (anchoring it to the top-right cart icon pushes the
  // 360px card off the left edge). Desktop: keep it under the cart icon.
  const mobile = window.innerWidth < 600
  const top = r ? Math.round(r.bottom + 10) : 76
  added.style = mobile
    ? { position: 'fixed', top: `${top}px`, left: '50%', transform: 'translateX(-50%)', width: 'calc(100vw - 24px)', maxWidth: '360px', zIndex: 4000 }
    : r
      ? { position: 'fixed', top: `${top}px`, right: `${Math.round(window.innerWidth - r.right - 2)}px`, zIndex: 4000 }
      : { position: 'fixed', top: '76px', right: '24px', zIndex: 4000 }

  // DES-423: point the notch at the cart button rather than a fixed inset — the
  // centred phone card would otherwise aim it at the overflow (hamburger) menu.
  // `notchRight` is measured from the card's right edge back to the cart centre,
  // less half the 16px notch so the arrow is centred on the icon.
  if (r) {
    const width = mobile ? Math.min(360, window.innerWidth - 24) : 360
    const cardRight = mobile ? (window.innerWidth + width) / 2 : r.right + 2
    const cartCenter = r.left + r.width / 2
    added.notchRight = Math.round(Math.min(Math.max(cardRight - cartCenter - 8, 14), width - 30))
  } else {
    added.notchRight = null
  }
  added.key++
  added.show = true
  resolveHotelImage(hotelName).then((url) => { if (url) added.image = url })
}
const onToastViewCart = () => { added.show = false; openCartFlyout() }
const onToastCheckout = () => { added.show = false; goToCheckout() }
// Dismiss the toast when navigating to another screen.
watch(() => journey.screen, () => { added.show = false })
// When embedded in the mobile-prototype showcase, report the current screen (and
// active flow) to the parent so its mock browser address bar reflects the stage.
// No-op when running standalone (window.parent === window).
watch(() => [journey.screen, journey.flow], ([screen, flow]) => {
  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'presto:screen', screen, flow }, '*')
  }
}, { immediate: true })
// EventPipe wordmark (same asset the footer uses) — shown in the app bar in place
// of the "Presto" text, recolored via CSS mask. Exposed as a CSS var on the root.
import epLogo from '@lib/assets/eventpipe logos/eventpipe-logo.svg'

// DES-84: the group-block hold timer follows the workflow. Browse and Checkout
// now render their own HoldTimerBanner (top strip + scroll pill), so this
// standalone floating pill only covers the Details screen.
const showHoldPill = computed(() => holdTimer.active && journey.screen === 'details')

// Open the nav cart fly-out by triggering the library's cart button (the flyout
// is controlled inside GlobalNav; this is the no-library-change way to open it).
function openCartFlyout() {
  requestAnimationFrame(() => document.querySelector('.gnav__iconbtn')?.click())
}

// Read a group room card's live selection from the DOM (the card doesn't expose
// its internal per-night quantities via its `add` event, so we read them here).
function readGroupRoom(card) {
  if (!card) return null
  const type = card.querySelector('.rcg__title')?.textContent?.trim() || 'Room'
  const bed = card.querySelector('.rcg__bed')?.textContent?.trim() || ''
  const occ = (card.querySelector('.rcg__occ')?.textContent || '').match(/(\d+)/)?.[1]
  const summary = [bed, occ ? `Sleeps ${occ}` : ''].filter(Boolean).join(' · ')
  const nights = [...card.querySelectorAll('.rcg__night')].map((n) => ({
    date: n.querySelector('.rcg__date')?.textContent?.trim(),
    qty: parseInt(n.querySelector('.qstep__val')?.textContent?.trim() || '0', 10),
    price: parseFloat((n.querySelector('.rcg__nrate')?.textContent || '').replace(/[^0-9.]/g, '')) || 0,
    roomsLeft: parseInt((n.querySelector('.rcg__left')?.textContent || '').match(/(\d+)/)?.[1] || '9', 10),
  })).filter((n) => n.date) // keep all nights (incl. qty 0) so decreases/removals register
  return { type, summary, price: nights.find((n) => n.qty > 0)?.price || nights[0]?.price || 0, nights }
}

// The GlobalNav badge count only updates when its fly-out mounts CartReview, and
// it resets when each screen re-mounts the nav. Keep the badge in sync with the
// real room count from the prototype (no library change).
function syncBadge() {
  const n = cartRoomCount()
  nextTick(() => requestAnimationFrame(() => {
    document.querySelectorAll('.gnav__badge').forEach((b) => { b.textContent = String(n) })
  }))
}
watch(() => [journey.screen, JSON.stringify(journey.cart)], syncBadge, { immediate: true })
import LandingScreen from './screens/LandingScreen.vue'
import BrowseScreen from './screens/BrowseScreen.vue'
import DetailsScreen from './screens/DetailsScreen.vue'
import CheckoutScreen from './screens/CheckoutScreen.vue'
import ConfirmationScreen from './screens/ConfirmationScreen.vue'

const screens = {
  landing: LandingScreen,
  browse: BrowseScreen,
  details: DetailsScreen,
  checkout: CheckoutScreen,
  confirmation: ConfirmationScreen,
}

function onClickCapture(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  const screen = journey.screen

  // Opening the cart fly-out (clicking the nav cart button) should dismiss the
  // "Added to cart" toast so it doesn't float over the flyout. Don't return —
  // let GlobalNav handle opening the flyout.
  if (t.closest('.gnav__iconbtn')) added.show = false

  // Brand logo in the global nav → home (Landing), from any screen.
  // GlobalNav's brand is now a REAL link (href="/", so it works without JS and
  // has a destination — WCAG 2.4.4). In this SPA that would be a full reload
  // that throws away the journey, so cancel the navigation and route in-app.
  if (t.closest('.gnav__brand')) { e.preventDefault(); resetJourney(); return }

  // Map tooltip hotel link (name/photo) → that hotel's Details page. The library
  // popup renders `<a class="hm-link" href="#hotel-<id>">`; intercept it, cancel
  // the hash navigation, and open Details (this also unmounts the map dialog).
  const mapLink = t.closest('.hm-link')
  if (mapLink) {
    const id = (mapLink.getAttribute('href') || '').match(/#hotel-(.+)$/)?.[1]
    const hotel = id && getHotel(id)
    if (hotel) { e.preventDefault(); e.stopPropagation(); openHotel(hotel); return }
  }

  // Cart fly-out empty state "Browse hotels" → back to Browse (closes the flyout).
  if (t.closest('.cf__empty-cta')) { backToBrowse(); return }

  // Cart fly-out "Go to checkout" (teleported to <body>) — reachable from
  // Browse/Details once the cart has items.
  if (t.closest('.cf__cta')) { goToCheckout(); return }

  // "Add another reservation" / "Add another hotel" (in the fly-out or the
  // checkout order) → back to Browse to add more (keeps the cart; navigating
  // away closes the fly-out).
  if (t.closest('.cr__addhotel')) { backToBrowse(); return }

  // Cart fly-out "Clear Cart" (kebab) → empty the REAL cart so the empty state
  // shows and the details card + badge reset (CartReview clears its own view too).
  if (t.closest('.cf__clear')) { clearCart(); return }

  // Edit-room (CartReview roomEdit) → DES-414 / DES-417: open that block's hotel
  // DETAILS page, from BOTH the cart fly-out and the checkout "Review order" step.
  // Resolve the hotel by the block's name; fall back to Browse if not found. Cart
  // is kept intact; navigating away closes the fly-out.
  const roomedit = t.closest('.cr__roomedit')
  if (roomedit) {
    const hotelName = roomedit.closest('.cr__hotelblock')?.querySelector('.cr__hname')?.textContent?.trim()
    const entry = hotelName && journey.cart.find((c) => c.name === hotelName)
    if (entry) openHotel(entry)
    else backToBrowse()
    return
  }

  // Delete-room (CartReview roomDelete: cart fly-out + checkout) → remove the
  // block from the REAL cart so the details card + nav badge stay in sync.
  // CartReview also updates its own view on the same click (we don't stop the
  // event), so the flyout/checkout reflects it immediately.
  const roomdel = t.closest('.cr__roomdel')
  if (roomdel) {
    const type = roomdel.closest('.cr__room')?.querySelector('.cr__rtitle')?.textContent?.trim()
    const hotelName = roomdel.closest('.cr__hotelblock')?.querySelector('.cr__hname')?.textContent?.trim()
    if (type) removeRoomFromHold(type, hotelName)
    return
  }

  if (screen === 'landing') {
    // Search is no longer routed from the click: BookingWidget now validates
    // first and publishes a `bw-search` DOM event only when the required fields
    // are filled (WCAG 3.3.1) — see onSearch below. Clicking Search with a blank
    // booking type must NOT start a flow any more.
    return
  }

  if (screen === 'browse') {
    // Any hotel card (name or CTA) → its Details page. The library HotelListPage
    // cards don't relay Vue events, so we resolve the hotel from the card's DOM.
    // Fall back to a name-only record when it isn't in the sample dataset.
    const card = t.closest('.hc')
    if (card && (t.closest('.hc__name') || t.closest('.hc__cta'))) {
      const name = card.querySelector('.hc__name')?.textContent?.trim()
      if (name) openHotel(getHotelByName(name) || { name, city: '' })
      return
    }
    // Compact horizontal card (mobile) — the CTA is hidden, so the whole card is
    // the tap target. The Availability toggle is exempt so its panel still opens.
    const hcard = t.closest('.hch')
    if (hcard && !t.closest('.hch__availtoggle')) {
      const name = hcard.querySelector('.hch__name')?.textContent?.trim()
      if (name) openHotel(getHotelByName(name) || { name, city: '' })
    }
    return
  }

  if (screen === 'details') {
    // Room card CTA ("Reserve Room" / "Add to Cart" / "Update"). Disabled = sold
    // out / nothing selected / no change. RoomsCarousel/HotelDetailPage don't
    // relay these events, so we read the card's DOM.
    const rcta = t.closest('.rcr__cta, .rcg__cta')
    if (rcta && !rcta.disabled) {
      if (journey.flow === 'group') {
        // Group/hold (DES-416): the card's steppers show the FULL desired quantity
        // for this room type, so SET the held rooms to that (decreases reduce the
        // cart; zeroing removes it). Only toast when it's a net add.
        const room = readGroupRoom(rcta.closest('.rcg'))
        if (room) {
          const hotelName = journey.active?.name || ''
          const existing = journey.cart.find((c) => c.name === hotelName)?.rooms?.find((r) => r.type === room.type)
          const prior = existing ? existing.nights.reduce((a, n) => a + n.qty, 0) : 0
          const now = room.nights.reduce((a, n) => a + n.qty, 0)
          setRoomInHold(room)
          if (now > prior) showAddedToast(room.type, hotelName)
        }
      } else {
        // Single/multiple: go straight to checkout.
        addActiveToCart()
      }
    }
    return
  }

  if (screen === 'checkout') {
    // Group block: "View Additional Hotels" (top of the order rail) → back to the
    // hotel list to add more properties to the block (DES-411). Cart is kept.
    if (t.closest('.ck__viewhotels')) { backToBrowse(); return }
    // Rail actions: "Start over" → reset · "Edit reservation" → the hotel's
    // Details page (DES-87; falls back to Browse if no active hotel, e.g. group).
    const rail = t.closest('.ck__railbtn')
    if (rail) {
      const label = rail.textContent || ''
      if (/start over/i.test(label)) resetJourney()
      else if (/edit reservation/i.test(label) && journey.active) openHotel(journey.active)
      else backToBrowse()
      return
    }
    // Final CTA "Book Now" / "Hold Group Block Now" is NOT routed from the raw
    // click any more. Per ENG-2928/2936 the CTA uses aria-disabled instead of
    // the native disabled attribute (a disabled button is unfocusable and
    // announces no reason), so it now stays focusable and clickable even when
    // the form is incomplete. Routing on the click would sail straight past the
    // validation. The checkout page publishes a bubbling `ck-submit` event only
    // once submission actually validates — see onCheckoutSubmit below.
    return
  }

  if (screen === 'confirmation') {
    if (t.closest('.conf__banner-cta')) resetJourney()
  }
}

// BookingWidget publishes a validated search as a bubbling `bw-search` event
// (it is rendered inside LandingPage / HotelListPage, so there is no Vue event
// path to it). Routing on THAT instead of the raw button click is what makes the
// widget's validation real: an incomplete search never navigates, it focuses the
// first invalid field instead.
function onSearch(e) {
  const d = e.detail || {}
  if (journey.screen === 'landing') {
    startFlow(d.mode === 'group' ? 'group' : 'reservations', { roomsNeeded: d.roomsNeeded ?? null })
    return
  }
  // Browse: re-running the search re-reads "Rooms Needed" → the result tiers
  // (matches / partial / unavailable) reflect the requested count.
  if (journey.screen === 'browse' && journey.flow === 'group') {
    setRoomsNeeded(d.roomsNeeded ?? null)
  }
}

// CheckoutPage publishes a VALIDATED submit as a bubbling `ck-submit` event,
// the same pattern as `bw-search`. Routing on it is what makes the checkout
// validation real in the prototype: an incomplete form focuses its error
// summary and stays put, and only a clean submit reaches Confirmation.
function onCheckoutSubmit() {
  if (journey.screen === 'checkout') nav('confirmation')
}

onMounted(() => {
  document.addEventListener('click', onClickCapture, true)
  document.addEventListener('bw-search', onSearch)
  document.addEventListener('ck-submit', onCheckoutSubmit)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickCapture, true)
  document.removeEventListener('bw-search', onSearch)
  document.removeEventListener('ck-submit', onCheckoutSubmit)
})
</script>

<template>
  <div class="proto" :class="`proto--${journey.screen}`" :style="{ '--ep-logo': `url(${epLogo})` }">
    <!-- Screen-change announcer. It lives in the shell — present in the DOM long
         before it updates — so a client-side navigation is spoken (WCAG 4.1.3);
         store.nav() fills it with the new page title. -->
    <p class="sr-only" role="status">{{ a11y.message }}</p>
    <div class="proto__stage">
      <component :is="screens[journey.screen]" />
    </div>
    <!-- DES-84: floating hold countdown — starts on first room added, persists
         across screens (hidden on checkout, where the rail carries the timer). -->
    <hold-timer-pill v-if="showHoldPill" :seconds="holdTimer.remaining" />

    <!-- "Added to cart" toast — drops from the nav cart icon on each room add. -->
    <added-to-cart-toast v-if="added.show" :key="added.key" :style="added.style"
      :room-type="added.roomType" :hotel="added.hotel" :image="added.image" :auto-dismiss="4500"
      :notch-right="added.notchRight"
      @view-cart="onToastViewCart" @checkout="onToastCheckout" @dismiss="added.show = false" />
  </div>
</template>

<style>
/* Full-width canvas — spans the entire browser viewport. */
html, body { margin: 0; }
/* Reserve scrollbar space on BOTH sides so a vertical scrollbar never shifts the
   centered content off-center (keeps left/right gutters even). */
html { scrollbar-gutter: stable both-edges; }
body { background: var(--ds-palette-slate-100, #f1f2f4); }
.proto { min-height: 100vh; }
/* The shared content column: capped at 1440px, but always leaving an even ~4%
   gutter on each side so content never touches the viewport edge. */
.proto__stage { width: 100%; min-height: 100vh; background: var(--ds-color-surface, #fff); --col: min(1440px, 92%); }
/* Phones: the content column goes full-width so the ONLY gutter is each page/
   component's own 16px padding — no extra 92%-column margin (which doubled the
   gutter to ~32px and read as off-center). */
@media (max-width: 600px) {
  .proto__stage { --col: 100%; }
  /* Details tabs stick just below the sticky app nav (60px tall on phones). */
  .proto__stage { --hdp-tabs-top: 60px; --hlp-bar-top: 60px; }
}

/* Cap all interior content to a centered 1440px column with side gutters, so
   elements sit inline within the body and never run to the viewport edge.
   Prototype-level override (beats the library's scoped styles via !important) —
   no library files changed. */

/* App bar: keep the bar background edge-to-edge on the (unstyled) wrapper, and
   cap the nav's own content (brand + actions) to the shared column using the same
   reliable max-width pattern as the page content — so "Manage Booking" lines up
   with the content's right gutter instead of sitting at the viewport edge. */
.gnav-wrap {
  background: var(--ds-color-surface);
  border-bottom: 1px solid var(--ds-color-border);
}
/* Sticky nav on Browse + Details so the cart stays reachable while scrolling
   through the results / room cards — and the "Added to cart" toast (anchored to
   the cart icon) always lands on-screen. */
.proto--browse .gnav-wrap,
.proto--details .gnav-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
}
.gnav {
  max-width: var(--col) !important;
  margin-inline: auto !important;
  padding-inline: 0 !important;
  background: transparent !important;
  border-bottom: 0 !important;
}
/* Phones: give the nav the same 8px gutter as the page content (the column no
   longer constrains below its width, so add the gutter directly). */
@media (max-width: 600px) {
  /* Full-width nav so its 16px padding lands the logo/hamburger on the same
     edges as the page content/cards (no extra --col column inset). */
  .gnav { max-width: none !important; padding-inline: 16px !important; }
}

/* App-bar brand: replace the "Presto" wordmark with the EventPipe logo (the same
   asset the footer uses), at the footer's 30px height, recolored to #01103F via a
   CSS mask. Prototype-only — no library change. The minimal checkout nav keeps its
   text label ("Secure Checkout"). Logo aspect 128×33 → width 30 × 128/33 ≈ 116px. */
.gnav:not(.gnav--minimal) .gnav__brand {
  display: inline-block !important;
  width: 116px;
  height: 30px;
  font-size: 0 !important;
  color: transparent !important;
  background-color: #01103F !important;
  -webkit-mask: var(--ep-logo) no-repeat left center / contain;
  mask: var(--ep-logo) no-repeat left center / contain;
}

/* DES-89: "Booking type" → "Booking Type" (capitalize the field label). */
.bw__field--mode .q-field__label { text-transform: capitalize; }

/* DES-83: surface the "time left to book" timer at the TOP of the checkout rail
   so it's visible on arrival. The rail is display:block with the tall order
   summary first, which pushed the timer below the fold — make it a flex column
   and pull the timer above the summary card. */
.ck__railwrap { display: flex !important; flex-direction: column; }
.ck__railwrap .ck__timer { order: -1; margin-bottom: 16px; }

/* DES-78: no special-request field on the group block checkout. `.gtb__addrow`
   uniquely wraps the "Add a special request" button (group-only); the field only
   appears after clicking it, so hiding the row removes it entirely. */
.gtb__addrow { display: none !important; }

/* DES-79 superseded by DES-92: the "Cancellation policy" + "Special check-in
   instructions" Review section was removed from StepReviewReservation.vue for
   BOTH flows (it duplicated the Policies section), so the prototype no longer
   needs to hide it for group — and hiding `.srr__sec--first` would now wrongly
   hide the group's first visible section (Policies). */

/* Prototype: the checkout Policies box spans the full width of its column
   (the shared PoliciesAgreement caps itself at 640px and centers). */
.proto-ck .pol { max-width: none; }

/* Expanded checkout timer strip: the prototype caps .ck__inner to --col (a
   92%-of-column value), but the full-bleed strip resolves --col against the
   wider bled bar — so its content drifts right of "Confirm and pay". Match the
   strip's content column to .ck__inner (same min(1440px, 92% of the checkout
   content box) width, no side padding) so the label + note line up. */
.proto-ck .ck__topbar-inner {
  max-width: min(1440px, calc((100vw - 48px) * 0.92)) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* DES-74: remove the date-flexibility chips (Exact dates / ±1 / ±2 / ±3 / ±7 days)
   and their separator from the Check-in–Check-out date picker. */
.bw-menu .row.q-gutter-sm.justify-start { display: none !important; }
.bw-menu .q-separator.q-mt-md { display: none !important; }

/* Browse: make hotel names read as links to their Details page. */
.hc__name { cursor: pointer; }
.hc__name:hover { text-decoration: underline; }
/* Compact horizontal card (mobile) — whole card taps through to Details. */
.hch { cursor: pointer; }

/* Perf: the browse list is long (60 cards on a very tall page). Skip rendering
   + painting off-screen cards so scrolling stays smooth. The intrinsic-size MUST
   match the real rendered card height (~398px measured) — if it's too small, each
   card grows as it scrolls into view, shifting everything below it and making the
   scroll "skip"/jump. `auto` then remembers each card's real size after first paint. */
.hc--horizontal { content-visibility: auto; contain-intrinsic-size: auto 398px; }

/* Content blocks (and full-bleed section contents) → the shared centered column
   with even gutters on both sides. */
.hlp__search,      /* Browse booking-widget row */
.hlp__container,   /* Browse results area       */
.hdp,              /* Hotel Details content     */
.ck__inner,        /* Checkout two-column       */
.conf__inner,      /* Confirmation summary      */
.lp__content,      /* Landing body sections     */
.pf__footer-inner, /* Page footer content       */
.lp__footer-inner {
  max-width: var(--col) !important;
  margin-inline: auto !important;
  box-sizing: border-box;
}
</style>
