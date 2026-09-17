<script setup>
// BudgetField — title + Per Night / Total Stay segmented toggle + "$ Max" input +
// apply button. `v-model` is an object `{ basis, max }` where basis is
// 'night' | 'total' and max is the entered amount string.
import { ref, computed, watch, useId } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ basis: 'night', max: '' }) },
})
const emit = defineEmits(['update:modelValue'])

// A11y (4.1.2 / 1.3.1): the two basis buttons showed which one was chosen with a
// CSS class only, and the amount field was named by its placeholder alone. The
// pair is now a named role="group" whose buttons carry aria-pressed, and the
// input gets a real name that tracks the selected basis (3.3.2).
const titleId = useId()

// DES-457: basis + max are staged locally and only committed to the parent
// (which filters results) when "Apply Budget Filter" is pressed.
const draft = ref({ ...props.modelValue })
watch(() => props.modelValue, (v) => { draft.value = { ...v } })
const budgetBasis = computed({
  get: () => draft.value.basis,
  set: (v) => { draft.value = { ...draft.value, basis: v } },
})
const budgetMax = computed({
  get: () => draft.value.max,
  set: (v) => { draft.value = { ...draft.value, max: v } },
})
const maxLabel = computed(() => (budgetBasis.value === 'night' ? 'Max per night' : 'Max total'))
const applied = computed(() => draft.value.basis === props.modelValue.basis && draft.value.max === props.modelValue.max)
const apply = () => emit('update:modelValue', { ...draft.value })
</script>

<template>
  <div>
    <h2 :id="titleId" class="fr__title">Your Budget</h2>
    <div class="fr__seg" role="group" aria-label="Budget basis">
      <button type="button" :class="['fr__seg-btn', { 'is-on': budgetBasis === 'night' }]" :aria-pressed="budgetBasis === 'night'" @click="budgetBasis = 'night'">Per Night</button>
      <button type="button" :class="['fr__seg-btn', { 'is-on': budgetBasis === 'total' }]" :aria-pressed="budgetBasis === 'total'" @click="budgetBasis = 'total'">Total Stay</button>
    </div>
    <q-input v-model="budgetMax" outlined dense :placeholder="maxLabel" :aria-label="maxLabel" prefix="$" class="fr__budget" @keyup.enter="apply" />
    <button type="button" class="fr__apply" :class="{ 'fr__apply--done': applied }" @click="apply">Apply Budget Filter</button>
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

/* Budget segmented control */
.fr__seg { display: flex; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); overflow: hidden; margin-bottom: 12px; }
.fr__seg-btn { flex: 1; height: 40px; border: 0; background: transparent; cursor: pointer; font-weight: 700; font-size: 0.875rem; color: var(--ds-color-text-subtle); }
.fr__seg-btn.is-on { background: var(--ds-color-background-brand-bold); color: #fff; }
</style>
