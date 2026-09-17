<script setup>
// PropertyNameField — title + search input. `v-model` is a string.
import { computed, useId } from 'vue'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])

// A11y (3.3.2 Labels or Instructions / 4.1.2): the field was named only by its
// placeholder, which disappears as soon as you type. The visible section title
// now names it, and the branch is a `search` landmark so it can be jumped to.
const titleId = useId()

const propertyQuery = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>

<template>
  <div role="search" aria-label="Search by property name">
    <h2 :id="titleId" class="fr__title">Search by Property Name</h2>
    <q-input v-model="propertyQuery" outlined dense placeholder="e.g. Marriott" :aria-labelledby="titleId">
      <template #prepend><q-icon name="search" /></template>
    </q-input>
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
</style>
