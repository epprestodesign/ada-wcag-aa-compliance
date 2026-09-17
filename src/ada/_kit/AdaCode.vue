<script setup>
// Read-only code snippet (production defect or proposed fix).
defineProps({
  code: { type: String, required: true },
  lang: { type: String, default: 'html' },
  /** Optional caption, e.g. "Production — fuse/index.html:6" */
  caption: { type: String, default: '' },
  /** 'bad' | 'good' | 'neutral' — colors the left rule */
  tone: { type: String, default: 'neutral' },
})
</script>

<template>
  <div class="ada-code" :class="`ada-code--${tone}`">
    <p v-if="caption" class="ada-code__cap">
      <span v-if="tone === 'bad'" class="ada-sr-only">Problem code: </span>
      <span v-if="tone === 'good'" class="ada-sr-only">Fixed code: </span>{{ caption }}
    </p>
    <!-- tabindex lets keyboard users scroll long lines (scrollable-region-focusable) -->
    <pre tabindex="0" :aria-label="caption || `${lang} code`"><code :class="`language-${lang}`">{{ code.trim() }}</code></pre>
  </div>
</template>
