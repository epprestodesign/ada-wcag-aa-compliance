<script setup>
// Stage 1 — Browse Hotels. Renders the REAL library HotelListPage (the same
// responsive page shown in Storybook) so mobile styling stays in one place.
// Card name/CTA clicks → that hotel's Details page (intercepted in App.vue).
import { computed } from 'vue'
import { journey, holdTimer, cartMode, cartVisible, checkoutMode } from '../store.js'
import { cartFor, LEGAL_LINKS } from '../fixtures.js'
import PageFrame from '@lib/components/PageFrame.vue'
import HoldTimerBanner from '@lib/components/HoldTimerBanner.vue'
import HotelListPage from '@lib/components/browse/HotelListPage.vue'

const isGroup = computed(() => journey.flow === 'group')
const navCart = computed(() => (journey.cart.length ? cartFor(journey.cart, checkoutMode.value) : {}))
</script>

<template>
  <page-frame :legal-links="LEGAL_LINKS" brand="Presto" :cart-mode="cartMode" :show-cart="cartVisible" :cart="navCart">
    <hold-timer-banner v-if="holdTimer.active" :seconds="holdTimer.remaining" />
    <hotel-list-page :flow="isGroup ? 'group' : 'reserve'" :show-teams="false" />
  </page-frame>
</template>
