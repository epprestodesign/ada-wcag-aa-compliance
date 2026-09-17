<script setup>
// DisplayAd — an advertising slot. With no `src` it renders the dashed
// placeholder box in the brand (primary) color that labels its own dimensions
// (the original behaviour, unchanged). Default is 340×215.
//
// ds-impact "DisplayAd has no image, link or alt-text contract" (ENG-2923,
// WCAG 1.1.1 Non-text Content, 2.4.4 Link Purpose): a real ad needs an image, a
// name that comes from the ad record, and a link only when it has a destination.
// `redirectURL` is optional in the ad data, so the anchor is rendered ONLY when
// a URL exists — an <a> without href is not a link and cannot be tabbed to.
const props = defineProps({
  width: { type: Number, default: 340 },
  height: { type: Number, default: 215 },
  // Override the auto label ("Display Ad {w}x{h}").
  label: { type: String, default: '' },
  // Real ad artwork. Omit for the placeholder box (today's default behaviour).
  src: { type: String, default: '' },
  // WCAG 1.1.1: the ad's own alt text, from the ad record — never a generic
  // "Display Image". When the ad is linked this names the LINK too (2.4.4), so
  // it should describe the destination ("Fredericksburg Sportsplex: parking").
  // An empty string is honoured as decorative-only (alt="").
  altText: { type: String, default: '' },
  // Optional click-through. No URL → a plain <img>, never an empty anchor.
  redirectURL: { type: String, default: '' },
})
const placeholderLabel = () => props.label || `Display Ad ${props.width}x${props.height}`
</script>

<template>
  <!-- Real ad: linked image when there's a destination … -->
  <a
    v-if="src && redirectURL"
    :href="redirectURL"
    class="dad__link"
    :style="{ width: width + 'px' }"
  >
    <img :src="src" :alt="altText" :width="width" :height="height" class="dad__img" />
  </a>
  <!-- … otherwise a bare image (no href means it is not a link). -->
  <img
    v-else-if="src"
    :src="src"
    :alt="altText"
    :width="width"
    :height="height"
    class="dad__img"
  />
  <!-- Placeholder slot (unchanged default). -->
  <div
    v-else
    class="dad"
    :style="{ width: width + 'px', height: height + 'px' }"
    role="img"
    :aria-label="placeholderLabel()"
  >
    <span class="dad__label">{{ placeholderLabel() }}</span>
  </div>
</template>

<style scoped>
.dad {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  border: 2px dotted var(--ds-color-background-brand-bold);
  border-radius: var(--ds-radius-md);
  color: var(--ds-color-background-brand-bold);
  background: transparent;
}
.dad__label {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.dad__link { display: block; border-radius: var(--ds-radius-md); }
.dad__img { display: block; max-width: 100%; height: auto; border-radius: var(--ds-radius-md); object-fit: cover; }
</style>
