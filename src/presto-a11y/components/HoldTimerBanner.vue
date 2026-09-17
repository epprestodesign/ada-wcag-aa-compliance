<script setup>
// HoldTimerBanner — the group-block "Time left to book" hold countdown shown as a
// full-width strip appended under the app bar, plus a floating HoldTimerPill that
// appears once the strip scrolls out of view. Shared across the checkout + browse
// screens so an active hold reads consistently wherever the guest is.
//
// Render it as a full-width element directly under the app bar; its inner content
// aligns to the page column via `--col` (falls back to 1040px).
import { ref, computed, watch, onMounted, onBeforeUnmount, useId } from 'vue'
import HoldTimerPill from './HoldTimerPill.vue'

const props = defineProps({
  seconds: { type: Number, default: 900 },
  label: { type: String, default: 'Time left to book' },
  note: { type: String, default: "Book before the timer runs out to secure this rate. If the timer expires, you'll need to run your search again." },
  // WCAG 2.2.1: offer "Extend my hold" as the limit approaches. The countdown
  // is owned by the caller, so the extension is emitted, not applied here.
  extendable: { type: Boolean, default: true },
  extendSeconds: { type: Number, default: 900 },
})
const emit = defineEmits(['extend'])

const clock = computed(() => {
  const s = Math.max(0, props.seconds)
  return `${Math.floor(s / 60)} min : ${String(s % 60).padStart(2, '0')} sec`
})

// WCAG 4.1.2 / 4.1.3 — the strip used to be plain spans: no role, no name, no
// announcement at all, while the pill it mounts announced every second. One
// shared pattern now: a named role="timer" whose clock is aria-live="off", and
// a single polite region that speaks only at milestones (the pill is silenced
// with :announce="false" so the hold is never announced twice).
const uid = useId()
const labelId = `${uid}-label`
const liveMsg = ref('')
const MILESTONES = [600, 300, 120, 60]
const startSecs = ref(props.seconds)
const warnAt = computed(() => Math.max(60, Math.round(startSecs.value * 0.2)))
const showExtend = computed(() => props.extendable && props.seconds > 0 && props.seconds <= warnAt.value)
watch(() => props.seconds, (v, prev) => {
  if (v >= prev) { startSecs.value = Math.max(startSecs.value, v); return }
  if (MILESTONES.includes(v)) liveMsg.value = `${v / 60} minute${v === 60 ? '' : 's'} left to book.`
  else if (v === 0) liveMsg.value = 'Your hold has expired. Start your search again to rebook.'
})
const extend = () => {
  liveMsg.value = `Your hold has been extended by ${Math.round(props.extendSeconds / 60)} minutes.`
  emit('extend', props.extendSeconds)
}

const strip = ref(null)
const showPill = ref(false)
let observer = null
onMounted(() => {
  if (strip.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => { showPill.value = !entry.isIntersecting }, { threshold: 0 })
    observer.observe(strip.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="strip" class="htb">
    <div class="htb__inner">
      <div class="htb__main" role="timer" aria-live="off" :aria-labelledby="labelId">
        <span :id="labelId" class="htb__label"><q-icon name="timer" size="18px" aria-hidden="true" /> {{ label }}</span>
        <span class="htb__clock">{{ clock }}</span>
      </div>
      <p v-if="note" class="htb__note">{{ note }}</p>
      <!-- 2.2.1: the hold can be extended, offered well before it lapses. -->
      <p v-if="showExtend" class="htb__extendrow">
        <button type="button" class="htb__extend" @click="extend">Extend my hold by {{ Math.round(extendSeconds / 60) }} minutes</button>
      </p>
    </div>
  </div>
  <p class="sr-only" role="status">{{ liveMsg }}</p>
  <hold-timer-pill v-if="showPill" :seconds="seconds" position="bottom-right" :announce="false" :extendable="extendable" :extend-seconds="extendSeconds" @extend="extend" />
</template>

<style scoped>
.htb { width: 100%; background: var(--ds-palette-blue-100); border-bottom: 1px solid var(--ds-palette-blue-200, #BFDBFE); color: var(--ds-palette-blue-800); }
.htb__inner { max-width: var(--col, 1040px); margin: 0 auto; padding: 12px 24px; box-sizing: border-box; }
.htb__main { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.htb__label { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; }
.htb__clock { font-weight: 700; font-variant-numeric: tabular-nums; font-size: 1.0625rem; }
.htb__note { margin: 4px 0 0; font-size: 0.875rem; line-height: 1.4; }
.htb__extendrow { margin: 8px 0 0; }
.htb__extend { border: 1px solid currentColor; border-radius: var(--ds-radius-md); background: var(--ds-color-surface); color: var(--ds-palette-blue-800); font-family: inherit; font-weight: 700; font-size: 0.875rem; padding: 7px 14px; cursor: pointer; }
.htb__extend:hover { background: var(--ds-palette-blue-200, #BFDBFE); }
</style>
