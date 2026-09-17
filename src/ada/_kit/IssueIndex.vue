<script setup>
// "All Issues" dashboard: every Linear issue grouped by Epic (milestone), with
// the item / Before / agent-verdict tallies generated from the story files.
import { computed } from 'vue'
import { ISSUES, EPICS, LINEAR_PROJECT_URL, SNAPSHOT_DATE } from './issues.js'
import { ISSUE_INDEX } from './issue-index.generated.js'

const sum = (o = {}) => Object.values(o).reduce((a, b) => a + b, 0)

const rows = computed(() =>
  ISSUES.map((i) => {
    const x = ISSUE_INDEX[i.id]
    const states = x?.itemStates ?? {}
    return {
      ...i,
      built: !!x,
      storyId: x?.storyId,
      items: x?.items ?? 0,
      refuted: states.refuted ?? 0,
      newCount: states.new ?? 0,
      before: x?.before ?? {},
      agents: x?.agents ?? {},
      options: x?.options ?? { linear: 0, agent: 0 },
    }
  }),
)

const groups = computed(() => EPICS.map((e) => ({ ...e, rows: rows.value.filter((r) => r.epic === e.key) })))

const totals = computed(() => {
  const r = rows.value
  return {
    issues: r.length,
    built: r.filter((x) => x.built).length,
    urgent: r.filter((x) => x.priority === 'Urgent').length,
    high: r.filter((x) => x.priority === 'High').length,
    items: r.reduce((a, x) => a + x.items, 0),
    refuted: r.reduce((a, x) => a + x.refuted, 0),
    applies: r.reduce((a, x) => a + (x.before.applies ?? 0) + (x.before.partial ?? 0), 0),
    noEq: r.reduce((a, x) => a + (x.before['no-equivalent'] ?? 0), 0),
    resolved: r.reduce((a, x) => a + (x.before.resolved ?? 0), 0),
    agentChecks: r.reduce((a, x) => a + sum(x.agents), 0),
    refines: r.reduce((a, x) => a + (x.agents.refines ?? 0), 0),
    disagrees: r.reduce((a, x) => a + (x.agents.disagrees ?? 0), 0),
    alternates: r.reduce((a, x) => a + x.options.agent, 0),
  }
})

// Links resolve against the Storybook manager (the preview runs in an iframe).
const href = (storyId, view) => (view === 'docs' ? `./?path=/docs/${storyId}--docs` : `./?path=/story/${storyId}--${view}`)
</script>

