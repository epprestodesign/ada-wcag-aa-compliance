<script setup>
// "Before" frame: shows the presto-2026 element that corresponds to an item,
// and says whether Linear's production finding still applies to it.
import { computed } from 'vue'

const props = defineProps({
  /** e.g. "presto-2026 Storybook › Hotel Details / Detail Tabs" */
  source: { type: String, default: '' },
  /** Link to the live presto-2026 story or prototype screen. */
  href: { type: String, default: '' },
  /**
   * applies       — the redesign repeats the defect
   * partial       — some of the defect is still present
   * resolved      — presto-2026 already handles it
   * no-equivalent — presto-2026 has no matching element (placeholder)
   */
  status: {
    type: String,
    default: 'applies',
    validator: (v) => ['applies', 'partial', 'resolved', 'no-equivalent'].includes(v),
  },
})

const STATUS = {
  applies: { label: 'Issue still present in presto-2026', icon: 'error' },
  partial: { label: 'Partially present in presto-2026', icon: 'warning' },
  resolved: { label: 'Already handled in presto-2026', icon: 'check_circle' },
  'no-equivalent': { label: 'No presto-2026 equivalent yet', icon: 'block' },
}
const s = computed(() => STATUS[props.status])
</script>

<template>
  <figure class="ada-before" :class="`ada-before--${status}`">
    <figcaption class="ada-before__cap">
      <span class="ada-pill" :class="`ada-pill--before-${status}`">
        <q-icon :name="s.icon" size="14px" aria-hidden="true" /> {{ s.label }}
      </span>
      <span v-if="source" class="ada-before__src">
        Source:
        <a v-if="href" :href="href" target="_blank" rel="noopener noreferrer">{{ source }}<span class="ada-sr-only"> (opens in a new tab)</span></a>
        <template v-else>{{ source }}</template>
      </span>
    </figcaption>
    <div v-if="$slots.default && status !== 'no-equivalent'" class="ada-before__stage">
      <slot />
    </div>
    <div v-else-if="status === 'no-equivalent'" class="ada-before__empty">
      <q-icon name="design_services" size="28px" aria-hidden="true" />
      <p><slot name="empty">This production surface has not been redesigned in presto-2026, so there is no element to show yet. The Proposal story shows the accessible pattern to use when it is.</slot></p>
    </div>
    <div v-if="$slots.notes" class="ada-before__notes"><slot name="notes" /></div>
  </figure>
</template>
