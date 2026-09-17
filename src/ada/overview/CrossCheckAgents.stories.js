// Overview › Cross-Check Agents — the accessibility-agents specialists and the
// issues each one cross-checked.
import AgentRoster from '../_kit/AgentRoster.vue'

export default {
  title: 'Overview/Cross-Check Agents',
  parameters: { layout: 'fullscreen' },
}

export const CrossCheckAgents = {
  name: 'Cross-Check Agents',
  render: () => ({ components: { AgentRoster }, template: '<agent-roster />' }),
}
