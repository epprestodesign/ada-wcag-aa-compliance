<script setup>
// DsAccordion — expand/collapse rows (FAQ, collapsible filter sections, etc.).
// Pass `items` ([{ title, content }]) for the simple case, or use the default
// slot with <ds-accordion-item>-style markup via the `panels` slot. `multiple`
// allows several open at once; otherwise it behaves like a single-open accordion.
import { ref, useId } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] }, // [{ title, content }]
  multiple: { type: Boolean, default: true },
  defaultOpen: { type: Array, default: () => [] }, // indexes open initially
})

// WCAG 1.3.1 / 4.1.2 — aria-expanded alone doesn't say WHAT expands; each
// trigger points at its panel, and the panel is a region named by its trigger.
const uid = useId()
const rowId = (i) => `dsa-${uid}-${i}`
const open = ref(new Set(props.defaultOpen))
const isOpen = (i) => open.value.has(i)
const toggle = (i) => {
  const next = new Set(props.multiple ? open.value : [])
  if (open.value.has(i)) next.delete(i)
  else next.add(i)
  open.value = next
}
</script>

<template>
  <div class="dsa">
    <div v-for="(item, i) in items" :key="i" class="dsa__row">
      <button :id="`${rowId(i)}-q`" class="dsa__q" type="button" :aria-expanded="isOpen(i)" :aria-controls="`${rowId(i)}-a`" @click="toggle(i)">
        <span class="dsa__title">{{ item.title }}</span>
        <q-icon :name="isOpen(i) ? 'remove' : 'add'" size="20px" class="dsa__icon" aria-hidden="true" />
      </button>
      <div :id="`${rowId(i)}-a`" v-show="isOpen(i)" class="dsa__a" role="region" :aria-labelledby="`${rowId(i)}-q`"><slot name="content" :item="item" :index="i">{{ item.content }}</slot></div>
    </div>
  </div>
</template>

<style scoped>
.dsa { border-top: 1px solid var(--ds-color-border); }
.dsa__row { border-bottom: 1px solid var(--ds-color-border); }
.dsa__q { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 16px 0; background: none; border: 0; text-align: left; cursor: pointer; }
.dsa__title { font-weight: 700; font-size: 0.9375rem; color: var(--ds-color-text); }
.dsa__icon { flex: none; color: var(--ds-color-text-subtle); }
.dsa__a { padding: 0 0 16px; color: var(--ds-color-text-subtle); font-size: 0.875rem; line-height: 1.55; }
</style>