<template>
  <div class="ada-page">
    <header class="ada-header">
      <p class="ada-eyebrow">Overview</p>
      <h1 class="ada-title">All issues</h1>
      <p class="ada-view__summary" style="margin-top:0">
        Every issue in the Linear project
        <a :href="LINEAR_PROJECT_URL" target="_blank" rel="noopener noreferrer">ADA / WCAG 2.1 AA Compliance<span class="ada-sr-only"> (opens in a new tab)</span></a>,
        grouped by Epic the same way Linear groups its milestones. Linear snapshot {{ SNAPSHOT_DATE }} (read-only).
      </p>

      <dl class="ada-kpis">
        <div><dt>Issues</dt><dd>{{ totals.issues }}</dd><dd class="ada-kpis__note">{{ totals.urgent }} Urgent · {{ totals.high }} High</dd></div>
        <div><dt>Itemized problems</dt><dd>{{ totals.items }}</dd><dd class="ada-kpis__note">{{ totals.refuted }} refuted by Linear</dd></div>
        <div><dt>Still present in presto-2026</dt><dd>{{ totals.applies }}</dd><dd class="ada-kpis__note">{{ totals.resolved }} already handled · {{ totals.noEq }} no equivalent yet</dd></div>
        <div><dt>Agent cross-checks</dt><dd>{{ totals.agentChecks }}</dd><dd class="ada-kpis__note">{{ totals.refines }} notes · {{ totals.disagrees }} disagreements</dd></div>
        <div><dt>Agent-suggested alternates</dt><dd>{{ totals.alternates }}</dd><dd class="ada-kpis__note">In addition to each Linear fix</dd></div>
      </dl>
    </header>

    <section v-for="g in groups" :key="g.key" class="ada-view" :aria-labelledby="`idx-${g.key}`">
      <div class="ada-view__head">
        <h2 :id="`idx-${g.key}`" class="ada-view__title">{{ g.title }}</h2>
        <p class="ada-view__hint">{{ g.stack }} · {{ g.rows.length }} {{ g.rows.length === 1 ? 'issue' : 'issues' }}</p>
      </div>
      <div class="ada-table-wrap" tabindex="0" :aria-label="`${g.title} issues table`">
        <table class="ada-table">
          <caption class="ada-sr-only">{{ g.title }}: issues, items, presto-2026 status and agent verdicts</caption>
          <thead>
            <tr>
              <th scope="col">Issue</th>
              <th scope="col">Priority</th>
              <th scope="col">WCAG</th>
              <th scope="col">Items</th>
              <th scope="col">presto-2026 today</th>
              <th scope="col">Agent verdicts</th>
              <th scope="col">Stories</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in g.rows" :key="r.id">
              <th scope="row">
                <span class="ada-table__key">{{ r.key }}</span>
                <a v-if="r.built" :href="href(r.storyId, 'docs')" target="_top">{{ r.title }}</a>
                <span v-else>{{ r.title }}</span>
                <a class="ada-table__linear" :href="r.url" target="_blank" rel="noopener noreferrer">{{ r.id }}<span class="ada-sr-only"> in Linear (opens in a new tab)</span></a>
              </th>
              <td><span class="ada-pill" :class="`ada-pill--${r.priority.toLowerCase()}`">{{ r.priority }}</span></td>
              <td class="ada-table__sc">{{ r.wcag.join(', ') }}</td>
              <td>
                {{ r.items }}
                <span v-if="r.refuted" class="ada-table__sub">{{ r.refuted }} refuted</span>
                <span v-if="r.newCount" class="ada-table__sub">{{ r.newCount }} new</span>
              </td>
              <td>
                <ul class="ada-table__tally">
                  <li v-if="r.before.applies"><span class="ada-pill ada-pill--before-applies">{{ r.before.applies }} present</span></li>
                  <li v-if="r.before.partial"><span class="ada-pill ada-pill--before-partial">{{ r.before.partial }} partial</span></li>
                  <li v-if="r.before.resolved"><span class="ada-pill ada-pill--before-resolved">{{ r.before.resolved }} handled</span></li>
                  <li v-if="r.before['no-equivalent']"><span class="ada-pill ada-pill--before-no-equivalent">{{ r.before['no-equivalent'] }} no equivalent</span></li>
                </ul>
              </td>
              <td>
                <ul class="ada-table__tally">
                  <li v-if="r.agents.agrees"><span class="ada-pill ada-pill--pass">{{ r.agents.agrees }} agree</span></li>
                  <li v-if="r.agents.refines"><span class="ada-pill ada-pill--agent">{{ r.agents.refines }} note</span></li>
                  <li v-if="r.agents.disagrees"><span class="ada-pill ada-pill--before-partial">{{ r.agents.disagrees }} disagree</span></li>
                </ul>
              </td>
              <td>
                <ul v-if="r.built" class="ada-table__links">
                  <li><a :href="href(r.storyId, 'issue')" target="_top">Issue<span class="ada-sr-only"> — {{ r.key }}</span></a></li>
                  <li><a :href="href(r.storyId, 'before')" target="_top">Before<span class="ada-sr-only"> — {{ r.key }}</span></a></li>
                  <li><a :href="href(r.storyId, 'proposal')" target="_top">Proposal<span class="ada-sr-only"> — {{ r.key }}</span></a></li>
                </ul>
                <span v-else class="ada-note">Not built yet</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
