// ENG-2927 · ADA-FUSE-05 — Contracted Checkout Funnel & Guest Intake: detached
// field labels, silent validation failure, unlabeled agreement checkbox,
// unlabeled special-request dialog.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2927.linear.md?raw'
import PaymentForm from '../../presto/components/checkout/PaymentForm.vue'
import StepContactInfo from '../../presto/components/checkout/steps/StepContactInfo.vue'
import PoliciesAgreement from '../../presto/components/checkout/PoliciesAgreement.vue'
import { policies as detailPolicies } from '../../presto/stories/details/_detail-data.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-05 – Contracted Checkout Funnel & Guest Intake',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2927'),
}

const ID = 'ENG-2927'

const ITEMS = {
  labels: { n: 1, title: 'Guest, email, card and billing fields use detached labels', wcag: ['1.3.1', '3.3.2', '4.1.2'], element: 'Form fields · q-input', where: 'ContractedGuestDetails.vue · ContractedEmailAddress.vue · CardInformation.vue · BillingInformation.vue' },
  validation: { n: 2, title: 'A failed submit gives no feedback at all', wcag: ['3.3.1', '2.4.3'], element: 'Form · q-form submit', where: 'fuse/src/modules/reservation/views/ContractedCheckoutView.vue:173' },
  agree: { n: 3, title: 'Policy agreement checkbox has no label', wcag: ['4.1.2', '3.3.2'], element: 'Checkbox · q-checkbox', where: 'fuse/src/modules/reservation/components/checkout/GuestAgreement.vue:19' },
  special: { n: 4, title: 'Special-request textarea and close button are unlabeled', wcag: ['3.3.2', '4.1.2'], element: 'Modal · textarea + close button', where: 'SpecialRequestDialog.vue:27-34 (textarea), :16-20 (close button)' },
}

// Contact step sample — one room from the booking widget (StepContactInfo.stories.js).
const contactRooms = [{ adults: 1, children: 0 }]
const agreementHotels = [{ policies: detailPolicies.slice(5, 7) }]

