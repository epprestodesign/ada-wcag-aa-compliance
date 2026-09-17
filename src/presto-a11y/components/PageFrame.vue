<script setup>
// PageFrame — the app shell for full-page compositions: the Global Nav header,
// a content slot, and the shared footer. Used to render each journey step
// (Browse, Hotel Details, Checkout, Confirmation) as a fully-flushed-out page,
// consistent with the Landing Page. `cartMode` is 'reserve' (Book Reservation),
// 'hold' (Group Block), or 'reservations' (Multiple Reservations). The cart
// button only appears for the Group Block (hold) flow — see GlobalNav showCart.
import GlobalNav from './GlobalNav.vue'
import epLogo from '../assets/eventpipe logos/eventpipe-logo.svg'

const props = defineProps({
  brand: { type: String, default: 'Presto' },
  cartMode: { type: String, default: 'reserve' }, // 'reserve' | 'hold' | 'reservations'
  cart: { type: Object, default: () => ({}) },
  // 'auto' → cart shows only for the Group Block (hold) flow; true/false forces it.
  showCart: { type: [Boolean, String], default: 'auto' },
  // Minimal nav — just the centered brand (e.g. checkout).
  minimalNav: { type: Boolean, default: false },
  // WCAG 2.4.4: Terms · Privacy · Contact used to be one span of plain text, so
  // there was no privacy link to reach by keyboard. Each entry is
  // { label, href, newTab? }; tenants override the hrefs with their own pages.
  legalLinks: {
    type: Array,
    default: () => [
      { label: 'Terms', href: '/terms', newTab: true },
      { label: 'Privacy', href: '/privacy', newTab: true },
      { label: 'Contact', href: '/contact' },
    ],
  },
  copyright: { type: String, default: '© 2026 EventPipe' },
})
</script>

<template>
  <div class="pf">
    <!-- WCAG 2.4.1 Bypass Blocks: first focusable element in the shell, so
         keyboard users can skip the nav on every screen. -->
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <global-nav :brand="brand" :cart-mode="cartMode" :cart="cart" :show-cart="showCart" :minimal="minimalNav" />
    <!-- tabindex="-1" so the skip link can move focus here in every browser. -->
    <main id="main-content" class="pf__body" tabindex="-1"><slot /></main>
    <footer class="pf__footer">
      <div class="pf__footer-inner">
        <img :src="epLogo" alt="EventPipe" class="pf__logo" />
        <p class="pf__legal">
          <span>{{ copyright }}</span>
          <!-- Real anchors, underlined: the link must be distinguishable by more
               than color (1.4.1) and reach 4.5:1 (1.4.3 — the link token is
               Navy 900, 18.24:1). A link that opens a new window says so in
               text, not only with an icon (2.4.4). -->
          <template v-for="l in legalLinks" :key="l.label">
            <span class="pf__legal-sep" aria-hidden="true">·</span>
            <a
              class="pf__legal-link"
              :href="l.href"
              :target="l.newTab ? '_blank' : null"
              :rel="l.newTab ? 'noopener noreferrer' : null"
            >{{ l.label }}<template v-if="l.newTab"><span class="sr-only"> (opens in a new tab)</span><q-icon name="open_in_new" size="13px" class="pf__legal-icon" /></template></a>
          </template>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pf { background: var(--ds-color-surface); color: var(--ds-color-text); min-height: 100%; }
.pf__footer { margin-top: 56px; border-top: 1px solid var(--ds-color-border); background: var(--ds-color-surface); }
.pf__footer-inner {
  max-width: 1180px; margin: 0 auto; padding: 28px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.pf__logo { height: 30px; width: auto; display: block; }
.pf__legal { margin: 0; color: var(--ds-color-text-subtle); font-size: 0.8125rem; }
.pf__legal-sep { margin: 0 6px; }
.pf__legal-link { color: var(--ds-color-link); text-decoration: underline; }
.pf__legal-link:visited { color: var(--ds-color-link-visited); }
.pf__legal-icon { margin-left: 3px; vertical-align: -1px; }
</style>
