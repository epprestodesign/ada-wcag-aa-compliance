// ENG-2948 · ADA-PLAT-MGMT-04 — Reservation cancellation dialog & deadline
// alert modal: duplicate heading id behind aria-labelledby, <a data-method>
// cancel action plus a hidden twin button, (unverified) focus return.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2948.linear.md?raw'
import DsModal from '../../presto/components/DsModal.vue'

export default {
  title: 'Epic 5 – platform Order Management/ADA-PLAT-MGMT-04 – Cancellation Dialog & Waive Fee Modal',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2948'),
}

const ID = 'ENG-2948'
const FILE = 'platform/app/templates/admin/partials/cancel_reservation_modal.plush.html'

const ITEMS = {
  ids: { n: 1, state: 'corrected', title: 'Two modals, two <h5>s, one shared id', wcag: ['4.1.2', '4.1.1'], element: 'Modal · accessible name', where: `${FILE}:48, :50, :55, :86, :91` },
  action: { n: 2, title: 'Cancel action is an <a data-method="PATCH">, with a hidden twin <button>', wcag: ['4.1.2', '2.1.1'], element: 'Button · Cancel Reservation', where: `${FILE}:78 (hidden button), :79 (link)` },
  focus: { n: 3, state: 'unverified', title: 'Does focus return to the trigger when the modal closes?', wcag: ['2.4.3'], element: 'Modal · focus return (Bootstrap JS)', where: 'Bootstrap modal JS (not in the reviewed template)' },
}

const RES = { hotel: 'Days Inn by Wyndham Carson City', pipeId: '72055771948934', fee: '$128.00', deadline: 'Thu, 06/24/2027 at 4:00 PM' }

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="One partial renders two Bootstrap modals side by side: the Cancel Reservation confirmation and a 'deadline passed / waive fee' alert. Both render whenever the reservation isn't already canceled (line 48).">

  <ada-item v-bind="I.ids">
    <p><em>Corrected:</em> this is worse than a mis-pointed reference. Both modals set <code>aria-labelledby="cancelReservationModalLabel"</code>, and <strong>both</strong> headings carry that id. The browser resolves the id to the first match, so the deadline alert is also announced as "Cancel Reservation".</p>
    <ada-code tone="bad" caption="Production pattern — cancel_reservation_modal.plush.html:48-91" code='<%= if (!order.IsCanceled) { %>                                          <!-- L48 -->
<div class="modal fade" id="cancelReservationModal" role="dialog"
     aria-labelledby="cancelReservationModalLabel">                      <!-- L50 -->
  … <h5 class="modal-title" id="cancelReservationModalLabel">Cancel Reservation</h5>  <!-- L55 -->
</div>
<div class="modal fade" id="deadlineCancellationAlert" role="dialog"
     aria-labelledby="cancelReservationModalLabel">                      <!-- L86 -->
  … <h5 class="modal-title" id="cancelReservationModalLabel">ALERT!</h5>              <!-- L91 -->
</div>
<% } %>' />
    <sr-output before="Cancel Reservation, dialog  (on the deadline ALERT! modal)" after="Cancellation deadline has passed, alert dialog" />
    <agent-check agent="aria-specialist" verdict="refines" rule="aria-controls / aria-labelledby must point to valid, existing, unique IDs.">
      <p>Agrees. Note that <strong>4.1.1 Parsing is obsolete in WCAG 2.2</strong> and treated as always satisfied for HTML, so the duplicate id alone isn't a 2.2 failure. What <em>does</em> fail is <strong>4.1.2</strong>: the duplicate makes <code>aria-labelledby</code> resolve to the wrong heading, giving the deadline modal the wrong name. Track the fix under 4.1.2.</p>
    </agent-check>
    <agent-check agent="modal-specialist" verdict="refines" rule="aria-labelledby → a valid heading id; modal headings start at H2; alert dialogs use role=&quot;alertdialog&quot; + aria-describedby.">
      <p>Beyond the unique id: "ALERT!" is a poor dialog name even when it's wired correctly. Use a descriptive title (e.g. "Cancellation deadline has passed"). This modal interrupts to demand a decision, so use <code>role="alertdialog"</code> with <code>aria-describedby</code> on its short explanation. The <code>&lt;h5&gt;</code>s should be <code>&lt;h2&gt;</code>, styled as needed.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.action">
    <p>The destructive action is a link that rails-ujs turns into a PATCH. Screen readers announce "link", which suggests navigation, and links don't activate with <kbd>Space</kbd>. <em>New:</em> line 78 keeps a hidden <code>&lt;button&gt;</code> with the same text "Cancel Reservation". If the <code>disable-button</code> controller toggles visibility, assistive tech can briefly find two controls with the same name.</p>
    <ada-code tone="bad" caption="Production pattern — cancel_reservation_modal.plush.html:78-79" code='<button class="btn btn-danger d-none" disabled>Cancel Reservation</button>   <!-- L78 -->
