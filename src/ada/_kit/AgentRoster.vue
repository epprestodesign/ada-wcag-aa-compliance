<script setup>
// Which accessibility-agents specialists cross-checked which issues.
import { computed } from 'vue'
import { AGENTS, AGENTS_REPO, AGENTS_VERSION } from './agents.js'
import { ISSUES } from './issues.js'
import { ISSUE_INDEX } from './issue-index.generated.js'

const roster = computed(() =>
  Object.values(AGENTS).map((a) => ({
    ...a,
    issues: ISSUES.filter((i) => ISSUE_INDEX[i.id]?.agentSlugs.includes(a.name)),
    href: `${AGENTS_REPO}/blob/main/claude-code-plugin/agents/${a.name}.md`,
  })),
)
</script>

<template>
  <div class="ada-page">
    <header class="ada-header">
      <p class="ada-eyebrow">Overview</p>
      <h1 class="ada-title">Cross-check agents</h1>
      <div class="ada-view__summary" style="margin-top:0">
        <p style="margin:0 0 8px">
          Each Linear finding was checked against the rules of the matching specialist from
          <a :href="AGENTS_REPO" target="_blank" rel="noopener noreferrer">Community-Access/accessibility-agents<span class="ada-sr-only"> (opens in a new tab)</span></a>
          (plugin v{{ AGENTS_VERSION }}, installed at project scope in <code>.claude/settings.json</code>).
        </p>
        <p style="margin:0">
          Verdicts: <span class="ada-pill ada-pill--pass">Agrees with Linear</span>
          <span class="ada-pill ada-pill--agent">Agent note</span> (agrees but adds a nuance, a number correction or a better pattern)
          <span class="ada-pill ada-pill--before-partial">Disagrees with Linear</span>.
          Linear's own text is never changed. Automated and AI checks don't replace testing with VoiceOver, NVDA, JAWS and a keyboard.
        </p>
      </div>
    </header>

    <section class="ada-view" aria-labelledby="roster-h">
      <div class="ada-view__head"><h2 id="roster-h" class="ada-view__title">Specialists</h2></div>
      <ul class="ada-roster">
        <li v-for="a in roster" :key="a.name" class="ada-roster__card">
          <h3 class="ada-roster__name">
            <a :href="a.href" target="_blank" rel="noopener noreferrer">{{ a.name }}<span class="ada-sr-only"> agent definition (opens in a new tab)</span></a>
          </h3>
          <p class="ada-note">{{ a.focus }}</p>
          <p class="ada-roster__count"><strong>{{ a.issues.length }}</strong> {{ a.issues.length === 1 ? 'issue' : 'issues' }} cross-checked</p>
          <ul v-if="a.issues.length" class="ada-table__tally">
            <li v-for="i in a.issues" :key="i.id"><span class="ada-pill ada-pill--neutral">{{ i.key }}</span></li>
          </ul>
        </li>
      </ul>
    </section>
  </div>
</template>
