// Journey store — the single source of truth threaded through every screen, plus
// the lightweight router. All navigation glue lives in the prototype layer (this
// file + App.vue's global click handler); NO library component is modified.
//
// Booking-mode model (see Getting Started → Architecture cheat-sheet):
//   widget mode  'reservations' | 'group'   ← chosen on the landing widget
//   flow         'reserve'      | 'group'    ← canonical branch
//   Single vs multiple is CART-DRIVEN: a `reserve` flow with >1 hotel in the cart
//   becomes the "multiple reservations" checkout.
import { reactive, computed, nextTick } from 'vue'

export const SCREENS = ['landing', 'browse', 'details', 'checkout', 'confirmation']

export const journey = reactive({
  screen: 'landing',
  // 'reserve' (single/multiple, cart-driven) | 'group' (hold a block)
  flow: 'reserve',
  // The hotel currently open on the Details screen: { name, city } | null
  active: null,
  // Hotels chosen (reserve: one per reservation; group: hotels in the block).
  // Each entry: { name, city }
  cart: [],
  // Whether the cart fly-out should be openable in the nav (forced once cart > 0).
  cartOpen: false,
  // Group flow: the "Rooms Needed" entered on the landing widget, carried to the
  // Browse widget so the search context persists across the step.
  roomsNeeded: null,
})

// ── Group-block hold timer (DES-84) ──
// Group rooms are held temporarily the moment the FIRST room is added to the
// cart — not when the guest reaches checkout. This single shared countdown is
// started on that first add and lives here (not in any screen) so it keeps
// running across browse → details → checkout. The floating HoldTimerPill
// (rendered in the app shell) and the checkout rail both read `remaining`.
const HOLD_DURATION = 15 * 60 // seconds a group block is held
export const holdTimer = reactive({ active: false, remaining: HOLD_DURATION })
let holdInterval = null

export function startHoldTimer() {
  if (holdTimer.active) return // already counting — don't restart on later adds
  holdTimer.active = true
  holdTimer.remaining = HOLD_DURATION
  holdInterval = setInterval(() => {
    if (holdTimer.remaining > 0) holdTimer.remaining--
    else stopHoldTimer()
  }, 1000)
}

export function stopHoldTimer() {
  holdTimer.active = false
  holdTimer.remaining = HOLD_DURATION
  if (holdInterval) { clearInterval(holdInterval); holdInterval = null }
}

// ── Derived modes (map the canonical flow → each component's prop vocabulary) ──

export const cartCount = computed(() => journey.cart.length)

// CheckoutPage.vue vocabulary: 'reservation' | 'reservations' | 'group'
export const checkoutMode = computed(() => {
  if (journey.flow === 'group') return 'group'
  return journey.cart.length > 1 ? 'reservations' : 'reservation'
})

// CartReview / ConfirmationPage / PageFrame cartMode vocabulary:
// 'reserve' | 'reservations' | 'hold'
export const cartMode = computed(() => {
  if (journey.flow === 'group') return 'hold'
  return journey.cart.length > 1 ? 'reservations' : 'reserve'
})

// ConfirmationPage.vue mode vocabulary: 'reserve' | 'reservations' | 'hold'
export const confirmationMode = cartMode

// HotelDetailPage.roomsFlow / RoomsCarousel.flow vocabulary: 'reserve' | 'group'
export const roomsFlow = computed(() => (journey.flow === 'group' ? 'group' : 'reserve'))

// Whether the nav cart is visible on Browse/Details (reserve shows once something
// is added; group always shows because rooms are held incrementally).
export const cartVisible = computed(() => journey.flow === 'group' || journey.cart.length > 0)

// ── Navigation ──

// Reflect the current journey in the URL so every screen is deeplinkable /
// shareable (read back by bootstrapFromUrl on load). Milestones: screen + flow,
// plus the open hotel and cart size so details/checkout restore sensibly.
function syncUrl() {
  if (typeof window === 'undefined' || !window.history) return
  const q = new URLSearchParams()
  q.set('screen', journey.screen)
  q.set('flow', journey.flow)
  if (journey.active?.name) {
    q.set('hotel', journey.active.name)
    if (journey.active.city) q.set('city', journey.active.city)
  }
  if (journey.cart.length) q.set('n', String(journey.cart.length))
  if (journey.roomsNeeded) q.set('rooms', String(journey.roomsNeeded))
  window.history.replaceState(null, '', `${window.location.pathname}?${q.toString()}`)
}

// Group flow: set the requested room count (drives the Browse result tiers) and
// keep the URL in sync so the query is shareable.
export function setRoomsNeeded(v) {
  journey.roomsNeeded = (typeof v === 'number' && v > 0) ? v : null
  syncUrl()
}

