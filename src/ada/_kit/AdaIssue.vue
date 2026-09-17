<script setup>
// Page shell shared by every issue's Issue / Before / Proposal story.
// Renders the Linear metadata header, then the numbered items (default slot).
import { computed, ref, useId } from 'vue'
import { issue as findIssue, WCAG, wcagUrl, LINEAR_PROJECT_URL, SNAPSHOT_DATE } from './issues.js'
import AdaMarkdown from './AdaMarkdown.vue'

const props = defineProps({
  issueId: { type: String, required: true },
  /** Which of the three stories this is. */
  view: { type: String, default: 'issue', validator: (v) => ['issue', 'before', 'proposal'].includes(v) },
  /** Verbatim Linear description (markdown). Shown on the Issue view. */
  linearMd: { type: String, default: '' },
  /** One-paragraph intro for this view. */
  summary: { type: String, default: '' },
})

const data = computed(() => findIssue(props.issueId))
const showLinear = ref(false)
const uid = useId()

const VIEWS = [
  { key: 'issue', label: 'Issue', hint: 'What Linear reports, cross-checked by the a11y agents' },
  { key: 'before', label: 'Before', hint: 'The same element in presto-2026 today' },
  { key: 'proposal', label: 'Proposal', hint: 'Linear fix (Option A) plus agent-suggested alternates' },
]
const current = computed(() => VIEWS.find((v) => v.key === props.view))
const priorityClass = computed(() => `ada-pill--${data.value.priority.toLowerCase()}`)
</script>

<template>
  <div class="ada-page">
    <header class="ada-header">
      <p class="ada-eyebrow">
        <a :href="LINEAR_PROJECT_URL" target="_blank" rel="noopener noreferrer">ADA / WCAG 2.1 AA Compliance<span class="ada-sr-only"> (opens in a new tab)</span></a>
        <span aria-hidden="true"> › </span>{{ data.epicInfo.title }}
      </p>
      <h1 class="ada-title">
        <span class="ada-title__key">{{ data.key }}</span>
        {{ data.title }}
      </h1>

      <ul class="ada-meta" aria-label="Issue details">
        <li><span class="ada-pill ada-pill--id">{{ data.id }}</span></li>
        <li><span class="ada-pill" :class="priorityClass">Priority: {{ data.priority }}</span></li>
        <li><span class="ada-pill ada-pill--neutral">Status: {{ data.status }}</span></li>
        <li><span class="ada-pill ada-pill--neutral">{{ data.label }}</span></li>
        <li>
          <a class="ada-linear-link" :href="data.url" target="_blank" rel="noopener noreferrer">
            Open {{ data.id }} in Linear<span class="ada-sr-only"> (opens in a new tab)</span>
            <q-icon name="open_in_new" size="14px" aria-hidden="true" />
          </a>
        </li>
      </ul>

      <div class="ada-wcag">
        <h2 class="ada-wcag__label">WCAG success criteria</h2>
        <ul class="ada-wcag__list">
          <li v-for="sc in data.wcag" :key="sc">
            <a :href="wcagUrl(sc)" target="_blank" rel="noopener noreferrer" class="ada-sc">
              <strong>{{ sc }}</strong> {{ WCAG[sc]?.[0] }} <span class="ada-sc__lvl">({{ WCAG[sc]?.[1] }})</span>
              <span class="ada-sr-only"> — opens in a new tab</span>
            </a>
          </li>
        </ul>
      </div>

      <p class="ada-snapshot">
        Codebase: <strong>{{ data.epicInfo.codebase }}</strong> — {{ data.epicInfo.stack }}.
        Linear snapshot {{ SNAPSHOT_DATE }} (read-only).
      </p>
    </header>

    <section class="ada-view" :aria-labelledby="`${uid}-view`">
      <div class="ada-view__head">
        <h2 :id="`${uid}-view`" class="ada-view__title">{{ current.label }}</h2>
        <p class="ada-view__hint">{{ current.hint }}</p>
      </div>
      <p v-if="summary" class="ada-view__summary">{{ summary }}</p>

      <div v-if="view === 'issue' && linearMd" class="ada-linear">
        <button
          type="button"
          class="ada-linear__toggle"
          :aria-expanded="String(showLinear)"
          :aria-controls="`${uid}-linear`"
          @click="showLinear = !showLinear"
        >
          <q-icon :name="showLinear ? 'expand_less' : 'expand_more'" size="20px" aria-hidden="true" />
          Full Linear description (verbatim)
        </button>
        <div v-show="showLinear" :id="`${uid}-linear`" class="ada-linear__body">
          <AdaMarkdown :source="linearMd" :base-level="3" />
        </div>
      </div>

      <ol class="ada-items">
        <slot />
      </ol>
    </section>
  </div>
</template>
