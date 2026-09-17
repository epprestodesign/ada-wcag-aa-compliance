<script setup>
// DsImageList — responsive image grid (MUI "Image List"). Built on QImg.
defineProps({
  items: { type: Array, default: () => [] }, // [{ src, title, alt? }]
  cols: { type: Number, default: 3 },
  gap: { type: String, default: '8px' },
})
</script>
<template>
  <div class="ds-image-list" :style="{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }">
    <!-- WCAG 1.1.1: QImg always renders role="img" on its wrapper and maps `alt`
         to aria-label, so an empty alt leaves a nameless role="img" (axe:
         role-img-alt). The caption renders INSIDE the image overlay rather than
         beside it, so the title is the image's name; `it.alt` overrides it, and
         indexed text is the last resort. -->
    <q-img
      v-for="(it, i) in items"
      :key="i"
      :src="it.src"
      :ratio="1"
      :alt="it.alt ?? it.title ?? `Image ${i + 1} of ${items.length}`"
      style="border-radius:4px"
    >
      <div v-if="it.title" class="absolute-bottom text-caption">{{ it.title }}</div>
    </q-img>
  </div>
</template>
