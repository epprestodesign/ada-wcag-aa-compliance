<script setup>
// DsRating — a compact review-score display: "8.6/10 ★ (1,234)". Read-only
// (for collecting a rating, use Inputs/Rating). Standardizes the score shown on
// listing cards, saved items, the map, confirmation, etc.
import { computed } from 'vue'

const props = defineProps({
  score: { type: [Number, String], required: true },
  max: { type: Number, default: 5 },          // 5 or 10
  reviews: { type: Number, default: null },     // shown as "(1,234)"
  label: { type: String, default: '' },         // e.g. "Excellent"
  showStar: { type: Boolean, default: true },
  showMax: { type: Boolean, default: true },
  size: { type: String, default: 'md' },         // sm | md | lg
  // WCAG 1.1.1: the spoken equivalent of the whole group. Derived from the
  // props by default ("8.6 out of 10, Excellent, 1,234 reviews"); override it
  // when the surrounding context needs a different phrasing.
  ariaLabel: { type: String, default: '' },
})

const SIZES = { sm: '0.8125rem', md: '0.9375rem', lg: '1.0625rem' }
const fontSize = computed(() => SIZES[props.size] || SIZES.md)
const iconSize = computed(() => ({ sm: '14px', md: '16px', lg: '18px' }[props.size] || '16px'))
const reviewsText = computed(() => (props.reviews != null ? `(${Number(props.reviews).toLocaleString()})` : ''))

// "8.6/10 ★ Excellent (1,234)" reads as a run of punctuation and a hidden icon
// font. role="img" + this label makes the group announce as one sentence.
const srLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  const parts = [`${props.score} out of ${props.max}`]
  if (props.label) parts.push(props.label)
  if (props.reviews != null) {
    const n = Number(props.reviews)
    parts.push(`${n.toLocaleString()} ${n === 1 ? 'review' : 'reviews'}`)
  }
  return parts.join(', ')
})
</script>

<template>
  <!-- role="img" collapses the score, star and review count into one accessible
       name (WCAG 1.1.1 / 1.3.1); descendants become presentational. -->
  <span class="ds-rating" :style="{ fontSize }" role="img" :aria-label="srLabel">
    <q-icon v-if="showStar" name="star" :size="iconSize" class="ds-rating__star" />
    <strong class="ds-rating__score">{{ score }}<template v-if="showMax">/{{ max }}</template></strong>
    <span v-if="label" class="ds-rating__label">{{ label }}</span>
    <span v-if="reviewsText" class="ds-rating__reviews">{{ reviewsText }}</span>
  </span>
</template>

<style scoped>
.ds-rating { display: inline-flex; align-items: center; gap: 5px; color: var(--ds-color-text); line-height: 1; }
/* WCAG 1.4.11 / 1.4.3: the star was a literal #f59e0b (Amber 500) at 2.15:1 on
   white — under the 3:1 bar for meaningful non-text, and QIcon draws it as an
   icon-font glyph, i.e. text. Amber 700 clears 4.5:1 (5.02:1). The var hook lets
   the token layer name this role later without touching the component. */
.ds-rating__star { color: var(--ds-color-icon-rating, var(--ds-palette-amber-700)); flex: none; }
.ds-rating__score { font-weight: 700; }
.ds-rating__label { font-weight: 600; }
.ds-rating__reviews { color: var(--ds-color-text-subtle); }
</style>
