import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// Accessible prototype. @lib points at src/presto-a11y — the remediated copy of
// the presto-2026 design system — NOT at src/presto, which is kept pristine so
// the audit's "Before" stories keep showing the real defects.
const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const libSrc = fileURLToPath(new URL('../src/presto-a11y', import.meta.url))
const quasarVariables = fileURLToPath(new URL('../src/presto-a11y/css/quasar.variables.scss', import.meta.url))

// Deployed as a Storybook sub-page on GitHub Pages at
// `/ada-wcag-aa-compliance/prototype/`; local dev serves from `/`. The deploy
// workflow passes `--base=/ada-wcag-aa-compliance/prototype/`.
export default defineConfig({
  // Read .env from the repo root so one file serves Storybook and both
  // prototypes (VITE_GOOGLE_MAPS_API_KEY, VITE_IMAGERY_URL).
  envDir: repoRoot,
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: quasarVariables }),
  ],
  resolve: {
    alias: {
      // Import library components/lib/assets via a stable alias, e.g.
      //   import GlobalNav from '@lib/components/GlobalNav.vue'
      '@lib': libSrc,
    },
  },
  server: {
    port: 6100,
    fs: {
      // Allow serving the library source, assets, credit-card SVGs, and
      // background imagery that live outside this prototype folder.
      allow: [repoRoot],
    },
  },
})
