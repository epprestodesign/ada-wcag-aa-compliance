<script setup>
// ProfileEditModal — a full-height modal for editing profile details, using the
// DS field styles. `section` selects the form: 'basic' (name / bio / DOB /
// gender / accessibility) or 'contact' (email / phone / emergency / address).
// Edits are made on a local copy and committed via `save`.
import { ref, watch, computed, useId } from 'vue'
import PhoneField from '../checkout/PhoneField.vue'
import DsSidePanel from '../DsSidePanel.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  section: { type: String, default: 'basic' }, // basic | contact
  basic: { type: Object, default: () => ({}) },
  contact: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'save'])

const clone = (o) => JSON.parse(JSON.stringify(o || {}))
const form = ref({})
// Re-seed the local copy each time the modal opens.
watch(() => props.modelValue, (open) => {
  if (open) form.value = props.section === 'contact' ? clone(props.contact) : clone(props.basic)
}, { immediate: true })

const isContact = computed(() => props.section === 'contact')
const heading = computed(() => (isContact.value ? 'Contact' : 'Basic information'))
const sub = computed(() => (isContact.value
  ? 'Receive account activity alerts and trip updates by sharing this information.'
  : 'Make sure this information matches your travel ID, like your passport or license.'))

const genders = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'x', label: 'Unspecified (X)' },
  { value: 'u', label: 'Undisclosed (U)' },
]
const accessibilityOptions = ['Not provided', 'Wheelchair accessible room', 'Accessible bathroom', 'Service animal', 'Visual aids', 'Hearing aids']

// ds-impact "No id/for pairs and no autocomplete tokens" (ENG-2927/2928/2935/
// 2939/2943 · WCAG 1.3.1, 1.3.5, 3.3.2): every field relied on an implicit
// wrapping label. Ids come from a per-instance key so two open panels can never
// collide, and each control carries its standard autocomplete token.
const uid = useId()
const fid = (key) => `${uid}-${key}`

const close = () => emit('update:modelValue', false)
const onSave = () => { emit('save', { section: props.section, values: clone(form.value) }); close() }
</script>

<template>
  <ds-side-panel
    :model-value="modelValue"
    side="center"
    width="720px"
    :aria-label="heading"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="pe__inner">
      <h2 class="pe__h2">{{ heading }}</h2>
            <p class="pe__sub">{{ sub }}</p>

            <!-- BASIC -->
            <template v-if="!isContact">
              <h3 class="pe__group">Full name</h3>
              <label class="pe__field" :for="fid('firstName')"><span>First name <i aria-hidden="true">*</i><span class="sr-only"> (required)</span></span><input :id="fid('firstName')" v-model="form.firstName" autocomplete="given-name" required aria-required="true" placeholder="First name" /></label>
              <label class="pe__field" :for="fid('middleName')"><span>Middle name</span><input :id="fid('middleName')" v-model="form.middleName" autocomplete="additional-name" placeholder="Middle name" /></label>
              <label class="pe__field" :for="fid('lastName')"><span>Last name <i aria-hidden="true">*</i><span class="sr-only"> (required)</span></span><input :id="fid('lastName')" v-model="form.lastName" autocomplete="family-name" required aria-required="true" placeholder="Last name" /></label>

              <h3 class="pe__group">About you</h3>
              <label class="pe__field" :for="fid('bio')"><span>Bio</span>
                <textarea :id="fid('bio')" v-model="form.bio" rows="3" placeholder="Help future hosts get to know you better. You can share your travel style, hobbies, interests, and more." />
              </label>

              <h3 class="pe__group" :id="fid('dob-h')">Date of birth</h3>
              <!-- The three parts are one field, so they are grouped and named by
                   the heading that introduces them (WCAG 1.3.1). -->
              <div class="pe__dob" role="group" :aria-labelledby="fid('dob-h')">
                <label class="pe__field" :for="fid('dobMonth')"><span>Month</span><input :id="fid('dobMonth')" v-model="form.dobMonth" inputmode="numeric" maxlength="2" autocomplete="bday-month" placeholder="MM" /></label>
                <label class="pe__field" :for="fid('dobDay')"><span>Day</span><input :id="fid('dobDay')" v-model="form.dobDay" inputmode="numeric" maxlength="2" autocomplete="bday-day" placeholder="DD" /></label>
                <label class="pe__field" :for="fid('dobYear')"><span>Year</span><input :id="fid('dobYear')" v-model="form.dobYear" inputmode="numeric" maxlength="4" autocomplete="bday-year" placeholder="YYYY" /></label>
              </div>

              <h3 class="pe__group" :id="fid('gender-h')">Gender</h3>
              <!-- These are buttons, not native radios, so they keep button
                   semantics (Tab + Enter/Space) and expose their selected state
                   with aria-pressed; the group is named by the heading above it
                   (WCAG 1.3.1 / 4.1.2). Claiming role="radio" would promise
                   arrow-key navigation the control does not implement. -->
              <div class="pe__radios" role="group" :aria-labelledby="fid('gender-h')">
                <button v-for="g in genders" :key="g.value" type="button" :aria-pressed="form.gender === g.value" class="pe__radio" :class="{ 'is-on': form.gender === g.value }" @click="form.gender = g.value">
                  <span class="pe__dot" aria-hidden="true"><span v-if="form.gender === g.value" /></span>{{ g.label }}
                </button>
              </div>

              <!-- ds-impact "Accessibility-needs select has no name" (ENG-2943 ·
                   WCAG 1.3.1, 3.3.2, 4.1.2): unlike every other field this select
                   sat in a bare div under a heading and a help paragraph, so it
                   had no accessible name and its help text was not linked. The
                   heading now labels it and the help text describes it. -->
              <h3 class="pe__group" :id="fid('a11y-h')">
                <label :for="fid('accessibility')">Accessibility needs</label>
              </h3>
              <p class="pe__help" :id="fid('a11y-help')">Help us build features that make travel accessible for all by sharing this information.</p>
              <div class="pe__selectwrap">
                <select :id="fid('accessibility')" v-model="form.accessibility" :aria-describedby="fid('a11y-help')"><option v-for="o in accessibilityOptions" :key="o" :value="o">{{ o }}</option></select>
                <q-icon name="expand_more" size="20px" aria-hidden="true" />
              </div>
            </template>

            <!-- CONTACT -->
            <template v-else>
              <label class="pe__field" :for="fid('email')"><span>Email</span><input :id="fid('email')" v-model="form.email" type="email" autocomplete="email" placeholder="youraccount@eventpipe.com" /></label>
              <!-- PhoneField renders its own control, so this wrapper is a group,
                   not a label with nothing to point at (WCAG 1.3.1). -->
              <div class="pe__field" role="group" :aria-labelledby="fid('phone-lbl')"><span :id="fid('phone-lbl')">Phone number</span><phone-field v-model="form.phone" /></div>
              <label class="pe__field" :for="fid('emergency')"><span>Emergency contact</span><input :id="fid('emergency')" v-model="form.emergency" placeholder="Name and phone number" /></label>
              <label class="pe__field" :for="fid('address')"><span>Address</span><input :id="fid('address')" v-model="form.address" autocomplete="street-address" placeholder="Street, city, state, ZIP" /></label>
            </template>
      </div>

    <template #footer>
      <div class="pe__footrow">
        <button class="pe__cancel" @click="close">Cancel</button>
        <button class="pe__save" @click="onSave">Save</button>
      </div>
    </template>
  </ds-side-panel>
