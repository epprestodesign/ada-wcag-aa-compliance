<script setup>
// SearchRadiusField — title + slider (0–25) + read-only "Any / miles" input +
// apply button. `v-model` is the radius number.
import { ref, computed, watch, useId } from 'vue'

const props = defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue'])

// A11y (4.1.2 Name, Role, Value): the slider and the read-only mirror input had
// no accessible name at all — axe flagged aria-input-field-name on .q-slider.
// The visible section title becomes the slider's name via aria-labelledby, so
// the spoken name matches what a sighted user reads (2.5.3 Label in Name).
const titleId = useId()

// DES-457: the slider is staged locally and only committed to the parent (which
// filters results and drives the map) when "Apply Radius Filter" is pressed.
const draft = ref(props.modelValue)
watch(() => props.modelValue, (v) => { draft.value = v })
const radius = computed({
  get: () => draft.value,
  set: (v) => { draft.value = v },
})
const radiusLabel = computed(() => (radius.value ? radius.value : ''))
// 4.1.2: the raw number ("3.25") says nothing on its own — aria-valuetext gives
// the value its unit, and names the 0 end of the scale the way the input does.
const radiusValueText = computed(() => (radius.value ? `${radius.value} miles` : 'Any distance'))
const applied = computed(() => draft.value === props.modelValue)
const apply = () => emit('update:modelValue', draft.value)
</script>

<template>
  <div>
    <h2 :id="titleId" class="fr__title">Search Radius</h2>
    <q-slider
      v-model="radius"
      :min="0"
      :max="25"
      :step="0.25"
      color="primary"
      class="fr__slider"
      :aria-labelledby="titleId"
      :aria-valuetext="radiusValueText"
    />
    <div class="fr__radius-row">
      <q-input v-model="radiusLabel" outlined dense readonly placeholder="Any" class="fr__radius-input" aria-label="Search radius in miles" />
      <span class="fr__radius-unit">miles</span>
    </div>
    <button type="button" class="fr__apply" :class="{ 'fr__apply--done': applied }" @click="apply">Apply Radius Filter</button>
  </div>
</template>

<style scoped>
.fr__title {
  margin: 0 0 2px;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ds-color-text-brand);
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

/* Radius */
.fr__slider { margin: 4px 4px 12px; }
.fr__radius-row { display: flex; align-items: center; gap: 8px; }
.fr__radius-input { flex: 1; }
.fr__radius-unit { color: var(--ds-color-text-subtle); font-size: 0.9375rem; }
</style>
