<script setup>
// Stage 4 — Confirmation. The real ConfirmationPage; mode + data are cart-driven
// (reserve / reservations / hold), keyed on the chosen hotels. The success-banner
// CTA ("Book Another Reservation" / "Hold Another Group Block") is intercepted
// globally (App.vue) → reset the journey back to the Landing screen.
import { computed } from 'vue'
import { journey, cartMode, confirmationMode } from '../store.js'
import { confirmationData, LEGAL_LINKS } from '../fixtures.js'
import PageFrame from '@lib/components/PageFrame.vue'
import ConfirmationPage from '@lib/components/confirmation/ConfirmationPage.vue'

const data = computed(() => confirmationData(journey.cart, confirmationMode.value))
</script>

<template>
  <page-frame :legal-links="LEGAL_LINKS" brand="Presto" :cart-mode="cartMode" :show-cart="false">
    <confirmation-page :mode="confirmationMode" :data="data" />
  </page-frame>
</template>
