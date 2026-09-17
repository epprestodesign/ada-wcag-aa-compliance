<script setup>
// QuantityStepper — a compact − / value / + numeric input (v-model).
// When `removable` is set, reaching the floor (`min`) swaps the − for a trash
// can; pressing it sets the value to 0 and emits `remove` so the parent can
// drop the line (e.g. remove an item from a cart).
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
  step: { type: Number, default: 1 },
  removable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // sm | md
  // WCAG 4.1.2: what this stepper counts, lower-case and plural — 'adults',
  // 'rooms', 'nights'. Required in practice: with four steppers on a screen,
  // "Decrease" / "Increase" / "Remove" name every button identically. It also
  // gives the live announcement its subject ("2 adults"). Left optional only so
  // callers that haven't been updated keep today's behavior instead of warning.
  noun: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'remove'])

// At the floor, a removable stepper shows a trash can in place of "−".
const showTrash = computed(() => props.removable && props.modelValue <= props.min)
const canDec = computed(() => !props.disabled && (props.removable ? props.modelValue >= props.min : props.modelValue - props.step >= props.min))
const canInc = computed(() => !props.disabled && props.modelValue + props.step <= props.max)
const iconSize = computed(() => (props.size === 'sm' ? '17px' : '19px'))

// Button names and the spoken value carry the subject when one is given.
const subject = computed(() => (props.noun ? ` ${props.noun}` : ''))
const decLabel = computed(() => (showTrash.value ? `Remove${subject.value}` : `Decrease${subject.value}`))
const incLabel = computed(() => `Increase${subject.value}`)
const valueText = computed(() => `${props.modelValue}${subject.value}`)

const dec = () => {
  if (props.disabled) return
  if (showTrash.value) { emit('update:modelValue', 0); emit('remove'); return }
  if (props.modelValue - props.step >= props.min) emit('update:modelValue', props.modelValue - props.step)
}
const inc = () => {
  if (canInc.value) emit('update:modelValue', props.modelValue + props.step)
}
</script>

<template>
  <div class="qstep" :class="[`qstep--${size}`, { 'qstep--disabled': disabled }]">
    <button
      class="qstep__btn"
      :class="{ 'qstep__btn--trash': showTrash }"
      :disabled="!canDec"
      :aria-label="decLabel"
      @click="dec"
    >
      <q-icon :name="showTrash ? 'delete_outline' : 'remove'" :size="iconSize" />
    </button>
    <!-- The visible number is mirrored by the live region below, so hide it
         here to avoid a doubled announcement (WCAG 4.1.3). -->
    <span class="qstep__val" aria-hidden="true">{{ modelValue }}</span>
    <button class="qstep__btn" :disabled="!canInc" :aria-label="incLabel" @click="inc">
      <q-icon name="add" :size="iconSize" />
    </button>
    <!-- Always mounted: a live region inserted at the same time as its text is
         not reliably announced. -->
    <span class="sr-only" aria-live="polite">{{ valueText }}</span>
  </div>
</template>

<style scoped>
.qstep { display: inline-flex; align-items: center; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); background: var(--ds-color-surface); }
.qstep--disabled { opacity: 0.6; }
.qstep__btn { border: 0; background: transparent; color: var(--ds-color-text-subtlest); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-md); transition: color var(--ds-duration-fast) var(--ds-ease-standard), background var(--ds-duration-fast) var(--ds-ease-standard); }
.qstep__btn:hover:not(:disabled) { color: var(--ds-color-text); background: var(--ds-palette-slate-100); }
.qstep__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qstep__btn--trash:hover:not(:disabled) { color: var(--ds-color-text-danger); background: var(--ds-palette-red-50); }
.qstep__val { text-align: center; font-weight: 700; color: var(--ds-color-text); font-variant-numeric: tabular-nums; }

.qstep--md .qstep__btn { width: 36px; height: 36px; }
.qstep--md .qstep__val { min-width: 36px; font-size: 1rem; }
.qstep--sm .qstep__btn { width: 30px; height: 30px; }
.qstep--sm .qstep__val { min-width: 30px; font-size: 0.9375rem; }
</style>
