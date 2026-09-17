// Overview › Design System Impact — every change the audit proposals imply for
// the Presto design system, grouped by DS layer (rows in _kit/ds-impact.js).
import DsImpact from '../_kit/DsImpact.vue'

export default {
  title: 'Overview/Design System Impact',
  parameters: { layout: 'fullscreen' },
}

export const Changes = {
  name: 'Design System Impact',
  render: () => ({ components: { DsImpact }, template: '<ds-impact />' }),
}