<a href="<%= cancelOrderPath({order_id: order.ID}) %>" data-method="PATCH"
   class="btn btn-danger" data-controller="disable-button">Cancel Reservation</a>  <!-- L79 -->' />
    <sr-output before="link, Cancel Reservation" after="button, Cancel reservation" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Actions that change data are buttons: Enter and Space both activate them. Hidden duplicates must be removed from the DOM or made inert.">
      <p>Confirmed. A real <code>&lt;button type="submit"&gt;</code> in a <code>&lt;form&gt;</code> also works without JavaScript, which the <code>data-method</code> link doesn't.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focus">
    <p><strong>Not verifiable from the template.</strong> Whether focus returns to the "Cancel Reservation" trigger on dismiss depends on Bootstrap's modal JS and how the modals are opened.</p>
    <agent-check agent="modal-specialist" verdict="refines" rule="When a modal closes, focus MUST return to the element that opened it, on Escape, Close and any dismissing action.">
      <p>Agrees it must be checked. Bootstrap's data-API (<code>data-toggle</code>/<code>data-bs-toggle="modal"</code>) normally returns focus to the trigger on <code>hidden</code>, but only if the trigger is still visible. It does <em>not</em> when the modal is opened programmatically (<code>.modal('show')</code>). So check: (1) how each modal is opened, and (2) where focus goes after "Cancel Reservation" submits, since the trigger may be gone once the reservation is canceled. In that case, focus the page's status message instead.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, DsModal },
    setup: () => ({ ID, I: ITEMS, PRESTO, RES, openA: ref(false), openB: ref(false) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no cancellation flow. Its canonical dialog shell is DsModal (DsSidePanel for sheets), which any future cancel dialog would use. Open the modals below and press Tab / Escape to try them.">

  <ada-item v-bind="I.ids">
    <ada-before status="resolved" source="presto-2026 Storybook › Components / Actions / Modal" :href="PRESTO.story('components-actions-modal--default')">
      <q-btn outline color="primary" no-caps label="Open DsModal (Cancel reservation)" @click="openA = true" />
      <ds-modal v-model="openA" title="Cancel reservation" size="sm">
        <p style="margin:0">Cancel your stay at {{ RES.hotel }}?</p>
      </ds-modal>
      <template #notes>
        <p>DsModal names the dialog with <code>aria-label</code> copied from its <code>title</code> prop (DsModal.vue:32, :57), not with id references, so two modals on one page can't collide. DsSidePanel does the same (DsSidePanel.vue:35).</p>
        <p>Trade-off: <code>aria-label</code> is a second copy of the title. Custom <code>#header</code> slots can drift from it; <code>aria-labelledby</code> with a <code>useId()</code> id would keep them in sync.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.action">
    <ada-before status="no-equivalent" source="presto-2026 › DsModal.vue / ProfileEditModal.vue">
      <template #empty>presto-2026 has no cancel-reservation or waive-fee dialog, so there's no cancel action to compare.</template>
      <template #notes><p>For reference, presto dialog actions are native buttons: DsModal's close is <code>&lt;button type="button"&gt;</code> (DsModal.vue:59, :66), and ProfileEditModal's Cancel/Save are <code>&lt;button&gt;</code>s (ProfileEditModal.vue:100-101). No link-as-action pattern.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-before status="applies" source="presto-2026 Storybook › Components / Actions / Modal" :href="PRESTO.story('components-actions-modal--with-footer')">
      <q-btn outline color="primary" no-caps label="Open DsModal, then press Escape" @click="openB = true" />
      <ds-modal v-model="openB" title="Cancellation deadline has passed" size="sm">
        <p style="margin:0">A {{ RES.fee }} fee applies because the deadline was {{ RES.deadline }}.</p>
        <template #footer="{ close }">
          <button type="button" class="q-btn" style="padding:8px 14px" @click="close">Keep reservation</button>
          <button type="button" class="q-btn" style="padding:8px 14px" @click="close">Cancel anyway</button>
        </template>
      </ds-modal>
      <template #notes>
        <p>Verifiable here: DsModal (and DsSidePanel) never call <code>focus()</code>. On open, focus stays on the trigger behind the backdrop. <kbd>Tab</kbd> isn't trapped, so it walks the page underneath. On close, nothing restores focus (DsModal.vue:34-51). <code>aria-modal="true"</code> is set, but nothing makes the background <code>inert</code>.</p>
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
      const cancelOpen = ref(false)
      const deadlineOpen = ref(false)
      const canceled = ref(false)
      const status = ref('')
      const doCancel = () => { canceled.value = true; status.value = `Reservation at ${RES.hotel} canceled (demo).` }
      const undo = () => { canceled.value = false; status.value = '' }
      // Native <dialog> demo (Option B, item 3).
      const dlg = ref(null)
      const opener = ref(null)
      const keepBtn = ref(null)
      const openNative = async () => { dlg.value?.showModal(); await nextTick(); keepBtn.value?.focus() }
      const closeNative = () => { dlg.value?.close() }
      const onNativeClose = () => { opener.value?.focus() }
      return { ID, I: ITEMS, RES, cancelOpen, deadlineOpen, canceled, status, doCancel, undo, dlg, opener, keepBtn, openNative, closeNative, onNativeClose }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in each item is the fix from Linear's acceptance criteria. The dialogs are real Quasar q-dialogs: they trap focus, close on Escape and return focus to their trigger.">

  <ada-item v-bind="I.ids">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Unique heading id per modal; point each aria-labelledby at its own" recommended
        code='<div class="modal fade" id="cancelReservationModal" role="dialog"
     aria-labelledby="cancelReservationModalLabel">
  … <h5 class="modal-title" id="cancelReservationModalLabel">Cancel Reservation</h5>
</div>
<div class="modal fade" id="deadlineCancellationAlert" role="dialog"
     aria-labelledby="deadlineCancellationAlertLabel">
  … <h5 class="modal-title" id="deadlineCancellationAlertLabel">ALERT!</h5>
</div>'>
        <div class="ada-row ada-focus-demo">
          <q-btn outline color="primary" no-caps label="Cancel Reservation…" aria-haspopup="dialog" @click="cancelOpen = true" />
          <q-btn outline color="primary" no-caps label="Show deadline alert" aria-haspopup="dialog" @click="deadlineOpen = true" />
        </div>
        <p class="ada-note" style="margin-top:8px">Each dialog is named by its own heading id: <code>ada-2948-cancel-title</code> / <code>ada-2948-deadline-title</code>.</p>

        <q-dialog v-model="cancelOpen" aria-labelledby="ada-2948-cancel-title">
          <q-card style="max-width:420px;width:100%" class="ada-focus-demo">
            <q-card-section>
              <h2 id="ada-2948-cancel-title" style="margin:0;font-size:20px;line-height:1.3">Cancel Reservation</h2>
              <p style="margin:8px 0 0">Cancel your stay at {{ RES.hotel }} (Pipe ID {{ RES.pipeId }})?</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat no-caps color="primary" label="Keep reservation" data-autofocus @click="cancelOpen = false" />
              <q-btn unelevated no-caps color="negative" label="Cancel reservation" @click="cancelOpen = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="deadlineOpen" aria-labelledby="ada-2948-deadline-title">
          <q-card style="max-width:420px;width:100%" class="ada-focus-demo">
            <q-card-section>
              <h2 id="ada-2948-deadline-title" style="margin:0;font-size:20px;line-height:1.3">ALERT!</h2>
              <p style="margin:8px 0 0">The free-cancellation deadline was {{ RES.deadline }}. A {{ RES.fee }} fee applies unless it is waived.</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat no-caps color="primary" label="Close" data-autofocus @click="deadlineOpen = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="modal-specialist" title="alertdialog with a descriptive title and aria-describedby"
        code='<div class="modal fade" id="deadlineCancellationAlert"
     role="alertdialog" aria-modal="true"
     aria-labelledby="deadlineCancellationAlertLabel"
     aria-describedby="deadlineCancellationAlertDesc">
  <h2 class="modal-title h5" id="deadlineCancellationAlertLabel">
    Cancellation deadline has passed
  </h2>
  <p id="deadlineCancellationAlertDesc">A $128.00 fee applies unless it is waived.</p>
  <button type="button" data-dismiss="modal">Keep reservation</button>
  <button type="submit" form="waiveFeeForm">Waive fee and cancel</button>
</div>'>
        <template #why><p>The deadline modal asks for a decision, so <code>alertdialog</code> makes screen readers read both the title and the description when it opens. "ALERT!" becomes a name that says what happened, and the heading moves to <code>&lt;h2&gt;</code>.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.action">
    <ada-option letter="A" title="A real <button type=&quot;submit&quot;> in a PATCH form; remove the hidden twin (L78) from the DOM" recommended
      code='<form action="<%= cancelOrderPath({order_id: order.ID}) %>" method="POST"
      data-controller="disable-button">
  <input type="hidden" name="_method" value="PATCH">
  <%= csrf() %>
  <button type="submit" class="btn btn-danger"
          data-disable-button-target="button">Cancel reservation</button>
</form>
<!-- L78 hidden duplicate button: deleted.
     disable-button controller sets the disabled attribute on this same button instead. -->'>
      <form class="ada-focus-demo ada-row" style="align-items:center" @submit.prevent="doCancel">
        <q-btn type="submit" unelevated no-caps color="negative" label="Cancel reservation" :disable="canceled" />
        <q-btn v-if="canceled" flat no-caps color="primary" label="Reset demo" @click="undo" />
      </form>
      <p role="status" class="ada-note" style="margin-top:8px;min-height:1.5em">{{ status }}</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.focus">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Verify Bootstrap returns focus; add a hidden-event handler if not" recommended lang="js"
        code='// Only needed if the modal is opened programmatically (.modal("show"))
// or the trigger is re-rendered. Bootstrap data-API triggers already refocus.
let lastTrigger
$("#cancelReservationModal, #deadlineCancellationAlert")
  .on("show.bs.modal", (e) => { lastTrigger = e.relatedTarget || document.activeElement })
  .on("hidden.bs.modal", () => { lastTrigger?.focus() })'>
        <p class="ada-note">The item 1 demo shows the target behavior: open either dialog, press <kbd>Escape</kbd>, and focus is back on the button that opened it.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="modal-specialist" title="Native <dialog>: focus the least-destructive action, return focus on close" lang="js"
        code='<button id="cancelTrigger" aria-haspopup="dialog">Cancel Reservation…</button>
<dialog id="cancelDialog" aria-labelledby="cancelDialogTitle">
  <h2 id="cancelDialogTitle">Cancel reservation?</h2>
  <button id="keep">Keep reservation</button>
  <button type="submit" form="cancelForm">Cancel reservation</button>
</dialog>

trigger.onclick = () => { dialog.showModal(); keep.focus() }
dialog.onclose  = () => trigger.focus()'>
        <div class="ada-focus-demo">
          <button ref="opener" type="button" class="q-btn q-btn--outline" aria-haspopup="dialog"
            style="padding:8px 14px;border:1px solid currentColor;border-radius:4px;color:#01113E;background:#fff;cursor:pointer" @click="openNative">Cancel Reservation…</button>
          <dialog ref="dlg" aria-labelledby="ada-2948-native-title" style="border:0;border-radius:8px;padding:20px;max-width:380px" @close="onNativeClose">
            <h2 id="ada-2948-native-title" style="margin:0;font-size:20px">Cancel reservation?</h2>
            <p style="margin:8px 0 16px">{{ RES.hotel }} · Pipe ID {{ RES.pipeId }}</p>
            <div class="ada-row">
              <button ref="keepBtn" type="button" style="padding:8px 14px;border:1px solid #01113E;border-radius:4px;background:#fff;color:#01113E;cursor:pointer" @click="closeNative">Keep reservation</button>
              <button type="button" style="padding:8px 14px;border:0;border-radius:4px;background:#B91C1C;color:#fff;cursor:pointer" @click="closeNative">Cancel reservation</button>
            </div>
          </dialog>
        </div>
        <template #why><p><code>showModal()</code> traps focus and handles <kbd>Escape</kbd> natively. Focus starts on "Keep reservation", so pressing <kbd>Enter</kbd> by accident can't cancel a stay, and the <code>close</code> event puts focus back on the trigger however the dialog was dismissed.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
