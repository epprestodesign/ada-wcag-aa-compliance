<script setup>
// Stage 2 — Hotel Details & room selection. The real HotelDetailPage, populated
// from fixtures keyed on the hotel chosen in Browse (name/city carry through).
// `back` is a real event → return to Browse. The room CTA ("Reserve Room" /
// "Add N to Cart") is intercepted globally (App.vue) → add to cart → back to
// Browse (cart-driven accumulation).
import { computed } from 'vue'
import { journey, cartMode, roomsFlow, cartVisible, checkoutMode, nav } from '../store.js'
import { detailProps, cartFor, LEGAL_LINKS } from '../fixtures.js'
import PageFrame from '@lib/components/PageFrame.vue'
import HotelDetailPage from '@lib/components/details/HotelDetailPage.vue'

// Group flow: annotate each room with the per-night counts already held for it
// (reactive to the cart) so the card can show "N in cart" + "Add N more". The
// card's steppers stay for NEW rooms; deleting a block is handled in App.vue.
const detail = computed(() => {
  const d = detailProps(journey.active || { name: 'Hotel', city: '' }, roomsFlow.value)
  if (roomsFlow.value === 'group') {
    const entry = journey.cart.find((c) => c.name === journey.active?.name)
    d.rooms = d.rooms.map((room) => {
      const held = entry?.rooms?.find((r) => r.type === room.roomType)
      return { ...room, inCart: room.nights.map((n) => held?.nights?.find((x) => x.date === n.date)?.qty || 0) }
    })
  }
  return d
})
const navCart = computed(() => (journey.cart.length ? cartFor(journey.cart, checkoutMode.value) : {}))
</script>

<template>
  <page-frame :legal-links="LEGAL_LINKS" brand="Presto" :cart-mode="cartMode" :show-cart="cartVisible" :cart="navCart">
    <hotel-detail-page v-bind="detail" @back="nav('browse')" />
  </page-frame>
</template>
