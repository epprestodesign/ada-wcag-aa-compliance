<script setup>
// What a screen reader announces for an element — before vs after.
// Authored from the markup's accessible name/role/state, not a live AT capture.
defineProps({
  before: { type: String, default: '' },
  after: { type: String, default: '' },
  label: { type: String, default: 'Screen reader announces' },
})
</script>

<template>
  <div class="ada-sr">
    <p class="ada-sr__label"><q-icon name="record_voice_over" size="16px" aria-hidden="true" /> {{ label }}</p>
    <dl class="ada-sr__list">
      <template v-if="before">
        <dt>Today</dt>
        <dd class="ada-sr__bad">“{{ before }}”</dd>
      </template>
      <template v-if="after">
        <dt>Proposed</dt>
        <dd class="ada-sr__good">“{{ after }}”</dd>
      </template>
    </dl>
  </div>
</template>
