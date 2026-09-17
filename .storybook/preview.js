import { setup } from '@storybook/vue3-vite'
import { Quasar, Notify, Dialog, Loading, ClosePopup } from 'quasar'
import * as QComponents from 'quasar'

// Icon + font extras
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Quasar core styles — imported from SASS source so the Presto brand
// variables (src/presto/css/quasar.variables.scss) are applied.
import 'quasar/src/css/index.sass'

// Presto design system global styles (vendored from presto-2026), then the
// audit kit's own styles.
import '../src/presto/css/app.scss'
import '../src/ada/_kit/ada-kit.scss'

// Same app setup as presto-2026: Quasar plugin + every Q* component registered
// globally so Before stories can render presto-2026 components unchanged.
setup((app) => {
  app.use(Quasar, { plugins: { Notify, Dialog, Loading }, directives: { ClosePopup } })

  for (const [name, component] of Object.entries(QComponents)) {
    if (
      /^Q[A-Z]/.test(name) &&
      component &&
      (component.render || component.setup || component.__name || component.name)
    ) {
      app.component(name, component)
    }
  }
})

/** @type { import('@storybook/vue3-vite').Preview } */
const preview = {
  parameters: {
    backgrounds: {
      options: {
        light: { name: 'light', value: '#ffffff' },
        canvas: { name: 'canvas', value: '#f9f9fa' },
        dark: { name: 'dark', value: '#141218' },
      },
    },
    viewport: {
      options: {
        mobileSm: { name: 'Mobile — 360', styles: { width: '360px', height: '800px' } },
        mobile: { name: 'Mobile — 390 (target)', styles: { width: '390px', height: '844px' } },
        mobileLg: { name: 'Mobile — 414', styles: { width: '414px', height: '896px' } },
        tablet: { name: 'Tablet — 768', styles: { width: '768px', height: '1024px' } },
      },
    },
    // axe-core audits every story against WCAG 2.x A + AA. "Before" stories are
    // expected to surface violations (they document the existing problem);
    // "Proposal" stories are expected to come back clean.
    a11y: {
      test: 'todo',
      // Contrast swatches deliberately render the failing production pair; the
      // verdict text beside each swatch carries the information.
      context: { include: ['#storybook-root'], exclude: [['[data-ada-swatch]']] },
      config: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Mirrors the Linear project: milestones (Epics) in order, issues by ID,
    // and Issue → Before → Proposal inside every issue.
    options: {
      storySort: {
        order: [
          'Overview', ['Introduction', 'All Issues', 'Cross-Check Agents'],
          'Epic 1 – fuse',
          'Epic 2 – platform Reservation Flow',
          'Epic 3 – platform Group Block Flow',
          'Epic 4 – platform Guest Self-Service',
          'Epic 5 – platform Order Management',
          'Epic 6 – blitz Live Inventory',
          '*',
        ],
      },
    },
  },

  initialGlobals: {
    backgrounds: { value: 'light' },
  },
}

export default preview
