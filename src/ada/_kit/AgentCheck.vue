<script setup>
// Cross-check verdict from a Community-Access accessibility-agents specialist.
// https://github.com/Community-Access/accessibility-agents
import { computed } from 'vue'
import { AGENTS } from './agents.js'

const props = defineProps({
  /** Agent slug, e.g. 'aria-specialist' */
  agent: { type: String, required: true },
  /**
   * agrees    — the agent's rules confirm Linear's finding and fix
   * refines   — agrees, but the agent adds a nuance or a better fix
   * disagrees — the agent's rules conflict with Linear's claim or fix
   */
  verdict: { type: String, default: 'agrees', validator: (v) => ['agrees', 'refines', 'disagrees'].includes(v) },
  /** The specific agent rule / guidance applied. */
  rule: { type: String, default: '' },
})

const info = computed(() => AGENTS[props.agent] ?? { name: props.agent, focus: '' })
const VERDICT = {
  agrees: { label: 'Agrees with Linear', icon: 'check_circle' },
  refines: { label: 'Agent note', icon: 'lightbulb' },
  disagrees: { label: 'Disagrees with Linear', icon: 'report' },
}
const v = computed(() => VERDICT[props.verdict])
const href = computed(
  () => `https://github.com/Community-Access/accessibility-agents/blob/main/claude-code-plugin/agents/${props.agent}.md`,
)
</script>

<template>
  <aside class="ada-agent" :class="`ada-agent--${verdict}`" :aria-label="`Cross-check by ${info.name}`">
    <div class="ada-agent__head">
      <q-icon :name="v.icon" size="18px" aria-hidden="true" />
      <span class="ada-agent__verdict">{{ v.label }}</span>
      <span class="ada-agent__by">
        — cross-check by
        <a :href="href" target="_blank" rel="noopener noreferrer">{{ info.name }}<span class="ada-sr-only"> agent definition (opens in a new tab)</span></a>
      </span>
    </div>
    <p v-if="rule" class="ada-agent__rule"><span class="ada-agent__rule-label">Rule applied:</span> {{ rule }}</p>
    <div class="ada-agent__body"><slot /></div>
  </aside>
</template>
