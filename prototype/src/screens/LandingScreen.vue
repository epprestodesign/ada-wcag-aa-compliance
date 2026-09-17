<script setup>
// Stage 0 — the event landing page. Renders the real LandingPage (its own
// GlobalNav + hero + BookingWidget + event info + footer). The widget's "Search"
// button now validates first and publishes a `bw-search` event, which App.vue
// routes into the chosen flow. Event name/dates are conformed to the browse
// header ("Summer Soccer Classic 2027") for coherence.
import { onMounted } from 'vue'
import { EVENT, LEGAL_LINKS } from '../fixtures.js'
import LandingPage from '@lib/components/LandingPage.vue'

// Every other screen goes through PageFrame, which ships the skip link and
// <main id="main-content">. LandingPage doesn't — it renders nav, hero, content
// and footer itself — so this screen is the one with no main landmark and no way
// to skip the nav (WCAG 2.4.1 Bypass Blocks, 1.3.1 Info & Relationships).
// Adopting the page's content sections into a <main> here keeps the fix in the
// prototype layer: the nav stays the banner and the footer stays contentinfo,
// with everything between them inside the main landmark. LandingPage's top-level
// children are static (no v-if / v-for), so re-parenting them is safe.
onMounted(() => {
  const lp = document.querySelector('.lp')
  if (!lp || lp.querySelector('#main-content')) return
  const hero = lp.querySelector('.lp__hero')
  const footer = lp.querySelector('.lp__footer')
  if (!hero) return
  const main = document.createElement('main')
  main.id = 'main-content'
  main.setAttribute('tabindex', '-1') // so the skip link can move focus here
  lp.insertBefore(main, hero)
  let node = main.nextSibling
  while (node && node !== footer) {
    const next = node.nextSibling
    main.appendChild(node)
    node = next
  }
})
</script>

<template>
  <!-- First tab stop on the page, ahead of the global nav. -->
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <landing-page
    mode="reservations"
    brand="Presto"
    :event-name="EVENT.name"
    :event-dates="EVENT.dates"
    :show-teams="false"
    :legal-links="LEGAL_LINKS"
  />
</template>
