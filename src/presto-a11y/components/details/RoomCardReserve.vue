<script setup>
// RoomCardReserve — "Book Reservations" vertical room card for the Hotel Details
// "Select Your Room" section. Header (room type, bed config, occupancy) + a
// per-night rooms-left list + price (per room/night, stay total) + a "Price
// Details" link and "Reserve Room" CTA. No room-type image or amenities list.
// Availability: available | limited | soldout. When a room is sold out (at least
// one night in the range unavailable), the footer shows an "Unavailable" state.
import { computed, ref } from 'vue'

const props = defineProps({
  roomType: { type: String, default: 'Room' },
  bedConfig: { type: String, default: '' },
  maxOccupancy: { type: Number, default: null },
  features: { type: Array, default: () => [] },   // accepted but not rendered
  nights: { type: Array, default: () => [] },      // [{ date, roomsLeft }]
  currency: { type: String, default: '$' },
  pricePerNight: { type: Number, default: null },  // "$X USD / room / night"
  total: { type: Number, default: null },          // stay total
  roomCount: { type: Number, default: 1 },
  availability: { type: String, default: 'available' }, // available | limited | soldout
  // Image props accepted for compatibility; room-type images are not shown.
  image: { type: String, default: '' },
  imageCategories: { type: Array, default: () => [] },
  seed: { type: Number, default: 0 },
  // Sold-out rooms offer a waitlist instead of a dead end (ds-impact "No
  // waitlist state for sold-out rooms"). Hosts that have no waitlist can opt out.
  waitlist: { type: Boolean, default: true },
})
const emit = defineEmits(['reserve', 'price-details', 'waitlist'])

const soldout = computed(() => props.availability === 'soldout')
const joined = ref(false)
const joinWaitlist = () => { joined.value = true; emit('waitlist', props.roomType) }
const money = (n) => props.currency + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const leftLabel = (n) => (n <= 0 ? 'Sold Out' : n <= 3 ? `Only ${n} left` : `${n} rooms left`)
const leftClass = (n) => (n <= 0 ? 'is-sold' : n <= 3 ? 'is-limited' : 'is-ok')
</script>

<template>
  <div class="rcr">
    <!-- HEAD -->
    <div class="rcr__head">
      <h3 class="rcr__title">{{ roomType }}</h3>
      <div v-if="bedConfig" class="rcr__bed">{{ bedConfig }}</div>
      <div v-if="maxOccupancy != null" class="rcr__occ"><q-icon name="bed" size="18px" /> <span>Max Occupancy: {{ maxOccupancy }}</span></div>
    </div>

    <!-- NIGHTS — WCAG 1.3.1: a description list, so each date is programmatically
         paired with its availability (was two bare spans in a div, which left the
         relationship visual only). -->
    <div v-if="nights.length" class="rcr__sec">
      <h4 class="rcr__h">Nights</h4>
      <dl class="rcr__nights">
        <div v-for="n in nights" :key="n.date" class="rcr__night">
          <dt class="rcr__date">{{ n.date }}</dt>
          <dd class="rcr__left" :class="leftClass(n.roomsLeft)">{{ leftLabel(n.roomsLeft) }}</dd>
        </div>
      </dl>
    </div>

    <!-- FOOT — price + CTA, or the Unavailable state when sold out -->
    <div class="rcr__foot">
      <template v-if="!soldout">
        <div v-if="pricePerNight != null" class="rcr__per">{{ money(pricePerNight) }} USD / room / night</div>
        <div v-if="total != null" class="rcr__total">{{ money(total) }} USD total</div>
        <div class="rcr__sub">{{ roomCount }} room{{ roomCount === 1 ? '' : 's' }} · incl. taxes &amp; fees</div>
        <!-- WCAG 1.3.1 / 4.1.2 — the chevron was a literal "›" inside the button
             text, which screen readers may read as "right-pointing angle
             quotation mark". It's a decorative icon now. WCAG 2.4.6 — several
             identical "Price Details" / "Reserve Room" buttons sit on one page,
             so each name is qualified with its room type off-screen. -->
        <div class="rcr__actions">
          <button type="button" class="rcr__pricelink" @click="emit('price-details')">
            Price Details<span class="sr-only"> for {{ roomType }}</span><q-icon name="chevron_right" size="18px" aria-hidden="true" />
          </button>
          <button type="button" class="rcr__cta" @click="emit('reserve')">Reserve Room<span class="sr-only"> — {{ roomType }}</span></button>
        </div>
      </template>
      <template v-else>
        <!-- Sold out. The old state was a focusable-looking disabled button and
             nothing else to do. WCAG 2.1.1 / 4.1.2 / 2.4.6 — "Unavailable" is now
             plain status text and the action is a native button whose name names
             the room; joining is confirmed in a polite live region. -->
        <p class="rcr__unavail">Unavailable</p>
        <p class="rcr__soldnote"><q-icon name="error" size="18px" aria-hidden="true" /> <span>At least one night in your selected range is sold out at this property</span></p>
        <button v-if="waitlist" type="button" class="rcr__waitlist" :disabled="joined" @click="joinWaitlist">
          {{ joined ? 'On the waitlist' : 'Join waitlist' }}<span class="sr-only"> for {{ roomType }}</span>
        </button>
        <p class="sr-only" aria-live="polite">{{ joined ? `Added to the waitlist for ${roomType}` : '' }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Fluid: fills its column (and shrinks to fit a 360px phone) but caps standalone.
   Inside RoomsCarousel the width/cap is overridden so grid cells fill fully. */
.rcr { display: flex; flex-direction: column; width: 100%; max-width: 400px; background: var(--ds-color-surface); border: 1px solid rgba(0,0,0,0.04); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.06); }

