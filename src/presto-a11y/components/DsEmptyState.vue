<script setup>
// DsEmptyState — icon + headline + description + action slot. No Quasar equivalent.
defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, default: 'Nothing here yet' },
  // WCAG 1.3.1 / 2.4.6: the title used to be <div class="text-h6">, so a
  // zero-result message sat outside the heading outline. `level` renders a real
  // heading (2 by default, under the page <h1>).
  level: { type: Number, default: 2, validator: (v) => v >= 1 && v <= 6 },
  description: { type: String, default: '' },
  // WCAG 4.1.3: the wrapper is a live region so a filter that empties the
  // results announces the message as well as showing it. Hosts that render the
  // empty state as the whole page (nothing changed, nothing to announce) can
  // pass :announce="false".
  announce: { type: Boolean, default: true },
})
</script>
<template>
  <div
    class="ds-empty-state column flex-center text-center q-pa-xl"
    style="gap:8px"
    :role="announce ? 'status' : null"
  >
    <q-icon :name="icon" size="56px" class="text-grey-5" />
    <component :is="`h${level}`" class="ds-empty-state__title text-h6">{{ title }}</component>
    <!-- WCAG 1.4.3: text-grey-7 (#757575) is 4.38:1 on the page canvas; the
         subtle token (Slate 600) holds 7.20:1 there. -->
    <div v-if="description" class="ds-empty-state__desc text-body2" style="max-width:360px">{{ description }}</div>
    <div class="q-mt-sm"><slot name="action" /></div>
  </div>
</template>

<style scoped>
/* A real heading brings UA margins the old <div> never had. */
.ds-empty-state__title { margin: 0; }
.ds-empty-state__desc { color: var(--ds-color-text-subtle); }
</style>
