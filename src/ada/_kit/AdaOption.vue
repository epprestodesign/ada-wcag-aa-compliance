<script setup>
// One remediation option inside a Proposal item.
// Option A is always the fix from the Linear acceptance criteria; B/C are
// alternates suggested by an accessibility-agents specialist.
import { computed } from 'vue'
import AdaCode from './AdaCode.vue'

const props = defineProps({
  letter: { type: String, default: 'A' },
  title: { type: String, required: true },
  /** 'linear' = from the Linear acceptance criteria; 'agent' = agent-suggested */
  origin: { type: String, default: 'linear', validator: (v) => ['linear', 'agent'].includes(v) },
  /** Agent slug when origin === 'agent' */
  agent: { type: String, default: '' },
  recommended: { type: Boolean, default: false },
  /** Implementation snippet (markup / CSS / Vue). */
  code: { type: String, default: '' },
  lang: { type: String, default: 'html' },
})

const originLabel = computed(() =>
  props.origin === 'linear' ? 'From Linear acceptance criteria' : `Agent-suggested${props.agent ? ` (${props.agent})` : ''} — not in Linear`,
)
</script>

<template>
  <section class="ada-option" :class="`ada-option--${origin}`" :aria-label="`Option ${letter}: ${title}`">
    <div class="ada-option__head">
      <span class="ada-option__letter" aria-hidden="true">{{ letter }}</span>
      <div>
        <p class="ada-option__title"><span class="ada-sr-only">Option {{ letter }}: </span>{{ title }}</p>
        <p class="ada-option__meta">
          <span class="ada-pill" :class="origin === 'linear' ? 'ada-pill--linear' : 'ada-pill--agent'">{{ originLabel }}</span>
          <span v-if="recommended" class="ada-pill ada-pill--recommended">Recommended</span>
        </p>
      </div>
    </div>
    <div v-if="$slots.default" class="ada-option__demo">
      <slot />
    </div>
    <div v-if="$slots.why" class="ada-option__why"><slot name="why" /></div>
    <AdaCode v-if="code" :code="code" :lang="lang" />
  </section>
</template>
