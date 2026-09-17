<script setup>
// Checkout step 2 — Contact information. Variant-specific:
//   group        → GroupTeamsBlock (teams flow + primary contact)
//   reservation  → ReservationGuests (per-room guest info for a single stay)
//   reservations → ReservationGuests grouped by reservation/hotel (multiple stays)
// Clicking Next while incomplete surfaces required-field errors instead of
// advancing.
import { computed, ref, nextTick } from 'vue'
import ReservationGuests from '../ReservationGuests.vue'
import GroupTeamsBlock from '../GroupTeamsBlock.vue'

const props = defineProps({
  mode: { type: String, default: 'group' }, // group | reservation | reservations
  modelValue: { type: [Object, Array], default: () => ({}) },
  // Reservation: the booking-widget selection (one entry per room) + event-
  // configurable extra fields, passed through to ReservationGuests.
  rooms: { type: Array, default: () => [{ adults: 1, children: 0 }] },
  // Multiple reservations: [{ name, rooms: [{ adults, children }] }] (grouped).
  reservations: { type: Array, default: null },
  teamName: { type: Boolean, default: false },
  customFields: { type: Array, default: () => [] },
  // Group flow: render the teams block widget (off → block w/o team holding).
  showTeams: { type: Boolean, default: true },
  // Expanded layout: hide the per-step "Next" (single submit at the bottom).
  flat: { type: Boolean, default: false },
  // Expanded layout: the page's submit turns every message on at once.
  showErrors: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'next'])

const forceErrors = ref(false)  // set by a failed Next (the prop is set by the page's submit)
const resValid = ref(false)
const valid = computed(() => {
  if (props.mode !== 'group') return resValid.value
  const m = props.modelValue || {}
  const c = m.contact || {}
  // Group Block Name + Organization are mandatory; teams required unless the
  // teams widget is hidden or the organizer isn't holding for a team.
  const teamsOk = !props.showTeams || m.notHolding || (m.teams && m.teams.length)
  const blockOk = (m.groupBlockName || '').trim()
  return !!(c.firstName && c.lastName && c.mobile && c.email && c.organization && blockOk && teamsOk)
})

// WCAG 3.3.1 / 2.4.3 / 4.1.3 — a failed Next used to paint red text down the
// page and nothing else: focus stayed on the button and nothing was announced.
// Now every message is turned on, the invalid controls are read back out of the
// DOM (they carry aria-invalid), and a summary takes focus with a link to each.
const root = ref(null)
const summary = ref(null)
const errors = ref([])

const nameOf = (el) => {
  const byId = el.getAttribute('aria-labelledby')
  const lab = byId ? document.getElementById(byId) : root.value?.querySelector(`label[for="${CSS.escape(el.id)}"]`)
  const text = lab?.textContent || el.getAttribute('aria-label') || 'This field'
  return text.replace(/\s+/g, ' ').replace(/\s*\*\s*/g, ' ').replace(/\(required\)/gi, '').replace(/\s+/g, ' ').trim()
}
// Only the error node (ids end in -err), never the field's static hint.
const messageOf = (el) => (el.getAttribute('aria-describedby') || '')
  .split(' ').filter((id) => id.endsWith('-err')).map((id) => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(' ')

const collect = () => {
  const els = root.value ? root.value.querySelectorAll('[aria-invalid="true"]') : []
  errors.value = [...els].filter((el) => el.id).map((el) => ({ id: el.id, label: nameOf(el), msg: messageOf(el) }))
}
const focusField = (id) => document.getElementById(id)?.focus()

const onNext = async () => {
  if (valid.value) { errors.value = []; emit('next'); return }
  forceErrors.value = true
  await nextTick()
  collect()
  await nextTick()
  summary.value?.focus()
}
</script>

<template>
  <div class="step" ref="root">
    <!-- 3.3.1: the summary is an alert so it is announced, and takes focus so
         keyboard users land on the problem rather than on the button. -->
    <div v-if="errors.length" ref="summary" class="step__errsum" role="alert" tabindex="-1">
      <h3 class="step__errsum-h">There {{ errors.length === 1 ? 'is 1 problem' : `are ${errors.length} problems` }} with the information you entered</h3>
      <ul class="step__errsum-list">
        <li v-for="e in errors" :key="e.id"><a :href="`#${e.id}`" @click.prevent="focusField(e.id)">{{ e.label }}<template v-if="e.msg"> — {{ e.msg }}</template></a></li>
      </ul>
    </div>

    <group-teams-block v-if="mode === 'group'" :model-value="modelValue" :show-teams="showTeams" :show-errors="forceErrors || showErrors" @update:model-value="emit('update:modelValue', $event)" />
    <reservation-guests
      v-else
      :rooms="rooms" :reservations="reservations" :team-name="teamName" :custom-fields="customFields"
      :model-value="Array.isArray(modelValue) ? modelValue : []"
      :show-errors="forceErrors || showErrors"
      @update:model-value="emit('update:modelValue', $event)"
      @update:valid="resValid = $event"
    />
    <q-btn v-if="!flat" unelevated no-caps class="step__next" label="Next" @click="onNext" />
  </div>
</template>

<style scoped>
.step__next { margin-top: 20px; height: 48px; padding: 0 28px; border-radius: var(--ds-radius-md); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 600; }

/* Error summary (3.3.1). Red 800 on the Red 50 tint = 8.6:1. */
.step__errsum { margin-bottom: 20px; padding: 14px 16px; border: 1px solid var(--ds-color-border-danger, var(--ds-palette-red-200, #FECACA)); border-left: 4px solid var(--ds-color-text-danger); border-radius: var(--ds-radius-md); background: var(--ds-palette-red-50); color: var(--ds-color-text-danger-on-tint); }
.step__errsum-h { margin: 0 0 8px; font-size: 0.9375rem; font-weight: 700; }
.step__errsum-list { margin: 0; padding-left: 20px; font-size: 0.875rem; line-height: 1.6; }
.step__errsum-list a { color: inherit; text-decoration: underline; }
</style>
