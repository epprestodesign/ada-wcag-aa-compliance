<script setup>
// Checkout step 3 — Add a payment method. Inline Payment Method form (card +
// billing information). Credit card only; no dialogs.
import { ref, nextTick } from 'vue'
import PaymentForm from '../PaymentForm.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  // Optional reassurance line above the card fields (hidden by default).
  reassurance: { type: String, default: '' },
  // Expanded layout: hide the per-step "Next" (single submit at the bottom).
  flat: { type: Boolean, default: false },
  // Expanded layout: the page's submit turns every message on at once.
  showErrors: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'next'])

// WCAG 3.3.1 / 2.4.3 / 4.1.3 — this step did not validate AT ALL: Next advanced
// past an empty card form in silence. It now blocks, shows every message, and
// hands focus to a summary that links to each invalid control.
const form = ref(null)
const root = ref(null)
const summary = ref(null)
const forceErrors = ref(false)
const errors = ref([])

const nameOf = (el) => {
  const byId = el.getAttribute('aria-labelledby')
  const lab = byId ? document.getElementById(byId) : root.value?.querySelector(`label[for="${CSS.escape(el.id)}"]`)
  const text = lab?.textContent || el.getAttribute('aria-label') || 'This field'
  return text.replace(/\s+/g, ' ').replace(/\s*\*\s*/g, ' ').replace(/\(required\)/gi, '').replace(/\s+/g, ' ').trim()
}
const collect = () => {
  const els = root.value ? root.value.querySelectorAll('[aria-invalid="true"]') : []
  errors.value = [...els].filter((el) => el.id).map((el) => ({ id: el.id, label: nameOf(el) }))
}
const focusField = (id) => document.getElementById(id)?.focus()

const onNext = async () => {
  if (form.value?.validate()) { errors.value = []; emit('next'); return }
  forceErrors.value = true
  form.value?.touchAll()
  await nextTick()
  collect()
  await nextTick()
  summary.value?.focus()
}
</script>

<template>
  <div class="step" ref="root">
    <div v-if="errors.length" ref="summary" class="step__errsum" role="alert" tabindex="-1">
      <h3 class="step__errsum-h">There {{ errors.length === 1 ? 'is 1 problem' : `are ${errors.length} problems` }} with your payment details</h3>
      <ul class="step__errsum-list">
        <li v-for="e in errors" :key="e.id"><a :href="`#${e.id}`" @click.prevent="focusField(e.id)">{{ e.label }} — Required</a></li>
      </ul>
    </div>

    <payment-form ref="form" :model-value="modelValue" :reassurance="reassurance" :show-errors="forceErrors || showErrors" @update:model-value="emit('update:modelValue', $event)" />
    <q-btn v-if="!flat" unelevated no-caps class="step__next" label="Next" @click="onNext" />
  </div>
</template>

<style scoped>
.step__next { margin-top: 20px; height: 48px; padding: 0 28px; border-radius: var(--ds-radius-md); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 600; }

/* Error summary (3.3.1). Red 800 on the Red 50 tint = 8.6:1. */
.step__errsum { margin-bottom: 20px; padding: 14px 16px; border: 1px solid var(--ds-palette-red-200, #FECACA); border-left: 4px solid var(--ds-color-text-danger); border-radius: var(--ds-radius-md); background: var(--ds-palette-red-50); color: var(--ds-color-text-danger-on-tint); }
.step__errsum-h { margin: 0 0 8px; font-size: 0.9375rem; font-weight: 700; }
.step__errsum-list { margin: 0; padding-left: 20px; font-size: 0.875rem; line-height: 1.6; }
.step__errsum-list a { color: inherit; text-decoration: underline; }
</style>
