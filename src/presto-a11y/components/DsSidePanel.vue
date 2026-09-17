<script setup>
// DsSidePanel — the standard slide-over chrome: a dimmed scrim + a panel that
// slides in from a side, with a header (title + close), scrollable body, and an
// optional footer. Standardizes the cart fly-out, saved-hotels fly-out, and the
// profile edit modal. Controlled via v-model.
//
// Focus behavior (WCAG 2.4.3 / 2.1.2): opening records the trigger and moves
// focus into the panel ([data-autofocus] first, else the panel itself), Tab
// cycles inside it, everything behind the scrim is `inert`, and closing puts
// focus back where it came from — the same contract as DsModal.
import { computed, nextTick, ref, useId, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  side: { type: String, default: 'right' },   // right | left | center (full-height sheet)
  title: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },   // accessible label when there's no visible title
  width: { type: String, default: '500px' },
  persistent: { type: Boolean, default: false }, // clicking the scrim won't close
})
const emit = defineEmits(['update:modelValue'])
const close = () => emit('update:modelValue', false)
const onScrim = () => { if (!props.persistent) close() }

// WCAG 4.1.2: when the panel shows its <h2>, name the dialog with that heading
// rather than a duplicated aria-label that can drift from it.
const titleId = useId()
const labelledBy = computed(() => (props.title ? titleId : undefined))
const ariaLabelComputed = computed(() => (props.title ? undefined : (props.ariaLabel || 'Panel')))

/* ---------------------------------------------- focus management (2.4.3/2.1.2) */
const panel = ref(null)
let opener = null
let inerted = []

// Makes aria-modal="true" true: nothing behind the scrim can be tabbed to.
// Quasar portals (q-menu, q-tooltip) are skipped so controls inside the panel
// keep working.
function setBackgroundInert (on) {
  if (typeof document === 'undefined') return
  if (on) {
    const root = panel.value?.closest('.dsp')
    if (!root) return
    inerted = Array.from(document.body.children).filter(
      (n) => n !== root && !n.contains(root) && !n.inert &&
        n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE' &&
        !String(n.className || '').startsWith('q-')
    )
    inerted.forEach((n) => { n.inert = true })
  } else {
    inerted.forEach((n) => { n.inert = false })
    inerted = []
  }
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable]'
const focusables = () =>
  Array.from(panel.value?.querySelectorAll(FOCUSABLE) || []).filter((el) => el.offsetParent !== null || el === document.activeElement)

// 2.1.2 No Keyboard Trap works both ways: Tab must not walk the page behind.
function onTab (e) {
  if (e.key !== 'Tab' || !panel.value) return
  const items = focusables()
  if (!items.length) { e.preventDefault(); panel.value.focus(); return }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (e.shiftKey && (active === first || active === panel.value || !panel.value.contains(active))) {
    e.preventDefault(); last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault(); first.focus()
  }
}

// Esc to close + lock body scroll while open.
const onKey = (e) => { if (e.key === 'Escape' && !props.persistent) close() }

async function onOpen () {
  if (typeof document === 'undefined') return
  opener = document.activeElement
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKey)
  await nextTick()
  setBackgroundInert(true)
  const target = panel.value?.querySelector('[data-autofocus]') || panel.value
  target?.focus()
}

function onClose () {
  if (typeof document === 'undefined') return
  setBackgroundInert(false)
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
  // 2.4.3 Focus Order: hand focus back to whatever opened the panel.
  if (opener && document.contains(opener)) opener.focus()
  opener = null
}

watch(() => props.modelValue, (open) => { open ? onOpen() : onClose() }, { immediate: true })
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  setBackgroundInert(false)
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" class="dsp" :class="`dsp--${side}`">
      <div class="dsp__scrim" @click="onScrim" />
      <aside
        ref="panel"
        class="dsp__panel"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-labelledby="labelledBy"
        :aria-label="ariaLabelComputed"
        :style="{ width }"
        @keydown="onTab"
      >
        <header class="dsp__head">
          <button class="dsp__close" aria-label="Close" @click="close"><q-icon name="close" size="22px" /></button>
          <h2 v-if="title" :id="labelledBy" class="dsp__title">{{ title }}</h2>
          <span class="dsp__headend"><slot name="header-end" /></span>
        </header>
        <div class="dsp__body"><slot /></div>
        <footer v-if="$slots.footer" class="dsp__foot"><slot name="footer" /></footer>
      </aside>
    </div>
  </teleport>
</template>

<style scoped>
.dsp { position: fixed; inset: 0; z-index: 3000; }
.dsp__scrim { position: absolute; inset: 0; background: rgba(9, 9, 11, 0.5); animation: dsp-fade 0.18s ease; }
.dsp__panel { position: absolute; top: 0; height: 100%; max-width: 100vw; background: var(--ds-color-surface); display: flex; flex-direction: column; box-shadow: var(--ds-shadow-4, 0 24px 60px rgba(0, 0, 0, 0.25)); }
/* The panel takes programmatic focus on open; it is its own visual cue, so
   don't ring the whole surface (same convention as main[tabindex="-1"]). */
.dsp__panel:focus { outline: none; }
.dsp--right .dsp__panel { right: 0; animation: dsp-slide-r 0.22s var(--ds-ease-standard); }
.dsp--left .dsp__panel { left: 0; animation: dsp-slide-l 0.22s var(--ds-ease-standard); }
.dsp--center .dsp__panel { left: 50%; transform: translateX(-50%); animation: dsp-rise 0.2s var(--ds-ease-standard); }
@keyframes dsp-fade { from { opacity: 0; } }
@keyframes dsp-slide-r { from { transform: translateX(100%); } }
@keyframes dsp-slide-l { from { transform: translateX(-100%); } }
@keyframes dsp-rise { from { transform: translate(-50%, 1.5%); opacity: 0.6; } }

.dsp__head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; flex: none; }
.dsp__close { width: 36px; height: 36px; flex: none; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.dsp__close:hover { background: var(--ds-palette-slate-200); }
.dsp__title { flex: 1; min-width: 0; margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--ds-color-text); }
.dsp__headend { flex: none; }

.dsp__body { flex: 1; overflow-y: auto; padding: 4px 24px 24px; }
.dsp__foot { flex: none; border-top: 1px solid var(--ds-color-border); padding: 16px 24px; background: var(--ds-color-surface); }

@media (max-width: 600px) { .dsp__panel { width: 100vw !important; } }
</style>
