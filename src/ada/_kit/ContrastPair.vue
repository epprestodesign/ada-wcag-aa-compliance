<script setup>
// Live contrast check for a foreground/background pair, using the same WCAG
// math as presto-2026's Color Contrast audit.
import { computed } from 'vue'
import { contrast } from '../../presto/stories/_contrast.js'

const props = defineProps({
  fg: { type: String, required: true },
  bg: { type: String, default: '#FFFFFF' },
  label: { type: String, default: '' },
  /** 'normal' needs 4.5:1; 'large' (≥24px, or ≥18.66px bold) and 'ui' need 3:1 */
  size: { type: String, default: 'normal', validator: (v) => ['normal', 'large', 'ui'].includes(v) },
  sample: { type: String, default: 'Sample text Aa' },
  /** Render the sample as a solid pill (white text on a colored fill) */
  pill: { type: Boolean, default: false },
})

const ratio = computed(() => contrast(props.fg, props.bg))
const need = computed(() => (props.size === 'normal' ? 4.5 : 3))
const pass = computed(() => ratio.value >= need.value)
const shown = computed(() => ratio.value.toFixed(2))
const sampleStyle = computed(() => ({
  color: props.fg,
  background: props.bg,
  fontSize: props.size === 'large' ? '24px' : '15px',
  fontWeight: props.size === 'large' ? 700 : 400,
}))
</script>

<template>
  <div class="ada-contrast" :class="{ 'ada-contrast--fail': !pass }">
    <!-- The swatch intentionally renders the audited pair (it may fail);
         the verdict text next to it is what carries the information. -->
    <div class="ada-contrast__sample" :class="{ 'ada-contrast__sample--pill': pill }" :style="sampleStyle" aria-hidden="true" data-ada-swatch>
      {{ sample }}
    </div>
    <div class="ada-contrast__info">
      <p class="ada-contrast__label">{{ label || `${fg} on ${bg}` }}</p>
      <p class="ada-contrast__hex"><code>{{ fg }}</code> on <code>{{ bg }}</code></p>
      <p class="ada-contrast__ratio">
        <strong>{{ shown }}:1</strong>
        <span class="ada-pill" :class="pass ? 'ada-pill--pass' : 'ada-pill--fail'">
          {{ pass ? 'Pass' : 'Fail' }} · needs {{ need }}:1 ({{ size === 'normal' ? 'normal text' : size === 'large' ? 'large text' : 'UI component' }})
        </span>
      </p>
    </div>
  </div>
</template>