const CODE = {
  labelsBad: `<q-item-label class="text-secondary text-caption">First name</q-item-label>
<q-input v-model="guest.firstName" :placeholder="t('firstName')" outlined dense />`,
  validationBad: `<q-form ref="checkoutForm" @submit="onSubmit">   <!-- L173: no @validation-error -->
  …
  <q-btn type="submit" label="Complete Booking" />
</q-form>`,
  agreeBad: `<q-checkbox v-model="agreed" />                <!-- L19: no label / aria-label -->
<span>I agree to the reservation policies…</span>`,
  specialBad: `<q-btn flat round icon="close" v-close-popup />        <!-- L16-20 -->
…
<q-input v-model="request" type="textarea" outlined />  <!-- L27-34 -->`,
  prestoSpecial: `<!-- presto-2026 ReservationGuests.vue:166-169 — inline, not a dialog -->
<label class="cgf__field cgf__field--full">
  <span>Special requests <em>(optional)</em></span>
  <textarea v-model="room.specialRequests" rows="3" placeholder="Early check-in, …" />
</label>`,
  labelsFix: `<q-input v-model="guest.firstName" label="First name *" outlined
  autocomplete="given-name" :rules="[required]" lazy-rules />
<q-input v-model="card.number" label="Card number *" outlined
  autocomplete="cc-number" inputmode="numeric" :rules="[required]" lazy-rules />`,
  labelsNative: `<fieldset>
  <legend>Billing address</legend>
  <label for="bill-line1">Address line 1 <span aria-hidden="true">*</span></label>
  <input id="bill-line1" autocomplete="address-line1" required
    aria-describedby="bill-line1-err" :aria-invalid="!!err.line1">
  <p id="bill-line1-err" v-if="err.line1">Enter the street address</p>
</fieldset>`,
  validationFix: `<q-form ref="checkoutForm" @submit="onSubmit" @validation-error="onInvalid">

function onInvalid (field) {
  field.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  field.focus()
}`,
  validationSummary: `<div v-if="errors.length" ref="summary" tabindex="-1"
     aria-labelledby="err-h" class="error-summary">
  <h2 id="err-h">There are {{ errors.length }} problems</h2>
  <ul>
    <li v-for="e in errors"><a :href="'#' + e.id" @click.prevent="focus(e.id)">{{ e.msg }}</a></li>
  </ul>
</div>
// on submit: await nextTick(); summary.value.focus()`,
  agreeFix: `<q-checkbox v-model="agreed"
  aria-label="I agree to the reservation policies" />
<span>I agree to the reservation policies…</span>`,
  agreeLabel: `<q-checkbox v-model="agreed"
  label="I have read and agree to the reservation policies" />`,
  specialFix: `<q-btn flat round icon="close" aria-label="Close" v-close-popup />
…
<q-input v-model="request" type="textarea" outlined
  label="Special requests (optional)" />`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The contracted checkout has its own guest-intake components, separate from the Live flow's GuestDetails.vue (ADA-FUSE-06), with the same label bug. On top of that, a failed submit does nothing a user can see or hear.">

  <ada-item v-bind="I.labels">
    <p>Each field has a small caption <em>above</em> it, but the caption isn't connected to the input. The input shows only a placeholder. Screen readers read the input as an unnamed text box, or fall back to placeholder text that disappears once you type.</p>
    <ada-code tone="bad" caption="Production pattern — every guest / email / card / billing field" :code="CODE.labelsBad" />
    <sr-output before="edit text, blank" after="First name, required, edit text" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Every form control must have a programmatically associated label; visual proximity is not enough; never use placeholder as the only label.">
      <p>Confirmed across all four components. Quasar's <code>label</code> prop renders a real <code>&lt;label&gt;</code> for the input.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Group related inputs with fieldset/legend; use required + autocomplete tokens; link errors with aria-describedby and aria-invalid.">
      <p>Labels alone won't finish the job. Group the card and billing fields with <code>&lt;fieldset&gt;</code>/<code>&lt;legend&gt;</code>. Add <code>autocomplete</code> tokens (<code>given-name</code>, <code>email</code>, <code>cc-number</code>, <code>address-line1</code>…; WCAG 1.3.5). Mark required fields in code, not only with an asterisk. Quasar's <code>:rules</code> already sets <code>aria-invalid</code> and connects the error text.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.validation">
    <p><code>&lt;q-form&gt;</code> has no <code>@validation-error</code> handler. When a required field is empty, the form just doesn't submit. Focus stays on the button, nothing is announced, and the first error may be far off-screen.</p>
    <ada-code tone="bad" caption="Production — ContractedCheckoutView.vue:173" :code="CODE.validationBad" />
    <agent-check agent="forms-specialist" verdict="refines" rule="On submit with errors, move focus to an error summary, or to the first invalid field if there's no summary.">
      <p>Agrees: at minimum, focus the first invalid field (Option A). This is a long checkout that can have several errors at once, so an error summary at the top with links to each field (Option B) is the stronger pattern. It tells users how many problems there are before they start fixing them.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.agree">
    <p>The policy checkbox has no name. Its text sits in a separate element, so a screen reader announces only "checkbox, not checked", and clicking the text doesn't toggle the box.</p>
    <ada-code tone="bad" caption="Production — GuestAgreement.vue:19" :code="CODE.agreeBad" />
    <sr-output before="checkbox, not checked" after="I have read and agree to the reservation policies, checkbox, not checked" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Never use aria-label when a visible label is possible; clicking a <label> activates its control, ARIA naming does not.">
      <p>Linear's <code>aria-label</code> fixes the name, but the text is already on screen. Use it as the label instead: <code>q-checkbox</code>'s <code>label</code> prop or default slot. Then the name and the visible text can't drift apart, and the text becomes a larger click target.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.special">
    <p>The special-request dialog has an icon-only close button and a textarea with no label.</p>
    <ada-code tone="bad" caption="Production — SpecialRequestDialog.vue" :code="CODE.specialBad" />
    <sr-output before="button · edit text, multi-line, blank" after="Close, button · Special requests (optional), edit text, multi-line" />
    <agent-check agent="modal-specialist" verdict="agrees" rule="An icon-only close button needs aria-label=&quot;Close&quot;; the dialog should be named by its heading.">
      <p>Confirmed. Also check that the dialog is named by its title (<code>aria-labelledby</code>) and returns focus to "Special requests" when it closes.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, PaymentForm, StepContactInfo, PoliciesAgreement },
    setup: () => ({ ID, I: ITEMS, PRESTO, CODE, contactRooms, agreementHotels, pay: ref({}), contact: ref([]) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The presto-2026 checkout builds its fields differently: most inputs are wrapped in a <label>. A few controls are still unlabeled, and a failed Next is just as silent as in production.">

  <ada-item v-bind="I.labels">
    <ada-before status="partial" source="presto-2026 Storybook › Book Reservation / Payment / Default" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <div style="max-width:640px"><payment-form v-model="pay" /></div>
      <template #notes>
        <p><strong>Right:</strong> <code>PaymentForm.vue</code> and <code>ReservationGuests.vue</code> wrap most inputs in a <code>&lt;label&gt;</code> with visible text, so Cardholder Name, Card Number, Address and City all have names.</p>
        <p><strong>Still unlabeled:</strong> the <em>Expiration Date</em> month and year selects (<code>PaymentForm.vue:64-70</code>) sit in a <code>&lt;div&gt;</code>, so their only text is the disabled "Month"/"Year" option. In the contact step (item 2 frame), <em>Mobile number</em> (<code>ReservationGuests.vue:138-142</code>) and <em>Country</em> (<code>:207-216</code>) are also inside <code>&lt;div&gt;</code>s. The phone input has only a placeholder, and its country-code button is named just "+1".</p>
        <p><strong>Also missing everywhere:</strong> no <code>required</code>, no <code>autocomplete</code>, no <code>fieldset</code> for card and billing, and the "Required" <code>&lt;small&gt;</code> isn't connected with <code>aria-describedby</code>/<code>aria-invalid</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.validation">
    <ada-before status="applies" source="presto-2026 Storybook › Book Reservation / Contact Info" :href="PRESTO.story('checkout-experience-components-book-reservation-contact-info--reservation')">
      <div style="max-width:640px"><step-contact-info mode="reservation" :rooms="contactRooms" v-model="contact" /></div>
      <template #notes>
        <p>Press <strong>Next</strong> with the form empty. <code>StepContactInfo.vue:41</code> only sets <code>showErrors = true</code>: red "Required" text appears, but focus stays on Next, the page doesn't scroll, and nothing is announced. Same outcome as production's missing <code>@validation-error</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.agree">
    <ada-before status="resolved" source="presto-2026 Storybook › Review Reservation / Policies / Single Reservation" :href="PRESTO.story('checkout-experience-components-book-reservation-review-reservation-policies--single-reservation')">
      <div style="max-width:640px"><policies-agreement :hotels="agreementHotels" /></div>
      <template #notes>
        <p><code>PoliciesAgreement.vue</code> wraps the native checkbox and its agreement text in one <code>&lt;label&gt;</code>. The checkbox is named by the visible text, and clicking the text toggles it. This is the pattern the agent recommends.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.special">
    <ada-before status="resolved" source="presto-2026 › ReservationGuests.vue (contact step)" :href="PRESTO.story('checkout-experience-components-book-reservation-contact-info--reservation')">
      <ada-code tone="good" caption="presto-2026 ReservationGuests.vue:166-169" :code="CODE.prestoSpecial" />
      <template #notes>
        <p>presto-2026 has no special-request dialog. The request is an inline, labeled <code>&lt;textarea&gt;</code> in each room's guest form (visible in the item 2 frame), so there's no close button to name. The cart fly-out's "Any special/accessibility requests?" row is a text button, and the checkout rail hides it.</p>
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
    setup: () => {
      const required = (v) => !!(v && String(v).trim()) || 'Required'
      const a = reactive({ first: '', last: '', email: '', card: '' })
      const onInvalid = (field) => {
        field.$el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
        field.focus()
      }
      const submitted = ref('')
      const onSubmit = () => { submitted.value = 'Booking submitted.' }

      // Option B: native form with an error summary.
      const b = reactive({ first: '', email: '' })
      const errors = ref([])
      const summary = ref(null)
      const onSummarySubmit = async () => {
        const list = []
        if (!b.first.trim()) list.push({ id: 'eng2927-b-first', msg: 'Enter the guest’s first name' })
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) list.push({ id: 'eng2927-b-email', msg: 'Enter a valid email address' })
        errors.value = list
        if (list.length) { await nextTick(); summary.value?.focus() }
      }
      const focusField = (id) => document.getElementById(id)?.focus()
      const hasErr = (id) => errors.value.some((e) => e.id === id)
      const errMsg = (id) => errors.value.find((e) => e.id === id)?.msg

      return {
        ID, I: ITEMS, CODE, required, a, onInvalid, onSubmit, submitted,
        b, errors, summary, onSummarySubmit, focusField, hasErr, errMsg,
        agreedA: ref(false), agreedB: ref(false), request: ref(''),
        billing: reactive({ line1: '', city: '' }),
      }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Try each demo with the keyboard, and submit the forms empty to see where focus goes.">

  <ada-item v-bind="I.labels">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Native q-input :label in all four components" recommended lang="vue" :code="CODE.labelsFix">
        <div class="ada-stack" style="max-width:420px">
          <q-input v-model="a.first" label="First name *" outlined autocomplete="given-name" />
          <q-input v-model="a.email" label="Email address *" type="email" outlined autocomplete="email" />
          <q-input v-model="a.card" label="Card number *" outlined autocomplete="cc-number" inputmode="numeric" />
        </div>
        <sr-output after="First name *, edit text" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Explicit label + fieldset + autocomplete (presto field style)" lang="html" :code="CODE.labelsNative">
        <fieldset class="ada-mini-frame ada-focus-demo" style="max-width:420px">
          <legend style="font-weight:700;padding:0 4px">Billing address</legend>
          <div class="ada-stack">
            <div style="display:grid;gap:4px">
              <label for="eng2927-line1" style="font-size:13px;font-weight:600">Address line 1 <span aria-hidden="true" style="color:#B91C1C">*</span></label>
              <input id="eng2927-line1" v-model="billing.line1" autocomplete="address-line1" required style="height:42px;border:1px solid #64748B;border-radius:6px;padding:0 12px;font:inherit" />
            </div>
            <div style="display:grid;gap:4px">
              <label for="eng2927-city" style="font-size:13px;font-weight:600">City <span aria-hidden="true" style="color:#B91C1C">*</span></label>
              <input id="eng2927-city" v-model="billing.city" autocomplete="address-level2" required style="height:42px;border:1px solid #64748B;border-radius:6px;padding:0 12px;font:inherit" />
            </div>
          </div>
        </fieldset>
        <template #why><p>This matches presto-2026's own field markup (visible label above the input) and adds what's still missing: a group name for the address fields, autofill tokens (1.3.5), and required status exposed in code.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.validation">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="@validation-error that scrolls to and focuses the first invalid field" recommended lang="vue" :code="CODE.validationFix">
        <q-form @submit="onSubmit" @validation-error="onInvalid" class="ada-stack" style="max-width:420px">
          <q-input v-model="a.last" label="Last name *" outlined autocomplete="family-name" :rules="[required]" lazy-rules />
          <q-input v-model="a.first" label="First name *" outlined autocomplete="given-name" :rules="[required]" lazy-rules />
          <div><q-btn type="submit" unelevated no-caps color="primary" label="Complete Booking" /></div>
          <p class="ada-note" role="status">{{ submitted }}</p>
        </q-form>
        <p class="ada-note">Submit it empty: focus jumps to "Last name" and its error is read out with it.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Error summary with links, focused on submit" lang="vue" :code="CODE.validationSummary">
        <form novalidate class="ada-stack ada-focus-demo" style="max-width:420px" @submit.prevent="onSummarySubmit">
          <div v-if="errors.length" ref="summary" tabindex="-1" aria-labelledby="eng2927-errh"
               style="border:2px solid #B91C1C;border-radius:6px;padding:10px 12px;background:#FEF2F2">
            <h2 id="eng2927-errh" style="margin:0 0 4px;font-size:16px;color:#7F1D1D">There {{ errors.length === 1 ? 'is 1 problem' : 'are ' + errors.length + ' problems' }}</h2>
            <ul style="margin:0;padding-left:20px">
              <li v-for="e in errors" :key="e.id"><a :href="'#' + e.id" style="color:#7F1D1D" @click.prevent="focusField(e.id)">{{ e.msg }}</a></li>
            </ul>
          </div>
          <div style="display:grid;gap:4px">
            <label for="eng2927-b-first" style="font-size:13px;font-weight:600">First name</label>
            <input id="eng2927-b-first" v-model="b.first" autocomplete="given-name" required :aria-invalid="hasErr('eng2927-b-first') ? 'true' : undefined" :aria-describedby="hasErr('eng2927-b-first') ? 'eng2927-b-first-err' : undefined" style="height:42px;border:1px solid #64748B;border-radius:6px;padding:0 12px;font:inherit" />
            <p v-if="hasErr('eng2927-b-first')" id="eng2927-b-first-err" style="margin:0;color:#B91C1C;font-size:13px">{{ errMsg('eng2927-b-first') }}</p>
          </div>
          <div style="display:grid;gap:4px">
            <label for="eng2927-b-email" style="font-size:13px;font-weight:600">Email address</label>
            <input id="eng2927-b-email" v-model="b.email" type="email" autocomplete="email" required :aria-invalid="hasErr('eng2927-b-email') ? 'true' : undefined" :aria-describedby="hasErr('eng2927-b-email') ? 'eng2927-b-email-err' : undefined" style="height:42px;border:1px solid #64748B;border-radius:6px;padding:0 12px;font:inherit" />
            <p v-if="hasErr('eng2927-b-email')" id="eng2927-b-email-err" style="margin:0;color:#B91C1C;font-size:13px">{{ errMsg('eng2927-b-email') }}</p>
          </div>
          <div><q-btn type="submit" unelevated no-caps color="primary" label="Complete Booking" /></div>
        </form>
        <template #why><p>Checkout is long and can have several errors at once. The summary tells users how many problems there are, and each link jumps straight to a field. Focus lands on the summary, so its heading is read first.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.agree">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label on the GuestAgreement checkbox" lang="vue" :code="CODE.agreeFix">
        <div class="ada-row ada-focus-demo" style="align-items:center;flex-wrap:nowrap">
          <q-checkbox v-model="agreedA" aria-label="I agree to the reservation policies" />
          <span>I agree to the reservation policies and authorize the charge.</span>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" recommended title="Use the visible text as the label (q-checkbox label prop)" lang="vue" :code="CODE.agreeLabel">
        <div class="ada-focus-demo">
          <q-checkbox v-model="agreedB" label="I have read and agree to the reservation policies" />
        </div>
        <template #why><p>The name comes from the text on screen, so it can't drift from it. The whole sentence toggles the box, which is a bigger target. presto-2026's <code>PoliciesAgreement</code> already works this way.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.special">
    <ada-option letter="A" title="Label the textarea and the close button" recommended lang="vue" :code="CODE.specialFix">
      <section class="ada-mini-frame ada-focus-demo" aria-labelledby="eng2927-sr-h" style="max-width:460px">
        <div class="row items-center no-wrap" style="margin-bottom:8px">
          <h2 id="eng2927-sr-h" style="margin:0;font-size:18px;flex:1">Special requests</h2>
          <q-btn flat round dense icon="close" aria-label="Close" />
        </div>
        <q-input v-model="request" type="textarea" outlined autogrow label="Special requests (optional)" />
      </section>
      <sr-output after="Close, button · Special requests (optional), edit text, multi-line" />
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