/* Head grows to fill, pushing the Nights + footer to a consistent baseline so
   they align across equal-height cards in the grid. */
.rcr__head { flex: 1; padding: 20px 22px 16px; display: flex; flex-direction: column; gap: 8px; }
.rcr__title { margin: 0; font-size: 1.375rem; font-weight: 700; color: var(--ds-color-text-brand); line-height: 1.2; }
.rcr__bed { color: var(--ds-color-text-subtle); font-size: 1rem; }
.rcr__occ { display: inline-flex; align-items: center; gap: 8px; color: var(--ds-color-text); font-size: 1rem; }
.rcr__occ .q-icon { color: var(--ds-color-text-brand); }

.rcr__sec { padding: 14px 22px; border-top: 1px solid var(--ds-color-border); }
.rcr__h { margin: 0 0 10px; font-size: 1.0625rem; font-weight: 700; color: var(--ds-color-text-brand); }
/* The night list is a <dl>; dt/dd keep the old one-line date / rooms-left row. */
.rcr__nights { margin: 0; }
.rcr__night { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 0; }
.rcr__date { color: var(--ds-color-text-brand); font-weight: 700; font-size: 1rem; }
.rcr__left { margin: 0; font-weight: 700; font-size: 1rem; white-space: nowrap; }
.rcr__left.is-ok { color: var(--ds-color-text-success); }
/* WCAG 1.4.3 — Orange 600 was 3.56:1 at 16px/700 (not large text). The semantic
   warning-strong token keeps the orange hue at 5.18:1. */
.rcr__left.is-limited { color: var(--ds-color-text-warning-strong); }
.rcr__left.is-sold { color: var(--ds-color-text-danger); }

.rcr__foot { padding: 16px 22px 20px; border-top: 1px solid var(--ds-color-border); }
.rcr__per { color: var(--ds-color-text-subtle); font-size: 1rem; }
.rcr__total { color: var(--ds-color-text-brand); font-size: 1.5rem; font-weight: 700; line-height: 1.1; margin-top: 2px; }
/* WCAG 1.4.3 — this is a real sentence, not decoration, so it takes the body
   "subtle" role rather than the subtlest step. */
.rcr__sub { color: var(--ds-color-text-subtle); font-size: 0.8125rem; margin-top: 4px; }
.rcr__actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; }
.rcr__pricelink { display: inline-flex; align-items: center; background: none; border: 0; padding: 0; color: var(--ds-color-link); font-family: inherit; font-size: 1rem; font-weight: 600; cursor: pointer; }
/* The chevron replaces the old "›" glyph in the label — same mark, no name. */
.rcr__pricelink .q-icon { margin-left: 2px; }
.rcr__pricelink:hover { text-decoration: underline; }
.rcr__cta { height: 46px; padding: 0 22px; border: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-brand-bold); color: #fff; font-family: inherit; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.rcr__cta:hover:not(:disabled) { background: var(--ds-palette-navy-800); }

/* Sold-out / unavailable state. The block keeps its look but is status text now
   (it was a disabled button that did nothing). */
.rcr__unavail { display: flex; align-items: center; justify-content: center; width: 100%; height: 48px; margin: 0; border-radius: var(--ds-radius-button); background: var(--ds-color-background-danger-bold); color: #fff; font-size: 1rem; font-weight: 700; }
/* Waitlist — the action a sold-out room now offers. */
.rcr__waitlist { width: 100%; height: 46px; margin-top: 12px; border: 1px solid var(--ds-color-background-brand-bold); border-radius: var(--ds-radius-button); background: transparent; color: var(--ds-color-text-brand); font-family: inherit; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.rcr__waitlist:hover:not(:disabled) { background: var(--ds-palette-slate-100); }
.rcr__waitlist:disabled { border-color: var(--ds-color-border); color: var(--ds-color-text-subtle); cursor: default; }
.rcr__soldnote { display: flex; align-items: flex-start; gap: 8px; margin: 12px 0 0; color: var(--ds-color-text-danger); font-size: 0.875rem; line-height: 1.4; }
.rcr__soldnote .q-icon { color: var(--ds-color-text-danger); flex: none; margin-top: 1px; }
</style>