</template>

<style scoped>
/* The slide-over shell (scrim, centered sheet, header, footer chrome) is
   provided by DsSidePanel; these styles cover only the profile form content. */
.pe__inner { max-width: 480px; margin: 0 auto; padding: 8px 24px 32px; }
.pe__h2 { margin: 0; font-size: 1.75rem; font-weight: 800; color: var(--ds-color-text); }
.pe__sub { margin: 6px 0 16px; color: var(--ds-color-text-subtle); font-size: 0.9375rem; line-height: 1.4; }
.pe__group { margin: 16px 0 8px; font-size: 0.9375rem; font-weight: 700; color: var(--ds-color-text); }
.pe__help { margin: 0 0 8px; color: var(--ds-color-text-subtle); font-size: 0.875rem; line-height: 1.4; }

.pe__field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.pe__field > span { font-size: 0.8125rem; font-weight: 600; color: var(--ds-color-text); }
.pe__field i { color: var(--ds-color-text-danger); font-style: normal; }
.pe__field input, .pe__field textarea, .pe__selectwrap select {
  width: 100%; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md);
  padding: 0 14px; font-family: inherit; font-size: 0.9375rem; color: var(--ds-color-text);
  outline: none; transition: border-color var(--ds-duration-fast) var(--ds-ease-standard); background: var(--ds-color-surface);
}
.pe__field input { height: 46px; }
.pe__field textarea { padding: 10px 14px; min-height: 76px; resize: vertical; }
.pe__field input:focus, .pe__field textarea:focus, .pe__selectwrap select:focus { border-color: var(--ds-color-border-focused); }
.pe__field input::placeholder, .pe__field textarea::placeholder { color: var(--ds-color-text-subtlest); }

.pe__dob { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

.pe__radios { display: flex; flex-direction: column; gap: 2px; }
.pe__radio { display: flex; align-items: center; gap: 12px; width: 100%; padding: 6px 0; background: none; border: 0; text-align: left; cursor: pointer; font-size: 0.9375rem; color: var(--ds-color-text); }
.pe__dot { width: 22px; height: 22px; flex: none; border: 2px solid var(--ds-color-border-bold); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.pe__radio.is-on .pe__dot { border-color: var(--ds-color-background-brand-bold); }
.pe__dot span { width: 12px; height: 12px; border-radius: 50%; background: var(--ds-color-background-brand-bold); }
.pe__radio:hover .pe__dot { border-color: var(--ds-color-text); }

.pe__selectwrap { position: relative; display: flex; align-items: center; }
.pe__selectwrap select { height: 46px; padding-right: 40px; appearance: none; -webkit-appearance: none; cursor: pointer; }
.pe__selectwrap .q-icon { position: absolute; right: 14px; color: var(--ds-color-text-subtle); pointer-events: none; }

.pe__footrow { display: flex; justify-content: flex-end; gap: 12px; }
.pe__cancel { height: 48px; padding: 0 22px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-pill); background: var(--ds-color-surface); color: var(--ds-color-text); font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.pe__cancel:hover { background: var(--ds-palette-slate-100); }
.pe__save { height: 48px; padding: 0 28px; border: 0; border-radius: var(--ds-radius-pill); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
.pe__save:hover { opacity: 0.92; }

@media (max-width: 520px) { .pe__panel { width: 100vw; } }
</style>
