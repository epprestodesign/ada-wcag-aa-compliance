<script setup>
// "Design System Impact" — every change the 33 audit proposals imply for the
// Presto design system, grouped by DS layer. Rows live in ds-impact.js.
import { computed } from 'vue'
import { DS_IMPACT, LAYERS } from './ds-impact.js'
import { issue as findIssue, WCAG, LINEAR_PROJECT_URL, SNAPSHOT_DATE } from './issues.js'
import { ISSUE_INDEX } from './issue-index.generated.js'

const groups = computed(() =>
  LAYERS.map((l) => ({ ...l, rows: DS_IMPACT.filter((r) => r.layer === l.key) })),
)

const totals = computed(() => ({
  rows: DS_IMPACT.length,
  update: DS_IMPACT.filter((r) => r.type === 'update').length,
  create: DS_IMPACT.filter((r) => r.type === 'new').length,
  componentRows: DS_IMPACT.filter((r) => r.layer === 'components').length,
  newComponents: DS_IMPACT.filter((r) => r.type === 'new').length,
  issues: new Set(DS_IMPACT.flatMap((r) => r.issues)).size,
  contrast: DS_IMPACT.filter((r) => r.wcag.includes('1.4.3') || r.wcag.includes('1.4.11')).length,
}))

// Link an issue id to its story, when that issue has been built.
const issueHref = (id) => {
  const story = ISSUE_INDEX[id]
  return story ? `./?path=/docs/${story.storyId}--docs` : null
}
const issueKey = (id) => {
  try { return findIssue(id).key } catch { return id }
}
</script>

<template>
  <div class="ada-page">
    <header class="ada-header">
      <p class="ada-eyebrow">Overview</p>
      <h1 class="ada-title">Design system impact</h1>
      <div class="ada-view__summary" style="margin-top:0">
        <p style="margin:0 0 8px">
          Everything the proposals in this audit would change in the
          <a href="https://epprestodesign.github.io/presto-2026/" target="_blank" rel="noopener noreferrer">Presto design system<span class="ada-sr-only"> (opens in a new tab)</span></a>,
          collected from all 33 issues in
          <a :href="LINEAR_PROJECT_URL" target="_blank" rel="noopener noreferrer">ADA / WCAG 2.1 AA Compliance<span class="ada-sr-only"> (opens in a new tab)</span></a>
          and grouped by layer. Each row pairs what presto-2026 does today with the change the audit proposes.
        </p>
        <p style="margin:0">
          <span class="ada-pill ada-pill--linear">Update</span> changes something that exists ·
          <span class="ada-pill ada-pill--agent">New</span> is a component the redesign doesn't have yet, where production has one.
          Rows here are design-system work only; fixes that touch only fuse, platform or blitz code stay in their own issue.
          Linear snapshot {{ SNAPSHOT_DATE }}.
        </p>
      </div>

      <dl class="ada-kpis">
        <div><dt>Design-system changes</dt><dd>{{ totals.rows }}</dd><dd class="ada-kpis__note">{{ totals.update }} updates · {{ totals.create }} new</dd></div>
        <div><dt>Component-level changes</dt><dd>{{ totals.componentRows }}</dd><dd class="ada-kpis__note">Plus {{ totals.newComponents }} components or screens to design</dd></div>
        <div><dt>Color / contrast rows</dt><dd>{{ totals.contrast }}</dd><dd class="ada-kpis__note">Token and component color work</dd></div>
        <div><dt>Issues driving them</dt><dd>{{ totals.issues }}</dd><dd class="ada-kpis__note">of 33 in the project</dd></div>
      </dl>
    </header>

    <section v-for="g in groups" :key="g.key" class="ada-view" :aria-labelledby="`ds-${g.key}`">
      <div class="ada-view__head">
        <h2 :id="`ds-${g.key}`" class="ada-view__title">{{ g.title }}</h2>
        <p class="ada-view__hint">{{ g.hint }} · {{ g.rows.length }} {{ g.rows.length === 1 ? 'change' : 'changes' }}</p>
      </div>
      <div class="ada-table-wrap" tabindex="0" :aria-label="`${g.title} changes table`">
        <table class="ada-table ada-table--impact">
          <caption class="ada-sr-only">{{ g.title }}: current presto-2026 behaviour and the proposed change</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Today</th>
              <th scope="col">Proposed change</th>
              <th scope="col">Issues</th>
              <th scope="col">WCAG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in g.rows" :key="r.item">
              <th scope="row">
                <span class="ada-pill" :class="r.type === 'new' ? 'ada-pill--agent' : 'ada-pill--linear'">{{ r.type === 'new' ? 'New' : 'Update' }}</span>
                <span class="ada-impact__item">{{ r.item }}</span>
                <code v-if="r.target" class="ada-impact__target">{{ r.target }}</code>
              </th>
              <td>{{ r.today }}</td>
              <td class="ada-impact__proposed">{{ r.proposed }}</td>
              <td>
                <ul class="ada-table__tally">
                  <li v-for="id in r.issues" :key="id">
                    <a v-if="issueHref(id)" :href="issueHref(id)" target="_top" class="ada-pill ada-pill--neutral">{{ issueKey(id) }}</a>
                    <span v-else class="ada-pill ada-pill--neutral">{{ id }}</span>
                  </li>
                </ul>
              </td>
              <td class="ada-table__sc">
                <span v-for="sc in r.wcag" :key="sc" class="ada-impact__sc">
                  <abbr :title="`WCAG ${sc} ${WCAG[sc]?.[0] ?? ''}`">{{ sc }}</abbr>
                </span>
                <span v-if="!r.wcag.length" class="ada-note">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
