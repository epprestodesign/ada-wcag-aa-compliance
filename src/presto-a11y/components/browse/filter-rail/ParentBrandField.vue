<script setup>
// ParentBrandField — title + parent-brand checkboxes + apply button.
// `v-model` is an array of selected brand labels.
import { ref, computed, watch } from 'vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

// DES-457: selections are staged locally and only committed to the parent
// (which filters results) when "Apply Brand Filter" is pressed.
const brandSel = ref([...props.modelValue])
watch(() => props.modelValue, (v) => { brandSel.value = [...v] })
const applied = computed(() => JSON.stringify([...brandSel.value].sort()) === JSON.stringify([...props.modelValue].sort()))
const apply = () => emit('update:modelValue', [...brandSel.value])

const PARENT_BRANDS = ['Marriott International', 'Hilton Worldwide', 'Hyatt Hotels', 'IHG Hotels & Resorts']
</script>

<template>
  <!-- 1.3.1 Info and Relationships: the options belong to "Parent Brand", which
       was only implied by a heading sitting above them. fieldset + legend states
       the grouping programmatically; the legend keeps the title's styling. -->
  <fieldset class="fr__group">
    <legend class="fr__title">Parent Brand</legend>
    <q-checkbox v-for="b in PARENT_BRANDS" :key="b" v-model="brandSel" :val="b" :label="b" color="primary" class="fr__check" />
    <button type="button" class="fr__apply" :class="{ 'fr__apply--done': applied }" @click="apply">Apply Brand Filter</button>
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
