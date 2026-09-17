<script setup>
// GalleryHero — the hero photo mosaic at the top of the hotel detail screen
// (ported from the prototype): one large image spanning two rows on the left
// with a 2×2 cluster on the right, and a "See all N photos" pill that opens a
// full gallery modal. The modal grid reuses the DsImageList primitive.
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import DsImageList from '../DsImageList.vue'

const $q = useQuasar()
// Phones: the gallery is a single top-down column (scroll through every photo);
// desktop keeps the 3-up grid.
const modalCols = computed(() => ($q.screen.lt.sm ? 1 : 3))

const props = defineProps({
  images: { type: Array, default: () => [] },       // [{ src, title }] — mosaic uses up to 5
  allImages: { type: Array, default: () => [] },     // modal grid; defaults to `images`
  modalTitle: { type: String, default: 'Photo gallery' },
  height: { type: String, default: '380px' },
})

const mosaic = computed(() => props.images.slice(0, 5))
const all = computed(() => (props.allImages.length ? props.allImages : props.images))
const totalCount = computed(() => all.value.length)

const open = ref(false)
// WCAG 2.4.3 / 2.1.2 — the all-photos modal is hand-rolled (it predates
// DsModal), so it manages its own focus: focus moves into the dialog on open,
// Tab cycles inside it, and focus returns to the control that opened it.
const dialog = ref(null)
const closeBtn = ref(null)
const opener = ref(null)
const show = async (e) => {
  opener.value = e?.currentTarget || document.activeElement
  open.value = true
  await nextTick()
  closeBtn.value?.focus()
}
const close = () => {
  if (!open.value) return
  open.value = false
  opener.value?.focus?.()
}
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
const onKey = (e) => {
  if (!open.value) return
  if (e.key === 'Escape') { close(); return }
  if (e.key !== 'Tab') return
  const items = [...(dialog.value?.querySelectorAll(FOCUSABLE) || [])].filter((el) => el.offsetParent !== null)
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="gh">
    <!-- WCAG 4.1.2 / 2.1.1 / 1.1.1 — each tile is a native <button> (was a
         div role="button" named only by the image alt, so Space didn't work and
         the name was just "Exterior"). The photo is decorative inside a named
         control, so its alt is empty and the button carries the purpose. -->
    <div class="gh__grid" :style="{ height }">
      <button
        v-for="(img, i) in mosaic"
        :key="i"
        type="button"
        class="gh__cell"
        :class="{ 'gh__cell--lead': i === 0, 'gh__cell--more': i === mosaic.length - 1 }"
        :aria-label="img.title ? `Open photo gallery — ${img.title}` : 'Open photo gallery'"
        @click="show"
      >
        <img :src="img.src" alt="" class="gh__img" />
      </button>
      <!-- The pill used to live INSIDE the last tile, nesting a button in a
           role="button" (axe: nested-interactive). It is a sibling now, anchored
           to the grid's bottom-right — the same spot on screen. -->
      <button
        v-if="totalCount"
        type="button"
        class="gh__pill gh__pill--grid"
        @click="show"
      ><q-icon name="photo_library" size="16px" aria-hidden="true" /> See all {{ totalCount }} photos</button>
    </div>

    <!-- Phones: a single static hero photo — no carousel. The pinned pill is the
         only way to browse the set, and it opens the full-screen all-photos view. -->
    <button v-if="totalCount" type="button" class="gh__pill gh__pill--fixed" @click="show"><q-icon name="photo_library" size="16px" /> See all {{ totalCount }} photos</button>

    <!-- All-photos modal — grid reuses DsImageList -->
    <div v-if="open" class="gh__modal" @click.self="close">
      <div ref="dialog" class="gh__dialog" role="dialog" aria-modal="true" :aria-label="modalTitle">
        <div class="gh__head">
          <h2 class="gh__title">{{ modalTitle }}</h2>
          <button ref="closeBtn" type="button" class="gh__close" aria-label="Close gallery" @click="close"><q-icon name="close" size="22px" /></button>
        </div>
        <!-- WCAG 2.1.1 — the photo grid scrolls, so the region itself has to be
             reachable (and nameable) by keyboard; without tabindex a keyboard-only
             user can't scroll it, since it holds no focusable children. -->
        <div class="gh__body" tabindex="0" role="group" :aria-label="modalTitle">
          <ds-image-list :items="all" :cols="modalCols" gap="8px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* position: relative — the "See all photos" pill is now a sibling of the tiles
   and anchors to the grid instead of nesting inside the last one. */
.gh__grid { position: relative; display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; border-radius: var(--ds-radius-lg); overflow: hidden; }
/* The tiles are <button>s now — strip the UA chrome so they look like the
   plain photo cells they replace. */
.gh__cell { position: relative; min-height: 0; width: 100%; padding: 0; border: 0; background: var(--ds-palette-slate-100); cursor: pointer; display: block; overflow: hidden; font: inherit; color: inherit; text-align: left; }
.gh__cell--lead { grid-row: 1 / 3; }
.gh__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gh__pill { position: absolute; right: 12px; bottom: 12px; display: inline-flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.6); color: #fff; border: 0; border-radius: var(--ds-radius-pill); padding: 6px 14px; font-family: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: background var(--ds-duration-fast) var(--ds-ease-standard); }
.gh__pill:hover { background: rgba(0,0,0,0.78); }

/* The .gh box is the positioning context for the pinned pill, which is hidden on
   desktop (the mosaic shows its own in-cell pill). */
.gh { position: relative; }
/* The pinned pill reuses .gh__pill (dark, bottom-right) but anchors to .gh rather
   than a single cell, so it sits on the phone hero photo. */
.gh__pill--fixed { display: none; z-index: 2; }
/* Desktop/tablet pill — same bottom-right position it had inside the last tile. */
.gh__pill--grid { z-index: 2; }

/* Modal */
.gh__modal { position: fixed; inset: 0; z-index: 3000; background: rgba(9,9,11,0.45); display: flex; align-items: center; justify-content: center; padding: 24px; }
.gh__dialog { background: var(--ds-color-surface); width: 920px; max-width: 94vw; max-height: 90vh; border-radius: var(--ds-radius-lg); box-shadow: var(--ds-shadow-4); display: flex; flex-direction: column; overflow: hidden; }
.gh__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--ds-color-border); }
.gh__title { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--ds-color-text); }
.gh__close { width: 40px; height: 40px; border: 0; border-radius: 50%; background: var(--ds-palette-slate-100); color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.gh__close:hover { background: var(--ds-palette-slate-200); }
.gh__body { padding: 20px; overflow-y: auto; }

@media (max-width: 860px) {
  .gh__grid { grid-template-columns: 1fr 1fr; height: auto !important; }
  .gh__cell--lead { grid-row: auto; }
  .gh__cell { aspect-ratio: 4 / 3; }
}
/* Phones (<600px): ONE static hero photo — no carousel, no swiping, no arrows.
   Browsing happens only through "See all N photos", which opens the full-screen
   modal. The photo runs square to the screen edges (no rounding), matching
   production's details header. */
@media (max-width: 600px) {
  .gh__grid { display: block; border-radius: 0; height: auto !important; }
  .gh__cell { aspect-ratio: 4 / 3; }
  .gh__cell--lead { grid-row: auto; }
  /* Only the lead photo shows; the rest live in the all-photos modal. */
  .gh__cell:not(.gh__cell--lead) { display: none; }
  /* Show the pinned pill; hide the per-cell one. */
  .gh__pill--fixed { display: inline-flex; }
  .gh__pill--grid { display: none; }
  .gh__modal { padding: 0; }
  .gh__dialog { width: 100vw; max-width: 100vw; height: 100vh; max-height: 100vh; border-radius: 0; }
}
</style>
