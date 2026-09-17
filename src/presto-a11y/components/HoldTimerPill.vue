<script setup>
// HoldTimerPill — a floating "Time left to book" countdown for group-block holds.
// Group rooms are held temporarily the moment the first room is added to the
// cart, so the hold timer must be visible for the rest of the workflow no matter
// where the guest goes (browse → details → checkout). This pill anchors to a
// screen corner and stays put while they navigate.
//
// Controlled by default: the parent owns the countdown (a single shared timer
// that survives screen changes) and passes the remaining `seconds` each tick.
// Pass `running` to let the pill count down from `seconds` on its own — handy
// for a standalone demo.
import { ref, computed, watch, onMounted, onBeforeUnmount, useId } from 'vue'

const props = defineProps({
  seconds: { type: Number, default: 900 },
  label: { type: String, default: 'Time left to book' },
  sub: { type: String, default: 'Rooms are held while the timer runs' },
  // Corner to anchor to: bottom-right | bottom-left | top-right | top-left.
  position: { type: String, default: 'bottom-right' },
  // Threshold (seconds) at or below which the pill turns urgent (amber).
  urgentAt: { type: Number, default: 60 },
  // Self-run the countdown from `seconds` instead of tracking the prop.
  running: { type: Boolean, default: false },
  // WCAG 4.1.3: milestone announcements (10, 5, 2, 1 minutes, expired). Turn
  // this off when the page that mounts the pill already announces the same hold
  // — two polite regions on one countdown talk over each other.
  announce: { type: Boolean, default: true },
  // WCAG 2.2.1: show an "Extend my hold" control once the hold is nearly up.
  // The pill is controlled, so the parent handles @extend (a self-running pill
  // extends itself).
  extendable: { type: Boolean, default: false },
  extendSeconds: { type: Number, default: 900 },
})
const emit = defineEmits(['expire', 'extend'])

const internal = ref(props.seconds)
let tick = null
const secs = computed(() => (props.running ? internal.value : props.seconds))
const clock = computed(() => {
  const s = Math.max(0, secs.value)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})
const urgent = computed(() => secs.value <= props.urgentAt)

// WCAG 4.1.2 / 4.1.3 — the pill used to wrap a per-second clock in
// role="status" aria-live="polite", so it announced the time every single
// second for the whole hold. It is a named role="timer" now (implicitly and
// explicitly aria-live="off"), and only milestones are spoken politely.
const uid = useId()
const labelId = `${uid}-label`
const liveMsg = ref('')
const MILESTONES = [600, 300, 120, 60]
watch(secs, (v, prev) => {
  if (!props.announce || v >= prev) return
  if (MILESTONES.includes(v)) liveMsg.value = `${v / 60} minute${v === 60 ? '' : 's'} left to book.`
  else if (v === 0) liveMsg.value = 'Your hold has expired. Start your search again to rebook.'
})

// 2.2.1: warn (and offer the extension) at 20% of the hold, never later than a
// minute before it lapses.
const startSecs = ref(props.seconds)
const warnAt = computed(() => Math.max(60, Math.round(startSecs.value * 0.2)))
const showExtend = computed(() => props.extendable && secs.value > 0 && secs.value <= warnAt.value)
const extend = () => {
  if (props.running) internal.value += props.extendSeconds
  startSecs.value = secs.value + (props.running ? 0 : props.extendSeconds)
  if (props.announce) liveMsg.value = `Your hold has been extended by ${Math.round(props.extendSeconds / 60)} minutes.`
  emit('extend', props.extendSeconds)
}

// Keep the self-run seed in sync if the parent changes `seconds` while running.
watch(() => props.seconds, (v) => { if (props.running) internal.value = v })
watch(secs, (v, prev) => { if (v <= 0 && prev > 0) emit('expire') })

onMounted(() => {
  if (props.running) {
    tick = setInterval(() => { if (internal.value > 0) internal.value--; else clearInterval(tick) }, 1000)
  }
})
onBeforeUnmount(() => clearInterval(tick))
</script>

<template>
  <div class="htp" :class="[`htp--${position}`, { 'htp--urgent': urgent }]">
    <div class="htp__main" role="timer" aria-live="off" :aria-labelledby="labelId">
      <span class="htp__icon"><q-icon name="timer" size="20px" aria-hidden="true" /></span>
      <span class="htp__body">
        <span :id="labelId" class="htp__label">{{ label }}</span>
        <span v-if="sub" class="htp__sub">{{ sub }}</span>
      </span>
      <span class="htp__clock">{{ clock }}</span>
    </div>
    <!-- 2.2.1: a way to extend the limit, offered before it runs out. -->
    <button v-if="showExtend" type="button" class="htp__extend" :aria-label="`Extend my hold by ${Math.round(extendSeconds / 60)} minutes`" @click="extend">Extend</button>
    <p class="sr-only" role="status">{{ liveMsg }}</p>
  </div>
</template>

<style scoped>
.htp {
  position: fixed;
  z-index: 2000;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-palette-blue-100);
  border: 1px solid var(--ds-palette-blue-200, #BFDBFE);
  color: var(--ds-palette-blue-800);
  box-shadow: var(--ds-shadow-2, 0 10px 30px rgba(2, 16, 63, 0.18));
  animation: htp-in var(--ds-duration-medium, 260ms) var(--ds-ease-standard, ease-out);
}
.htp--bottom-right { right: 24px; bottom: 24px; }
.htp--bottom-left { left: 24px; bottom: 24px; }
.htp--top-right { right: 24px; top: 24px; }
.htp--top-left { left: 24px; top: 24px; }

.htp__main { display: inline-flex; align-items: center; gap: 12px; min-width: 0; }
.htp__icon { display: inline-flex; flex: none; }
.htp__extend { flex: none; border: 1px solid currentColor; border-radius: var(--ds-radius-pill); background: transparent; color: inherit; font-family: inherit; font-weight: 700; font-size: 0.8125rem; padding: 5px 12px; cursor: pointer; }
.htp__body { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
.htp__label { font-weight: 700; font-size: 0.9375rem; }
.htp__sub { font-size: 0.75rem; opacity: 0.85; margin-top: 1px; }
.htp__clock { font-weight: 700; font-variant-numeric: tabular-nums; font-size: 1.125rem; margin-left: 4px; flex: none; }

/* Under a minute — nudge toward urgency. */
.htp--urgent {
  background: var(--ds-color-background-warning, #FEF3C7);
  border-color: var(--ds-palette-amber-200, #FDE68A);
  color: var(--ds-palette-amber-800);
}

@keyframes htp-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Small screens: span the width with a small inset so it never overflows. */
@media (max-width: 520px) {
  .htp { left: 16px; right: 16px; bottom: 16px; }
  .htp--top-right, .htp--top-left { top: 16px; bottom: auto; }
}
</style>
