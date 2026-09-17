<script setup>
// DsSectionHeader — title + optional subtitle + actions slot. No Quasar equivalent.
defineProps({
  title: { type: String, required: true },
  // WCAG 1.3.1 / 2.4.6: the title used to render as <div class="text-h6">, so
  // every section built on this component (Policies, Amenities, price
  // breakdowns) was invisible to heading navigation. `level` renders a real
  // heading and keeps the type scale in CSS; 2 matches where these sections sit
  // under a page <h1>. Pass 3/4 when nesting deeper.
  level: { type: Number, default: 2, validator: (v) => v >= 1 && v <= 6 },
  subtitle: { type: String, default: '' },
})
</script>
<template>
  <div class="ds-section-header row items-center q-mb-md">
    <div class="col">
      <component :is="`h${level}`" class="ds-section-header__title text-h6">{{ title }}</component>
      <!-- WCAG 1.4.3: Quasar's text-grey-7 (#757575) is only 4.38:1 on the page
           canvas. The subtle token (Slate 600) holds 7.20:1 there. -->
      <div v-if="subtitle" class="ds-section-header__sub text-body2">{{ subtitle }}</div>
    </div>
    <div class="col-auto"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
/* The heading is a real h1–h6 now, so reset the UA margins the type scale
   never had to fight when this was a <div>. */
.ds-section-header__title { margin: 0; }
.ds-section-header__sub { color: var(--ds-color-text-subtle); }
</style>
