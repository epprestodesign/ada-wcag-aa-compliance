<script setup>
// AmenitiesField — title + amenity checkboxes + more/fewer toggle + apply button.
// `v-model` is an array of selected amenity labels. Amenity catalog comes from
// the shared amenities lib.
import { ref, computed, watch, useId } from 'vue'
import { filterAmenities } from '../../../lib/amenities.js'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

// DES-457: selections are staged locally and only committed to the parent
// (which filters results) when "Apply Amenity Filters" is pressed.
const amenitySel = ref([...props.modelValue])
watch(() => props.modelValue, (v) => { amenitySel.value = [...v] })
const applied = computed(() => JSON.stringify([...amenitySel.value].sort()) === JSON.stringify([...props.modelValue].sort()))
const apply = () => emit('update:modelValue', [...amenitySel.value])

const AMENITIES = filterAmenities().map((a) => a.label)
const amenitiesShown = ref(15)
const visibleAmenities = computed(() => AMENITIES.slice(0, amenitiesShown.value))
const moreCount = computed(() => AMENITIES.length - amenitiesShown.value)
const toggleMore = () => { amenitiesShown.value = moreCount.value > 0 ? AMENITIES.length : 15 }

// 4.1.2: the more/fewer button expands the list it sits under, so say so.
const listId = useId()
</script>

<template>
  <!-- 1.3.1 Info and Relationships: the options belong to "Amenities", which was
       only implied by a heading sitting above them. fieldset + legend states the
       grouping programmatically; the legend keeps the title's styling. -->
  <fieldset class="fr__group">
    <legend class="fr__title">Amenities</legend>
    <div :id="listId">
      <q-checkbox v-for="a in visibleAmenities" :key="a" v-model="amenitySel" :val="a" :label="a" color="primary" class="fr__check" />
    </div>
    <button type="button" class="fr__more" :aria-expanded="moreCount === 0" :aria-controls="listId" @click="toggleMore">
      <q-icon :name="moreCount > 0 ? 'expand_more' : 'expand_less'" size="18px" />
      <span>{{ moreCount > 0 ? `More amenity options` : 'Fewer amenity options' }}</span>
    </button>
    <button type="button" class="fr__apply" :class="{ 'fr__apply--done': applied }" @click="apply">Apply Amenity Filters</button>
  </fieldset>
</template>

<style scoped>
/* fieldset reset — the group is semantic only, the look is unchanged. */
.fr__group { border: 0; padding: 0; margin: 0; min-width: 0; }
.fr__title {
  margin: 0 0 2px;
  padding: 0;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ds-color-text-brand);
}

/* Checkboxes — 2.5.8 Target Size (Minimum): the rail used Quasar's `dense`
   checkboxes, whose hit area is under 24×24 CSS px. Full-size controls carry
   their own 24px+ target; the negative margin keeps the list's tight rhythm. */
.fr__check { display: flex; margin: -4px 0; }

/* More link */
.fr__more {
  display: flex; align-items: center; gap: 6px; margin: 8px 0 14px; padding: 0;
  border: 0; background: none; cursor: pointer; color: var(--ds-color-text-brand);
  font-weight: 700; font-size: 0.875rem;
}

/* Apply / clear buttons */
.fr__apply {
  width: 100%; height: 44px; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 0; border-radius: var(--ds-radius-button); cursor: pointer;
  background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem;
}
.fr__apply:hover { background: var(--ds-palette-navy-800, #0a1f4d); }
/* Muted once applied (no pending changes); solid navy invites you to apply. */
.fr__apply--done, .fr__apply--done:hover { background: var(--ds-palette-slate-200); color: var(--ds-color-text-subtle); }
</style>
