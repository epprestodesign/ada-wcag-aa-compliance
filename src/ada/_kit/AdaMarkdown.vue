<script setup>
// Renders a Linear issue description (markdown) verbatim. Headings are
// re-leveled so the shallowest one lands on `baseLevel`, keeping the story's
// heading outline valid (no skipped levels).
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, required: true },
  baseLevel: { type: Number, default: 3 },
})

const html = computed(() => {
  const tokens = marked.lexer(props.source)
  const depths = []
  marked.walkTokens(tokens, (t) => { if (t.type === 'heading') depths.push(t.depth) })
  const shift = depths.length ? props.baseLevel - Math.min(...depths) : 0
  marked.walkTokens(tokens, (t) => {
    if (t.type === 'heading') t.depth = Math.min(6, Math.max(1, t.depth + shift))
  })
  // Linear task-list checkboxes are read-only here — mark them disabled and
  // give them a name so they don't surface as unlabeled form controls.
  return marked
    .parser(tokens)
    .replaceAll('<input disabled="" type="checkbox">', '<span class="ada-md-check" aria-hidden="true">☐</span>')
    .replaceAll('<input checked="" disabled="" type="checkbox">', '<span class="ada-md-check" aria-hidden="true">☑</span>')
})
</script>

<template>
  <!-- Source is the team's own Linear ticket text, bundled at build time. -->
  <div class="ada-md" v-html="html" />
</template>
