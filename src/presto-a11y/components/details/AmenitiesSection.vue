<script setup>
// AmenitiesSection — the categorized amenities block on the hotel detail
// screen. Each group has an icon + heading and a list of items (Internet,
// Dining, Pool, Spa, Fitness, …). Header reuses DsSectionHeader.
import { computed } from 'vue'
import DsSectionHeader from '../DsSectionHeader.vue'
import Amenity from '../Amenity.vue'

const props = defineProps({
  title: { type: String, default: 'Amenities' },
  subtitle: { type: String, default: '' },
  // [{ icon, title, items: [...] }] where each item is either a plain string
  // (rendered as a bullet) or an amenity object { icon, label } (rendered as an
  // Amenity). Catalog groups (amenityGroups()) pass amenity objects.
  groups: { type: Array, default: () => [] },
  columns: { type: Number, default: 2 },
  // WCAG 1.3.1 / 2.4.6 — DsSectionHeader renders its title as a real heading at
  // this level (default h2); each amenity group sits one level below it.
  level: { type: Number, default: 2 },
})
const groupTag = computed(() => `h${Math.min(Math.max(props.level + 1, 2), 6)}`)

const isAmenity = (item) => item && typeof item === 'object'
</script>

<template>
  <section class="amen">
    <ds-section-header :title="title" :subtitle="subtitle" :level="level" />
    <div class="amen__grid" :style="{ '--cols': columns }">
      <div v-for="g in groups" :key="g.title" class="amen__group">
        <component :is="groupTag" class="amen__h"><q-icon :name="g.icon" size="18px" aria-hidden="true" />{{ g.title }}</component>
        <ul class="amen__list" :class="{ 'amen__list--iconed': g.items.some(isAmenity) }">
          <li v-for="(item, i) in g.items" :key="item.key || item.label || item || i">
            <amenity v-if="isAmenity(item)" :amenity="item" size="sm" />
            <template v-else>{{ item }}</template>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.amen { display: flex; flex-direction: column; gap: 16px; }
.amen__grid { display: grid; grid-template-columns: repeat(var(--cols), 1fr); gap: 24px 32px; }
.amen__group { min-width: 0; }
.amen__h { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: 0.95rem; font-weight: 600; color: var(--ds-color-text); }
.amen__h :deep(.q-icon) { color: var(--ds-color-text-subtle); }
.amen__list { margin: 4px 0 0; padding-left: 18px; color: var(--ds-color-text-subtle); font-size: 0.9rem; line-height: 1.7; }
/* When items are amenity objects (icon + label), drop the bullets/indent. */
.amen__list--iconed { list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 8px; }
@media (max-width: 700px) { .amen__grid { grid-template-columns: 1fr; } }
</style>
