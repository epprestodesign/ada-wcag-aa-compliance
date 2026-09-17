<script setup>
// Mobile prototype showcase — frames the (responsive) booking prototype inside a
// phone at 360/390/414px so its MOBILE layouts render on any screen. The phone
// includes a mock mobile-browser chrome (status bar + address bar) so the app
// viewport is pushed down exactly like a real mobile Chrome/Safari. On an actual
// phone the frame drops away and the app fills the viewport.
import { ref, computed, onMounted, onUnmounted } from 'vue'

// In dev this must match the port `pnpm dev` starts the booking prototype on —
// see prototype/package.json ("vite --port 6100"). In a build it's the sibling
// deploy nested under the Storybook site.
const PROTO_URL = import.meta.env.DEV ? 'http://localhost:6100/' : '../prototype/'

const widths = [
  { w: 360, label: '360' },
  { w: 390, label: '390' },
  { w: 414, label: '414' },
]
const width = ref(390)
const reloadKey = ref(0)

// Current booking stage — reported by the embedded prototype via postMessage —
// so the mock address bar tracks the flow like a real browser URL.
const screen = ref('landing')
const URL_MAP = {
  landing: 'presto.eventpipe.com',
  browse: 'presto.eventpipe.com/hotels',
  details: 'presto.eventpipe.com/hotels/the-concord-hotel',
  checkout: 'presto.eventpipe.com/checkout',
  confirmation: 'presto.eventpipe.com/confirmation',
}
const url = computed(() => URL_MAP[screen.value] || 'presto.eventpipe.com')

const restart = () => { screen.value = 'landing'; reloadKey.value++ }
const frameSrc = computed(() => `${PROTO_URL}?v=${reloadKey.value}`)

const onMsg = (e) => {
  const d = e && e.data
  if (d && d.type === 'presto:screen' && typeof d.screen === 'string') screen.value = d.screen
}

