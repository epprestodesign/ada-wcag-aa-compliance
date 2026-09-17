import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const quasarVariables = fileURLToPath(
  new URL('./src/presto/css/quasar.variables.scss', import.meta.url)
)

// Base Vite config. Storybook's Vite builder loads this file, which is what
// supplies @vitejs/plugin-vue (Quasar's plugin must come after it).
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: quasarVariables }),
  ],
})
