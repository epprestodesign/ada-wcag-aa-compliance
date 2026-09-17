<script setup>
// One itemized problem inside an issue. Used identically in all three views so
// item N always means the same element across Issue / Before / Proposal.
import { computed, useId } from 'vue'
import { WCAG } from './issues.js'

const props = defineProps({
  n: { type: [Number, String], required: true },
  title: { type: String, required: true },
  /** WCAG SC numbers this item maps to, e.g. ['1.3.1', '4.1.2'] */
  wcag: { type: Array, default: () => [] },
  /**
   * How Linear classifies the item:
   *  confirmed — verified against source
   *  corrected — an earlier draft was wrong; Linear carries the corrected claim
   *  new       — found during the verification pass
   *  refuted   — claim disproved; no change needed
   *  unverified — Linear says it can't be confirmed from templates alone
   */
  state: {
    type: String,
    default: 'confirmed',
    validator: (v) => ['confirmed', 'corrected', 'new', 'refuted', 'unverified'].includes(v),
  },
  /** Element type this item highlights (screen, color, form field, heading…). */
  element: { type: String, default: '' },
  /** Production location cited by Linear, e.g. "fuse/src/App.vue:56-63" */
  where: { type: String, default: '' },
})

const uid = useId()
const STATE_LABEL = {
  confirmed: 'Confirmed',
  corrected: 'Corrected in Linear',
  new: 'New finding',
  refuted: 'Refuted — no change',
  unverified: 'Needs JS verification',
}
const stateLabel = computed(() => STATE_LABEL[props.state])
</script>

<template>
  <li class="ada-item" :class="`ada-item--${state}`" :aria-labelledby="`${uid}-t`">
    <div class="ada-item__head">
      <span class="ada-item__n" aria-hidden="true">{{ n }}</span>
      <div class="ada-item__heading">
        <h3 :id="`${uid}-t`" class="ada-item__title">
          <span class="ada-sr-only">Item {{ n }}: </span>{{ title }}
        </h3>
        <ul class="ada-item__tags" aria-label="Item classification">
          <li><span class="ada-pill" :class="`ada-pill--state-${state}`">{{ stateLabel }}</span></li>
          <li v-if="element"><span class="ada-pill ada-pill--neutral">{{ element }}</span></li>
          <li v-for="sc in wcag" :key="sc">
            <span class="ada-pill ada-pill--sc">
              <abbr :title="`WCAG ${sc} ${WCAG[sc]?.[0] ?? ''}`">{{ sc }}</abbr>
            </span>
          </li>
        </ul>
        <p v-if="where" class="ada-item__where"><span class="ada-sr-only">Production location: </span><code>{{ where }}</code></p>
      </div>
    </div>
    <div class="ada-item__body">
      <slot />
    </div>
  </li>
</template>
