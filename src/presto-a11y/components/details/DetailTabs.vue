<script setup>
// DetailTabs — the section navigation bar for the hotel detail screen
// (Overview / Rooms / Property / Amenities / Policies). Controlled via
// v-model; each entry scrolls to its section anchor on the full page.
//
// WCAG 1.3.1 / 4.1.2 / 2.1.1 — this used to be role="tablist" on the <nav>
// (which destroyed the navigation landmark) with aria-selected but no
// aria-controls, no tabpanels and no arrow-key roving, while the control
// actually moved the user to in-page anchors. Per ENG-2925/ENG-2926 it is now
// what it always was: in-page navigation — a named <nav> of real links with
// aria-current on the section in view. No tab roles, so nothing promises panels
// or arrow keys that don't exist.
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  tabs: {
    type: Array,
    default: () => [
      { name: 'overview', label: 'Overview' },
      { name: 'rooms', label: 'Rooms' },
      { name: 'property', label: 'Property' },
      { name: 'amenities', label: 'Amenities' },
      { name: 'policies', label: 'Policies' },
    ],
  },
  // Accessible name for the landmark — several navs can coexist on a page.
  ariaLabel: { type: String, default: 'Hotel sections' },
  // Anchor ids are `${idPrefix}${tab.name}`; a tab may also carry its own
  // `href`/`id`. HotelDetailPage renders its sections as #hdp-rooms, #hdp-…
  idPrefix: { type: String, default: 'hdp-' },
})
const emit = defineEmits(['update:modelValue', 'select'])

const active = computed(() => props.modelValue || props.tabs[0]?.name)
const hrefFor = (t) => t.href || `#${t.id || props.idPrefix + t.name}`
// The host owns the scroll (smooth, sticky-header aware), so the link's default
// jump is suppressed — `select` still carries the section, exactly as before.
const select = (name) => { emit('update:modelValue', name); emit('select', name) }
</script>

<template>
  <nav class="dtabs" :aria-label="ariaLabel">
    <a
      v-for="t in tabs"
      :key="t.name"
      class="dtabs__tab"
      :class="{ 'is-active': t.name === active }"
      :href="hrefFor(t)"
      :aria-current="t.name === active ? 'true' : null"
      @click.prevent="select(t.name)"
    >{{ t.label }}</a>
  </nav>
</template>

<style scoped>
.dtabs { display: flex; gap: 6px; border-bottom: 1px solid var(--ds-color-border); overflow-x: auto; }
/* Links styled as the old tab buttons — same metrics, no underline. */
.dtabs__tab { display: inline-block; padding: 12px 16px; cursor: pointer; font-family: inherit; font-size: 0.9375rem; font-weight: 500; color: var(--ds-color-text-subtle); background: none; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; text-decoration: none; transition: color var(--ds-duration-fast) var(--ds-ease-standard); }
.dtabs__tab:hover { color: var(--ds-color-text); }
/* is-active mirrors aria-current so the state isn't color-only: the current
   section keeps the 2px underline and bolder weight. */
.dtabs__tab.is-active { color: var(--ds-color-text); border-color: var(--ds-palette-slate-900); font-weight: 600; }
</style>
