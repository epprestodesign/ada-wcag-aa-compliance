<script setup>
// ContactGroupForm — the reservation contact step. Contact only: name pair,
// email on its own line, and a phone field with a country-code dropdown.
// Required-field + email-format errors show on blur or when showErrors is set.
import { reactive, computed, watch, useId } from 'vue'
import PhoneField from './PhoneField.vue'

const props = defineProps({
  mode: { type: String, default: 'reservation' },
  modelValue: { type: Object, default: () => ({}) },
  showErrors: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const form = reactive({ firstName: '', lastName: '', email: '', phone: '', ...props.modelValue })
watch(form, () => emit('update:modelValue', { ...form }), { deep: true })

const touched = reactive({})
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
const show = (f) => props.showErrors || touched[f]
const err = (f) => {
  if (!show(f)) return ''
  if (!form[f]) return 'Required'
  if (f === 'email' && !emailOk.value) return 'Enter a valid email'
  return ''
}

// WCAG 1.3.1 / 3.3.2 / 4.1.2 — the shared field convention: an explicit
// <label for>, an error node with a stable id, and aria-invalid +
// aria-describedby on the control itself (never on the wrapper).
const uid = useId()
const fid = (f) => `${uid}-${f}`
const eid = (f) => `${uid}-${f}-err`
const inv = (f) => (err(f) ? 'true' : undefined)
const dsc = (f) => (err(f) ? eid(f) : undefined)
</script>

<template>
  <div class="cgf">
    <h3 class="cgf__h">Contact information</h3>
    <div class="cgf__grid">
      <div class="cgf__field">
        <label class="cgf__label" :for="fid('firstName')">First name <i class="cgf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
        <input :id="fid('firstName')" v-model="form.firstName" autocomplete="given-name" required :aria-invalid="inv('firstName')" :aria-describedby="dsc('firstName')" placeholder="First name" :class="{ 'is-error': err('firstName') }" @blur="touched.firstName = true" />
        <small v-if="err('firstName')" :id="eid('firstName')" class="cgf__err">{{ err('firstName') }}</small>
      </div>
      <div class="cgf__field">
        <label class="cgf__label" :for="fid('lastName')">Last name <i class="cgf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
        <input :id="fid('lastName')" v-model="form.lastName" autocomplete="family-name" required :aria-invalid="inv('lastName')" :aria-describedby="dsc('lastName')" placeholder="Last name" :class="{ 'is-error': err('lastName') }" @blur="touched.lastName = true" />
        <small v-if="err('lastName')" :id="eid('lastName')" class="cgf__err">{{ err('lastName') }}</small>
      </div>
      <div class="cgf__field cgf__field--full">
        <label class="cgf__label" :for="fid('email')">Email <i class="cgf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
        <input :id="fid('email')" v-model="form.email" type="email" autocomplete="email" required :aria-invalid="inv('email')" :aria-describedby="dsc('email')" placeholder="youraccount@eventpipe.com" :class="{ 'is-error': err('email') }" @blur="touched.email = true" />
        <small v-if="err('email')" :id="eid('email')" class="cgf__err">{{ err('email') }}</small>
      </div>

      <div class="cgf__field cgf__field--full">
        <span :id="fid('phone-label')" class="cgf__label">Phone number <i class="cgf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></span>
        <phone-field v-model="form.phone" :id="fid('phone')" :labelledby="fid('phone-label')" :describedby="err('phone') ? eid('phone') : ''" required :error="!!err('phone')" @blur="touched.phone = true" />
        <small v-if="err('phone')" :id="eid('phone')" class="cgf__err">{{ err('phone') }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cgf__h { font-size: 1rem; font-weight: 700; color: var(--ds-color-text); margin: 0 0 12px; }
.cgf__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 560px) { .cgf__grid { grid-template-columns: 1fr; } }
.cgf__field { display: flex; flex-direction: column; gap: 6px; }
.cgf__field--full { grid-column: 1 / -1; }
/* Labels are explicit <label for> / labelling spans now — same type. */
.cgf__field > label, .cgf__field > span, .cgf__label { font-size: 0.8125rem; font-weight: 600; color: var(--ds-color-text); }
.cgf__req { color: var(--ds-color-text-danger); font-style: normal; }
.cgf__field > input { height: 46px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md); padding: 0 14px; font-family: inherit; font-size: 0.9375rem; color: var(--ds-color-text); outline: none; transition: border-color var(--ds-duration-fast) var(--ds-ease-standard); }
.cgf__field > input:focus { border-color: var(--ds-color-border-focused); }
.cgf__field > input::placeholder { color: var(--ds-color-text-subtlest); }
.cgf__field > input.is-error { border-color: var(--ds-color-text-danger); }
.cgf__err { color: var(--ds-color-text-danger); font-size: 0.75rem; font-weight: 500; }
</style>
