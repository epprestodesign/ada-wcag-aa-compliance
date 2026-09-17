import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { quasar } from '@quasar/vite-plugin'

const quasarVariables = fileURLToPath(
  new URL('../src/presto/css/quasar.variables.scss', import.meta.url)
)

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: [
    '../src/ada/**/*.mdx',
    '../src/ada/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-themes', '@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {},
  async viteFinal(baseConfig) {
    // Note: vite.config.js (loaded by the Vite builder) provides @vitejs/plugin-vue
    // ('vite:vue') plugin. We must NOT add a second one — a duplicate Vue
    // plugin breaks .vue SFC compilation. Quasar's plugin auto-detects the
    // existing Vue plugin and slots in after it.
    return mergeConfig(baseConfig, {
      plugins: [quasar({ sassVariables: quasarVariables })],
    })
  },
}

export default config
