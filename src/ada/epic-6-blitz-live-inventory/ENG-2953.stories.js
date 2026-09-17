// ENG-2953 · ADA-BLITZ-RES-04 — Live-inventory reservation modification &
// cancellation: headings, failure banner + label contrast, alert roles, dialog
// naming. Two claims are REFUTED in Linear (title contrast, focus trap).
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2953.linear.md?raw'
import HotelSummaryHeader from '../../presto/components/details/HotelSummaryHeader.vue'
import DsSectionHeader from '../../presto/components/DsSectionHeader.vue'
import DsModal from '../../presto/components/DsModal.vue'
import { popularAmenities } from '../../presto/lib/amenities.js'

export default {
  title: 'Epic 6 – blitz Live Inventory/ADA-BLITZ-RES-04 – Reservation Modification & Cancellation Modal',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2953'),
}

const ID = 'ENG-2953'
const F = 'blitz/src/modules/reservation/components/ReservationModification.vue'

const ITEMS = {
  headings: { n: 1, title: 'Title and hotel name aren’t headings', wcag: ['1.3.1', '2.4.6'], element: 'Headings', where: `${F}:138, :156` },
  titleColor: { n: 2, title: '.my-title #1CA4A3 passes as large text', wcag: ['1.4.3'], state: 'refuted', element: 'Color · title text', where: `${F}:300` },
  failure: { n: 3, title: '.failure-container is 1.78:1', wcag: ['1.4.3'], element: 'Color · error banner', where: `${F}:326-333` },
  greyLabel: { n: 4, title: 'Room-detail labels are #757575 (not #616161) on whitesmoke', wcag: ['1.4.3'], state: 'corrected', element: 'Color · text-grey-7 label', where: `${F} (room-detail labels, text-grey-7)` },
  alerts: { n: 5, title: 'Cancellation banners have no role="alert"', wcag: ['4.1.3'], element: 'Status banner', where: `${F}:129, :132` },
  dialog: { n: 6, title: 'q-dialog has no aria-labelledby; close button has no name', wcag: ['4.1.2'], element: 'Modal · q-dialog', where: `${F}:257, :262-266` },
  focusTrap: { n: '6b', title: '"Focus not trapped or restored" — QDialog does both', wcag: ['2.4.3', '2.1.1'], state: 'refuted', element: 'Modal · focus management', where: `${F}:257` },
}

const hotelHeader = {
  name: 'Hilton Orlando Lake Buena Vista', stars: 4, address: 'Lake Buena Vista, Orlando, FL',
  distance: '2.4 mi from venue', score: 4.5, reviews: 1284, ratingLabel: 'Excellent',
  amenities: popularAmenities(), showMap: false,
}