// ── Screen change: title, focus and announcement ──
// This is a single-page app, so a "page change" is just a component swap: the
// browser gives no new title and focus stays wherever it was (often on a button
// that no longer exists). Three things happen on every navigation:
//   · document.title describes the stage        — WCAG 2.4.2 Page Titled
//   · focus moves to the new screen's <h1>      — WCAG 2.4.3 Focus Order
//   · the new title is announced politely       — WCAG 4.1.3 Status Messages
// The live region itself lives in App.vue so it is present before it updates.
export const a11y = reactive({ message: '' })

const SITE = 'Presto booking'
export function screenTitle(screen = journey.screen) {
  const group = journey.flow === 'group'
  switch (screen) {
    case 'browse': return `${group ? 'Hotels for your group block' : 'Choose a hotel'} — ${SITE}`
    case 'details': return `${journey.active?.name || 'Hotel details'} — ${SITE}`
    case 'checkout': return `${group ? 'Hold your group block' : 'Checkout'} — ${SITE}`
    case 'confirmation': return `${group ? 'Group block confirmed' : 'Reservation confirmed'} — ${SITE}`
    default: return `Summer Soccer Classic 2027 — ${SITE}`
  }
}

// Exported so the deep-link bootstrap can title the first render too.
export function applyScreenTitle(screen = journey.screen) {
  if (typeof document !== 'undefined') document.title = screenTitle(screen)
}

function focusScreenHeading() {
  if (typeof document === 'undefined') return
  const h1 = document.querySelector('.proto__stage h1')
  if (!h1) return
  // Screens whose h1 isn't already focusable get a programmatic-only tab stop.
  if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1')
  h1.focus({ preventScroll: true })
}

export function nav(screen) {
  if (!SCREENS.includes(screen)) return
  journey.cartOpen = false
  journey.screen = screen
  syncUrl()
  applyScreenTitle(screen)
  // Clear first so navigating to a screen with the same title still announces.
  a11y.message = ''
  nextTick(() => {
    focusScreenHeading()
    a11y.message = screenTitle(screen)
  })
  requestAnimationFrame(() => window.scrollTo({ top: 0 }))
}

export function startFlow(widgetMode, opts = {}) {
  journey.flow = widgetMode === 'group' ? 'group' : 'reserve'
  journey.cart = []
  journey.active = null
  journey.roomsNeeded = opts.roomsNeeded ?? null // carry the landing "Rooms Needed"
  stopHoldTimer() // a fresh search clears any prior hold
  nav('browse')
}

// Open a hotel's Details screen. hotel = { name, city }
export function openHotel(hotel) {
  journey.active = hotel
  nav('details')
}

// Add the active hotel to the cart and go straight to Checkout (the expected
// "select a room → checkout" path). Reserve: one entry per hotel → single, or
// 'reservations' once there are 2+. Group: the hotel's held rooms → the block.
// Dedupes by name. Use "Add another reservation/hotel" or "Edit reservation" in
// Checkout to come back and add more.
export function addActiveToCart() {
  const h = journey.active
  if (h && !journey.cart.some((c) => c.name === h.name)) journey.cart.push({ ...h })
  nav('checkout')
}

// Group/hold: add a specific room (with its per-night quantities) to the active
// hotel's cart entry, accumulating across multiple "Add to Cart" clicks. Merges
// by room type (sums per-night qty); different types are added as separate rooms.
// `room` = { type, summary, price, nights: [{ date, qty, roomsLeft }] }
export function addRoomToHold(room) {
  const h = journey.active
  if (!h || !room || !room.nights || !room.nights.length) return
  let entry = journey.cart.find((c) => c.name === h.name)
  if (!entry) { entry = { name: h.name, city: h.city, rooms: [] }; journey.cart.push(entry) }
  if (!entry.rooms) entry.rooms = []
  const existing = entry.rooms.find((r) => r.type === room.type)
  if (existing) {
    room.nights.forEach((n) => {
      const en = existing.nights.find((x) => x.date === n.date)
      if (en) en.qty += n.qty
      else existing.nights.push({ ...n })
    })
  } else {
    entry.rooms.push({ ...room, nights: room.nights.map((n) => ({ ...n })) })
  }
  // DES-84: the hold clock starts the moment the first room is held (no-op on
  // subsequent adds — the block is already being held).
  startHoldTimer()
}