// Live status-bar clock (h:mm), refreshed each minute.
const now = ref(new Date())
let timer
onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 30000)
  window.addEventListener('message', onMsg)
})
onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('message', onMsg)
})
const clock = computed(() => {
  const h = now.value.getHours() % 12 || 12
  const m = String(now.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})
</script>

<template>
  <div class="mp">
    <header class="mp__bar">
      <div class="mp__brand">
        <span class="mp__dot" aria-hidden="true" />
        <div>
          <!-- The showcase needs a real page title in its outline (WCAG 1.3.1 /
               2.4.6); the visual weight is unchanged. -->
          <h1 class="mp__title">Presto Booking — Mobile</h1>
          <p class="mp__sub">Responsive design system at phone width</p>
        </div>
      </div>

      <div class="mp__controls">
        <!-- A set of mutually exclusive choices: the group is named, each
             button carries its unit in the accessible name (the visible label is
             just "360"), and the chosen one exposes its state (WCAG 4.1.2). -->
        <div class="mp__seg" role="group" aria-label="Device width">
          <button
            v-for="d in widths" :key="d.w" type="button"
            class="mp__seg-btn" :class="{ 'is-active': width === d.w }"
            :aria-pressed="width === d.w" :aria-label="`${d.label} pixels wide`"
            @click="width = d.w"
          >{{ d.label }}</button>
        </div>
        <button type="button" class="mp__restart" @click="restart"><span aria-hidden="true">↻</span> Restart<span class="sr-only"> the prototype</span></button>
      </div>
    </header>

    <main class="mp__stage">
      <div class="mp__phone" :style="{ width: width + 'px' }">
        <div class="mp__screen">
          <!-- iOS-style status bar — pure decoration (a drawing of a phone),
               so it is hidden from assistive tech rather than read as content. -->
          <div class="mp__status" aria-hidden="true">
            <span class="mp__time">{{ clock }}</span>
            <span class="mp__island" />
            <span class="mp__status-icons">
              <!-- cellular -->
              <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                <rect x="0"  y="8" width="3" height="4"  rx="1" fill="currentColor"/>
                <rect x="5"  y="6" width="3" height="6"  rx="1" fill="currentColor"/>
                <rect x="10" y="3" width="3" height="9"  rx="1" fill="currentColor"/>
                <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.35"/>
              </svg>
              <!-- wifi -->
              <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M1 4C4 1.3 13 1.3 16 4"/>
                <path d="M3.5 6.6C5.8 4.7 11.2 4.7 13.5 6.6"/>
                <path d="M6 9.1C7.4 8.1 9.6 8.1 11 9.1"/>
                <circle cx="8.5" cy="11" r="0.9" fill="currentColor" stroke="none"/>
              </svg>
              <!-- battery -->
              <span class="mp__batt"><span class="mp__batt-fill" /></span>
            </span>
          </div>

          <!-- Browser address bar -->
          <!-- Mock browser chrome: the address is a picture of a URL, not a
               control, so it is labelled as text rather than announced bare. -->
          <div class="mp__urlbar">
            <span class="mp__url"><span class="sr-only">Address: </span>
              <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">
                <rect x="1" y="5.5" width="9" height="6.5" rx="1.4"/>
                <path d="M3 5.5V3.6a2.5 2.5 0 0 1 5 0V5.5"/>
              </svg>
              {{ url }}
            </span>
            <button type="button" class="mp__reload" aria-label="Reload the prototype" @click="restart">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M12.5 6a5 5 0 1 0 .3 2.6"/>
                <path d="M12.8 2.5V6H9.3"/>
              </svg>
            </button>
          </div>

          <!-- A frame must be named so it can be told apart in the frame list
               (WCAG 4.1.2 / 2.4.1). -->
          <iframe :key="reloadKey" :src="frameSrc" class="mp__frame" title="Presto booking prototype, phone width" />
        </div>
      </div>
      <p class="mp__hint">Viewing at <strong>{{ width }}px</strong> — the same components you QA in Storybook, driving the full booking flow. Try all three flows from the landing search.</p>
    </main>
  </div>
</template>

<style>
:root { --mp-navy: #01113E; --mp-ink: #0F172A; --mp-sub: #475569; --mp-line: #E2E8F0; --mp-bg: #EEF1F6; }
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; }
body { font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: var(--mp-ink); background: var(--mp-bg); }

.mp { min-height: 100%; display: flex; flex-direction: column; }

/* Top toolbar */
.mp__bar { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 14px 24px; background: #fff; border-bottom: 1px solid var(--mp-line); }
.mp__brand { display: flex; align-items: center; gap: 12px; }
.mp__dot { width: 34px; height: 34px; border-radius: 9px; background: var(--mp-navy); flex: none; }
.mp__title { margin: 0; font-weight: 800; font-size: 1.0625rem; color: var(--mp-navy); }
.mp__sub { margin: 0; font-size: 0.8125rem; color: var(--mp-sub); }
/* This app has no design-system stylesheet, so it carries its own sr-only. */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0; }
.mp__seg-btn:focus-visible, .mp__restart:focus-visible, .mp__reload:focus-visible { outline: 2px solid var(--mp-navy); outline-offset: 2px; }
.mp__controls { display: flex; align-items: center; gap: 12px; }
.mp__seg { display: inline-flex; background: #fff; border: 1px solid var(--mp-line); border-radius: 999px; padding: 3px; }
.mp__seg-btn { border: 0; background: none; padding: 7px 16px; border-radius: 999px; font: inherit; font-size: 0.8125rem; font-weight: 700; color: var(--mp-sub); cursor: pointer; transition: background .15s ease, color .15s ease; }
.mp__seg-btn.is-active { background: var(--mp-navy); color: #fff; }
.mp__restart { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--mp-navy); background: #fff; color: var(--mp-navy); border-radius: 10px; padding: 8px 16px; font: inherit; font-size: 0.8125rem; font-weight: 700; cursor: pointer; }
.mp__restart:hover { background: #F5F7FB; }

/* Stage + phone */
.mp__stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 28px 16px 36px; }
.mp__phone { position: relative; height: min(860px, calc(100vh - 190px)); background: #0b1020; border-radius: 46px; padding: 11px; box-shadow: 0 30px 70px rgba(2, 16, 63, .28), 0 6px 16px rgba(2, 16, 63, .18); flex: none; }
.mp__screen { position: relative; width: 100%; height: 100%; background: #fff; border-radius: 36px; overflow: hidden; display: flex; flex-direction: column; }

/* iOS status bar */
.mp__status { position: relative; flex: none; height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px 0 26px; color: var(--mp-ink); }
.mp__time { font-weight: 700; font-size: 0.9375rem; letter-spacing: .02em; }
.mp__island { position: absolute; top: 9px; left: 50%; transform: translateX(-50%); width: 34%; height: 25px; background: #0b1020; border-radius: 14px; }
.mp__status-icons { display: inline-flex; align-items: center; gap: 6px; color: var(--mp-ink); }
.mp__batt { position: relative; width: 22px; height: 11px; border: 1px solid currentColor; border-radius: 3px; opacity: 0.9; }
.mp__batt::after { content: ''; position: absolute; right: -2.5px; top: 3px; width: 2px; height: 5px; background: currentColor; border-radius: 0 1px 1px 0; }
.mp__batt-fill { position: absolute; left: 1.5px; top: 1.5px; bottom: 1.5px; width: 62%; background: currentColor; border-radius: 1.5px; }

/* Browser address bar */
.mp__urlbar { flex: none; display: flex; align-items: center; gap: 8px; padding: 0 12px 10px; }
.mp__url { flex: 1; min-width: 0; display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; background: #EFF1F4; border-radius: 12px; color: var(--mp-ink); font-size: 0.875rem; font-weight: 500; }
.mp__url svg { color: var(--mp-sub); flex: none; }
.mp__reload { flex: none; width: 38px; height: 38px; border: 0; border-radius: 10px; background: #EFF1F4; color: var(--mp-ink); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.mp__reload:hover { background: #E4E8ED; }

.mp__frame { flex: 1; width: 100%; border: 0; background: #fff; display: block; }
.mp__hint { margin: 0; max-width: 520px; text-align: center; color: var(--mp-sub); font-size: 0.875rem; line-height: 1.5; }

/* On an actual phone / narrow viewport: drop the whole frame + mock chrome and
   let the app fill the screen (the device already has real browser chrome). */
@media (max-width: 700px) {
  .mp__bar { padding: 10px 14px; }
  .mp__sub, .mp__hint { display: none; }
  .mp__stage { padding: 0; }
  .mp__phone { width: 100% !important; height: 100%; border-radius: 0; padding: 0; box-shadow: none; }
  .mp__screen { border-radius: 0; }
  .mp__status, .mp__urlbar { display: none; }
}
</style>