const CODE = {
  headingsBad: `<!-- ${F}:138 -->
<p class="my-title">Modify Reservation</p>
<!-- ${F}:156 -->
<div class="sub-title">{{ hotelName }}</div>`,
  titleColor: `/* ${F}:300 — leave as is */
.my-title { color: #1CA4A3; font-size: 24px; font-weight: bold; } /* 3.05:1, large text */`,
  failureBad: `/* ${F}:326-333 */
.failure-container { color: #FBA2A2; background: #FFF2F2; }  /* 1.78:1 */`,
  greyBad: `<!-- room-detail label -->
<span class="text-grey-7">Check-in</span>   <!-- $grey-7 = #757575 -->
/* on a whitesmoke (#F5F5F5) panel → 4.23:1 */`,
  alertsBad: `<!-- ${F}:129, :132 -->
<div class="cancel-banner">…</div>   <!-- no role, not announced -->`,
  dialogBad: `<!-- ${F}:257-266 -->
<q-dialog v-model="open">
  <q-card>
    <q-btn flat round icon="close" v-close-popup />   <!-- no aria-label -->
    <p class="my-title">…</p>                         <!-- no id, no heading -->`,
  focusTrap: `<!-- Quasar QDialog defaults: focus moves in, is trapped, and returns to the trigger. -->
<!-- Keep it that way. Don't add these props: -->
<q-dialog v-model="open" />          <!-- ✓ -->
<q-dialog v-model="open" no-focus />  <!-- ✗ -->
<q-dialog v-model="open" no-refocus /><!-- ✗ -->`,
  headingsA: `<h1 class="my-title">Modify Reservation</h1>
<h2 class="sub-title">{{ hotelName }}</h2>`,
  failureA: `.failure-container {
  color: #991B1B;        /* 7.60:1 */
  background: #FEF2F2;
}`,
  greyA: `<span class="room-detail-label">Check-in</span>
.room-detail-label { color: #424242; }  /* Quasar $grey-9, 9.22:1 on #F5F5F5 */`,
  greyB: `.room-detail-label { color: var(--ds-color-text-subtle); } /* Slate 600, 6.95:1 on #F5F5F5 */`,
  alertsA: `<div role="alert" aria-live="assertive" class="cancel-banner">
  <template v-if="cancelled">Your reservation was cancelled.</template>
</div>`,
  dialogA: `<q-dialog v-model="open" aria-labelledby="modify-dialog-title">
  <q-card>
    <q-btn flat round icon="close" aria-label="Close" v-close-popup />
    <h2 id="modify-dialog-title">Modify reservation</h2>
    …
  </q-card>
</q-dialog>`,
  dialogB: `<q-dialog v-model="confirm" role="alertdialog"
          aria-labelledby="cancel-title" aria-describedby="cancel-desc">
  <q-card>
    <h2 id="cancel-title">Cancel this reservation?</h2>
    <p id="cancel-desc">You'll be charged one night plus tax.</p>
    <q-btn label="Keep reservation" autofocus v-close-popup />
    <q-btn label="Cancel reservation" color="negative" @click="cancel" />
  </q-card>
</q-dialog>`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The blitz screen where a guest changes or cancels a live-inventory reservation, and its confirmation dialog. Linear verified each claim: two are refuted (title contrast and focus trapping) and one color was corrected.">

  <ada-item v-bind="I.headings">
    <p>The screen title is a <code>&lt;p&gt;</code> and the hotel name is a <code>&lt;div&gt;</code>, so there are no headings to navigate by.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.headingsBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="One h1 per page; sub-sections use h2.">
      <p>Confirmed.</p>
    </agent-check>
    <agent-check agent="modal-specialist" verdict="refines" rule="Headings inside a modal start at h2; never use h1 inside a dialog.">
      <p>Line 138 comes before the <code>&lt;q-dialog&gt;</code> at line 257, so it looks like page content, and <code>&lt;h1&gt;</code> is right there. Any title inside the dialog itself should be an <code>&lt;h2&gt;</code> (see item 6).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.titleColor">
    <p>An earlier draft flagged the teal title as a contrast failure. Linear refutes this: at 24px bold, the title is WCAG large text, which needs only 3:1, and it measures 3.05:1. The real problem with the title is item 1 (it isn't a heading).</p>
    <contrast-pair fg="#1CA4A3" bg="#FFFFFF" size="large" label=".my-title on white (24px bold)" sample="Modify Reservation" />
    <ada-code tone="neutral" caption="Production — no change" lang="css" :code="CODE.titleColor" />
    <agent-check agent="contrast-master" verdict="refines" rule="Large text (at least 24px, or 18.66px bold) needs 3:1; verify against the actual background.">
      <p>The refutation holds on white: 3.05:1 passes. But if the title ever sits on the whitesmoke (<code>#F5F5F5</code>) panel used for the room details (item 4), it measures <strong>2.80:1</strong> and fails even as large text. Confirm the background before closing this.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.failure">
    <p>Pink text on a pale pink background is almost unreadable. The error message is the one thing on this screen that must be read.</p>
    <contrast-pair fg="#FBA2A2" bg="#FFF2F2" label="Production .failure-container" sample="Modification failed" />
    <ada-code tone="bad" caption="Production" lang="css" :code="CODE.failureBad" />
    <agent-check agent="contrast-master" verdict="agrees" rule="Normal text needs 4.5:1.">
      <p>Confirmed at 1.78:1. Linear's fix, <code>#991B1B</code> on <code>#FEF2F2</code>, measures <strong>7.60:1</strong> (Linear gives no figure).</p>
    </agent-check>
    <agent-check agent="design-system-auditor" verdict="refines" rule="Use named tokens, not one-off hex values.">
      <p>Linear's pair is exactly Presto's <code>--ds-palette-red-800</code> on <code>--ds-color-background-danger</code> (red-50). Use those tokens, and add an error icon so the banner doesn't rely on color alone.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.greyLabel">
    <p>Linear first cited the label color as <code>#616161</code>, but Quasar's <code>$grey-7</code> is actually <code>#757575</code>. With the correct value, the label still fails on the whitesmoke panel.</p>
    <div class="ada-contrast-grid">
      <contrast-pair fg="#757575" bg="#F5F5F5" label="text-grey-7 on whitesmoke" sample="Check-in" />
      <contrast-pair fg="#757575" bg="#FFFFFF" label="Same label on white, for comparison" sample="Check-in" />
    </div>
    <ada-code tone="bad" caption="Production pattern" lang="html" :code="CODE.greyBad" />
    <agent-check agent="contrast-master" verdict="refines" rule="Check every text and background pair where it actually renders.">
      <p>Confirmed at 4.23:1. <code>$grey-7</code> passes on white (4.61:1), so the failure comes from the whitesmoke background, and other screens that use <code>text-grey-7</code> on white are fine. Linear's <code>#424242</code> measures 9.22:1.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.alerts">
    <p>The two cancellation banners appear without a role, so screen-reader users aren't told that a cancellation happened, or failed.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.alertsBad" />
    <agent-check agent="live-region-controller" verdict="refines" rule="role=&quot;alert&quot; is already assertive; alerts already present when content loads aren't announced.">
      <p>Agrees. Adding <code>aria-live="assertive"</code> on top of <code>role="alert"</code> changes nothing but is harmless. Use the role only for banners that appear after the guest acts. A banner that's there from the start (for example, "This reservation is cancelled") won't be announced, so give it a heading or clear text instead.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.dialog">
    <p>The dialog has no accessible name, so screen readers announce just "dialog". The icon-only close button is announced as "button".</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.dialogBad" />
    <sr-output before="dialog … button" after="Cancel this reservation?, dialog … Close, button" />
    <agent-check agent="modal-specialist" verdict="refines" rule="Point aria-labelledby at the dialog heading; an icon-only close button needs aria-label=&quot;Close&quot;; confirmations use alertdialog.">
      <p>Agrees. If this dialog confirms a cancellation, make it an <code>alertdialog</code> and put initial focus on the least destructive action ("Keep reservation"), so pressing Enter can't cancel by accident (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focusTrap">
    <p>An earlier draft said focus wasn't trapped or restored. Linear refutes this: <code>QDialog</code> traps focus and returns it to the trigger by default, and the template doesn't turn that off.</p>
    <ada-code tone="neutral" caption="Quasar default — no change" lang="vue" :code="CODE.focusTrap" />
    <agent-check agent="modal-specialist" verdict="agrees" rule="Focus is trapped inside the modal and returns to the trigger on close.">
      <p>Confirmed against the Quasar source (2.19.3, presto-2026's version, and current 2.x): <code>QDialog.js</code> moves focus in, and uses <code>usePortalRefocus</code> to restore it unless <code>no-focus</code> or <code>no-refocus</code> is set. No change needed.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, HotelSummaryHeader, DsSectionHeader, DsModal },
    setup: () => ({ ID, I: ITEMS, PRESTO, hotelHeader, modalOpen: ref(false) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no modification or cancellation screen. These frames use its hotel header, alerts, section headers and its own modal (DsModal), which replaced QDialog.">

  <ada-item v-bind="I.headings">
    <ada-before status="applies" source="presto-2026 Storybook › Hotel Summary Header › No Map" :href="PRESTO.story('hotel-details-components-hotel-summary-header--no-map')">
      <div style="max-width:1180px"><hotel-summary-header v-bind="hotelHeader" /></div>
      <template #notes><p>The hotel name is <code>&lt;div class="dhead__name"&gt;&lt;span&gt;</code> (<code>HotelSummaryHeader.vue:49-50</code>). It looks like a title but isn't a heading, like blitz.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.titleColor">
    <ada-before status="no-equivalent">
      <template #empty>presto-2026 has no teal title. Its headings use <code>--ds-color-text</code> (Slate 900). Nothing to change either way.</template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.failure">
    <ada-before status="partial" source="presto-2026 Storybook › Alert › Severities" :href="PRESTO.story('components-feedback-status-alert--severities')">
      <div class="ada-flawed" style="display:flex;align-items:flex-start;gap:12px;max-width:560px;padding:14px 16px;background:var(--ds-color-background-danger);border:1px solid var(--ds-color-background-danger-bold);border-radius:12px">
        <q-icon name="error_outline" size="20px" style="color:var(--ds-color-text-danger);margin-top:1px;flex:none" />
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:15px;line-height:1.3;color:var(--ds-color-text-danger)">Payment failed</div>
          <div style="font-size:14px;line-height:1.45;color:var(--ds-color-text-danger);margin-top:2px">Your card was declined. Try another payment method.</div>
        </div>
      </div>
      <contrast-pair fg="#DC2626" bg="#FEF2F2" label="presto --ds-color-text-danger on --ds-color-background-danger" sample="Payment failed" />
      <template #notes>
        <p><strong>Handled:</strong> the error alert already uses the red-50 surface Linear proposes, plus an icon.</p>
        <p><strong>Still present:</strong> its text is <code>--ds-color-text-danger</code> (red-600, <code>#DC2626</code>), which measures <strong>4.41:1</strong> on red-50. That's just under 4.5:1 for 14–15px text. Linear's red-800 would fix presto-2026 too. The markup is recreated from <code>Alert.stories.js</code> (the SEV.error entry).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.greyLabel">
    <ada-before status="partial" source="presto-2026 Storybook › Policies & Property › Policies" :href="PRESTO.story('hotel-details-components-policies-property--policies')">
      <div style="max-width:560px;background:#fff;padding:8px"><ds-section-header title="Property Policies" subtitle="Check-in 3:00 PM · Check-out 11:00 AM" /></div>
      <div class="ada-contrast-grid">
        <contrast-pair fg="#757575" bg="#FFFFFF" label="text-grey-7 on white (as rendered here)" sample="Check-in 3:00 PM" />
        <contrast-pair fg="#757575" bg="#F9F9FA" label="text-grey-7 on presto canvas #F9F9FA" sample="Check-in 3:00 PM" />
      </div>
      <template #notes><p><code>DsSectionHeader.vue:12</code> and <code>DsEmptyState.vue:13</code> use the same <code>text-grey-7</code> (#757575). It passes on white (4.61:1), but on the presto page canvas it drops to 4.38:1 and fails. It's the same trap as blitz's whitesmoke panel.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.alerts">
    <ada-before status="applies" source="presto-2026 Storybook › Alert › Severities" :href="PRESTO.story('components-feedback-status-alert--severities')">
      <ada-code tone="bad" caption="presto-2026 — Alert.stories.js alert() helper" lang="html" code='<div style="display:flex;…;background:\${s.bg};…">   <!-- no role -->
  \${icon}
  <div>…title… …body…</div>
</div>' />
      <template #notes><p>presto's Alert is a styled <code>&lt;div&gt;</code> with no <code>role</code>, so it isn't announced when it appears. (Quasar's own <code>QBanner</code> adds <code>role="alert"</code>, but the Alert story doesn't use it.)</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.dialog">
    <ada-before status="resolved" source="presto-2026 Storybook › Modal › Default" :href="PRESTO.story('components-actions-modal--default')">
      <q-btn unelevated color="primary" no-caps label="Open presto DsModal" @click="modalOpen = true" />
      <ds-modal v-model="modalOpen" title="Cancel this reservation?" size="sm">
        <p style="margin:0">You'll be charged one night plus tax.</p>
      </ds-modal>
      <template #notes><p><code>DsModal.vue:57-66</code> renders <code>role="dialog"</code> and <code>aria-modal="true"</code>, names the dialog from its title, and gives the close button <code>aria-label="Close"</code>. It uses <code>aria-label</code> rather than <code>aria-labelledby</code>, which also gives the dialog a name.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focusTrap">
    <ada-before status="applies" source="presto-2026 › DsModal.vue" :href="PRESTO.story('components-actions-modal--default')">
      <q-btn outline color="primary" no-caps label="Open presto DsModal, then press Tab" @click="modalOpen = true" />
      <template #notes>
        <p><strong>Refuted for blitz, but present in presto-2026.</strong> presto replaced <code>QDialog</code> with its own <code>DsModal</code>, which has no focus handling. <code>DsModal.vue</code> never calls <code>focus()</code>: focus stays on the trigger when the modal opens, Tab can leave the modal, and nothing returns focus when it closes. Only Escape and the backdrop click are handled.</p>
        <p>So when blitz adopts presto-2026 components, it would lose the protection <code>QDialog</code> gives it today.</p>
      </template>
    </ada-before>
  </ada-item>
</ada-issue>`,
  }),
}

/* --------------------------------------------------------------- Proposal */
export const Proposal = {
  parameters: VIEW_PARAMS.proposal,
  render: () => ({
    components: kit,
    setup() {
      const cancelled = ref(false)
      const dlgA = ref(false)
      const dlgB = ref(false)
      const result = ref('')
      const doCancel = () => { dlgB.value = false; result.value = 'Reservation cancelled (demo).' }
      return { ID, I: ITEMS, CODE, cancelled, dlgA, dlgB, result, doCancel }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. The refuted items need no change. Open the dialogs and press Tab to check focus.">

  <ada-item v-bind="I.headings">
    <ada-option letter="A" title="Title as h1, hotel name as h2 (keep .my-title's color)" recommended lang="vue" :code="CODE.headingsA">
      <div class="ada-mini-frame">
        <h1 style="margin:0;color:#1CA4A3;font-size:24px;font-weight:700">Modify Reservation</h1>
        <h2 style="margin:4px 0 0;font-size:18px;font-weight:700;line-height:1.3">Hilton Orlando Lake Buena Vista</h2>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.titleColor">
    <ada-option letter="A" title="No change needed: keep #1CA4A3" recommended lang="css" :code="CODE.titleColor">
      <contrast-pair fg="#1CA4A3" bg="#FFFFFF" size="large" label="Keep: 24px bold teal on white" sample="Modify Reservation" />
      <p class="ada-note" style="margin-top:8px">Linear: "leave <code>.my-title</code>'s color alone, it already passes." Before closing, confirm the title never sits on the <code>#F5F5F5</code> panel (2.80:1).</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.failure">
    <ada-option letter="A" title="Set .failure-container to #991B1B on #FEF2F2" recommended lang="css" :code="CODE.failureA">
      <div class="ada-stack">
        <div style="background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;border-radius:4px;padding:10px 12px;display:flex;gap:8px;align-items:center;max-width:460px">
          <q-icon name="error_outline" size="20px" aria-hidden="true" /> We couldn't modify this reservation. Try again or contact support.
        </div>
        <contrast-pair fg="#991B1B" bg="#FEF2F2" label="Proposed .failure-container (Presto red-800 on red-50)" sample="Modification failed" />
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.greyLabel">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken room-detail labels to #424242" recommended lang="css" :code="CODE.greyA">
        <div style="background:#F5F5F5;padding:12px;border-radius:4px">
          <span style="color:#424242;font-size:14px">Check-in</span>
          <div style="font-weight:700">Wed, Jun 16 · 3:00 PM</div>
        </div>
        <contrast-pair fg="#424242" bg="#F5F5F5" label="#424242 on whitesmoke" sample="Check-in" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Use Presto's subtle-text token instead" lang="css" :code="CODE.greyB">
        <div style="background:#F5F5F5;padding:12px;border-radius:4px">
          <span style="color:#475569;font-size:14px">Check-in</span>
          <div style="font-weight:700">Wed, Jun 16 · 3:00 PM</div>
        </div>
        <contrast-pair fg="#475569" bg="#F5F5F5" label="Slate 600 on whitesmoke" sample="Check-in" />
        <template #why><p>This keeps the labels visibly lighter than the values while clearing 4.5:1 with room to spare, and it's the token presto-2026 already uses for secondary text.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.alerts">
    <ada-option letter="A" title="role=&quot;alert&quot; and aria-live=&quot;assertive&quot; on the cancellation banner" recommended lang="vue" :code="CODE.alertsA">
      <div class="ada-stack ada-focus-demo" style="max-width:460px">
        <div class="ada-row">
          <q-btn unelevated no-caps class="ds-btn--danger" label="Cancel reservation" @click="cancelled = true" />
          <q-btn outline color="primary" no-caps label="Reset" @click="cancelled = false" />
        </div>
        <div role="alert" aria-live="assertive" :style="cancelled ? 'background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;border-radius:4px;padding:10px 12px' : ''">
          <template v-if="cancelled">Your reservation was cancelled. A confirmation email is on its way.</template>
        </div>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.dialog">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-labelledby on q-dialog, aria-label on the close button" recommended lang="vue" :code="CODE.dialogA">
        <div class="ada-focus-demo">
          <q-btn unelevated color="primary" no-caps label="Modify reservation" @click="dlgA = true" />
        </div>
        <q-dialog v-model="dlgA" aria-labelledby="ada-2953-dlg-a-title">
          <q-card style="min-width:320px;max-width:420px" class="ada-focus-demo">
            <q-card-section class="row items-center no-wrap" style="gap:8px">
              <h2 id="ada-2953-dlg-a-title" style="margin:0;font-size:20px;flex:1">Modify reservation</h2>
              <q-btn flat round dense icon="close" aria-label="Close" @click="dlgA = false" />
            </q-card-section>
            <q-card-section style="padding-top:0">Change dates or rooms for Hilton Orlando Lake Buena Vista.</q-card-section>
          </q-card>
        </q-dialog>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="modal-specialist" title="Cancellation as an alertdialog, focus on the safe action" lang="vue" :code="CODE.dialogB">
        <div class="ada-stack ada-focus-demo">
          <div><q-btn unelevated no-caps class="ds-btn--danger" label="Cancel reservation…" @click="dlgB = true" /></div>
          <p class="ada-note" role="status">{{ result }}</p>
        </div>
        <q-dialog v-model="dlgB" role="alertdialog" aria-labelledby="ada-2953-dlg-b-title" aria-describedby="ada-2953-dlg-b-desc">
          <q-card style="min-width:320px;max-width:420px" class="ada-focus-demo">
            <q-card-section>
              <h2 id="ada-2953-dlg-b-title" style="margin:0 0 8px;font-size:20px">Cancel this reservation?</h2>
              <p id="ada-2953-dlg-b-desc" style="margin:0">You'll be charged one night plus tax.</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn outline color="primary" no-caps label="Keep reservation" autofocus @click="dlgB = false" />
              <q-btn unelevated no-caps class="ds-btn--danger" label="Cancel reservation" @click="doCancel" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <template #why><p>Screen readers read the question and its consequence together. Focus starts on "Keep reservation", so an accidental Enter doesn't cancel anything.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.focusTrap">
    <ada-option letter="A" title="No change needed: keep QDialog's default focus handling" recommended lang="vue" :code="CODE.focusTrap">
      <p class="ada-note">Linear: "no focus-trap work needed, Quasar already handles it." Open either dialog in item 6 and press Tab: focus stays inside, and it returns to the button when you close the dialog. If blitz ever moves to presto-2026's <code>DsModal</code>, that component needs focus handling first (see Before).</p>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