// Group/hold: SET a room type's held quantities to exactly what the card shows
// (DES-416). Unlike addRoomToHold (which sums), this REPLACES the per-night
// quantities so decreases actually reduce the cart. `room.nights` carries the
// staged values (may include 0). Zeroing every night removes the room type — and
// the hotel entry once its last room is gone.
export function setRoomInHold(room) {
  const h = journey.active
  if (!h || !room) return
  const nights = (room.nights || []).filter((n) => n.qty > 0)
  let entry = journey.cart.find((c) => c.name === h.name)
  // Everything zeroed → remove this room type (and the hotel if now empty).
  if (nights.length === 0) {
    if (entry && entry.rooms) {
      entry.rooms = entry.rooms.filter((r) => r.type !== room.type)
      if (entry.rooms.length === 0) journey.cart = journey.cart.filter((c) => c.name !== entry.name)
    }
    if (cartRoomCount() === 0) stopHoldTimer()
    return
  }
  if (!entry) { entry = { name: h.name, city: h.city, rooms: [] }; journey.cart.push(entry) }
  if (!entry.rooms) entry.rooms = []
  const existing = entry.rooms.find((r) => r.type === room.type)
  if (existing) {
    existing.nights = nights.map((n) => ({ ...n }))
    existing.summary = room.summary || existing.summary
    existing.price = room.price ?? existing.price
  } else {
    entry.rooms.push({ ...room, nights: nights.map((n) => ({ ...n })) })
  }
  startHoldTimer()
}

// Group/hold: remove an entire room-type block from a hotel's cart entry — the
// single source of truth. Used by the details card's "Remove all from cart" and
// the cart flyout / checkout delete-room (routed here so every view stays in
// sync). `hotelName` defaults to the hotel currently open on Details.
export function removeRoomFromHold(type, hotelName) {
  const name = hotelName || journey.active?.name
  if (!name) return
  const entry = journey.cart.find((c) => c.name === name)
  if (!entry || !entry.rooms) return
  entry.rooms = entry.rooms.filter((r) => r.type !== type)
  if (entry.rooms.length === 0) journey.cart = journey.cart.filter((c) => c.name !== name)
  if (cartRoomCount() === 0) stopHoldTimer() // nothing held → clear the hold timer
}

// Empty the whole cart (the flyout's "Clear Cart") — the real source of truth,
// so the empty state shows and the details card + badge reset.
export function clearCart() {
  journey.cart = []
  stopHoldTimer()
}

// Total rooms held/booked across the cart (for the app-bar badge).
export function cartRoomCount() {
  if (journey.flow === 'group') {
    return journey.cart.reduce((sum, h) =>
      sum + (h.rooms || []).reduce((s, r) => s + r.nights.reduce((a, n) => a + (n.qty || 0), 0), 0), 0)
  }
  return journey.cart.length
}

// Return to Browse keeping the cart (for "Add another reservation/hotel" / "Edit").
export function backToBrowse() {
  nav('browse')
}

export function goToCheckout() {
  if (journey.cart.length) nav('checkout')
}

export function resetJourney() {
  journey.flow = 'reserve'
  journey.active = null
  journey.cart = []
  stopHoldTimer()
  nav('landing')
}

// ── Deep-link / demo bootstrap ──
// Optional: jump straight to any screen via URL query, e.g.
//   ?screen=checkout&flow=reserve&n=2   → multiple-reservations checkout
//   ?screen=details&flow=group&hotel=Embassy%20Suites%20Downtown&city=Chicago
// Handy for demos and for screenshotting individual screens. No effect without
// a `screen` param, so the normal Landing entry is unchanged.
const SAMPLE = [
  { name: 'The Grand Riverside Hotel', city: 'Overland Park' },
  { name: 'Kimpton Gray Hotel', city: 'Chicago' },
  { name: 'Embassy Suites Downtown', city: 'Aurora' },
]

export function bootstrapFromUrl() {
  const q = new URLSearchParams(window.location.search)
  const screen = q.get('screen')
  // No deep link: the landing screen still needs its title (WCAG 2.4.2).
  if (!screen || !SCREENS.includes(screen)) { applyScreenTitle(); return }
  const flow = q.get('flow')
  if (flow) journey.flow = flow === 'group' ? 'group' : 'reserve'
  const rooms = parseInt(q.get('rooms') || '0', 10)
  journey.roomsNeeded = rooms > 0 ? rooms : null
  const n = parseInt(q.get('n') || '0', 10)
  journey.cart = []
  for (let i = 0; i < n; i++) journey.cart.push({ ...SAMPLE[i % SAMPLE.length] })
  const hotel = q.get('hotel')
  if (hotel) journey.active = { name: hotel, city: q.get('city') || 'Chicago' }
  else journey.active = journey.cart[0] || { ...SAMPLE[0] }
  journey.screen = screen
  applyScreenTitle(screen)
}
