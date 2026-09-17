// Prototype bootstrap — mirrors .storybook/preview.js exactly so the library
// components render identically to Storybook (same Quasar plugins, same global
// Q-component registration, same DS stylesheets). No library files are modified.
import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import * as QComponents from 'quasar'

// Icon + font extras (same as Storybook).
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Quasar core styles from SASS source so the brand variables apply.
import 'quasar/src/css/index.sass'

// The design system's global styles + component overrides.
import '@lib/css/app.scss'

import App from './App.vue'
import { journey, bootstrapFromUrl } from './store.js'
import { loadGoogleMaps } from '@lib/lib/googleMaps.js'

// Optional deep-link/demo entry (?screen=…); no-op for the normal Landing start.
bootstrapFromUrl()
// Expose journey for CDP-driven verification / debugging in the console.
if (typeof window !== 'undefined') window.__journey = journey

const app = createApp(App)

app.use(Quasar, { plugins: { Notify, Dialog, Loading } })

// Register every Q* component globally so library templates using <q-*> tags
// work without per-file imports (identical to preview.js).
for (const [name, component] of Object.entries(QComponents)) {
  if (
    /^Q[A-Z]/.test(name) &&
    component &&
    (component.render || component.setup || component.__name || component.name)
  ) {
    app.component(name, component)
  }
}

// Preload Google Maps BEFORE mounting. The library HotelMap reads its build-time
// key from `@lib/lib/googleMaps.js`, which Vite resolves OUTSIDE this app's root
// (via the @lib alias → ../../src) where our env isn't injected, so hasMapsKey()
// there can read empty and the map falls back to a "key needed"/error box. main.js
// DOES see VITE_GOOGLE_MAPS_API_KEY, so we call the library's OWN loader with the
// key explicitly: it populates the loader's singleton promise + window.google.maps,
// and when HotelMap mounts its loadGoogleMaps() reuses that cached promise (no key
// needed, no runtime paste, no duplicate script). Zero library changes.
async function boot () {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  if (typeof window !== 'undefined' && key) {
    // Belt-and-suspenders: also seed the runtime key slot HotelMap reads.
    try { sessionStorage.setItem('ds-gmaps-key', key) } catch (e) { /* sandboxed */ }
    try { await loadGoogleMaps(key) } catch (e) { /* map falls back gracefully */ }
  }
  app.mount('#app')
}
boot()
