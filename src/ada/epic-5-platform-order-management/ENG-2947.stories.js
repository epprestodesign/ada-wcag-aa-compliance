// ENG-2947 · ADA-PLAT-MGMT-03 — Reservation modification intake forms:
// orphaned labels, shared Expiration label, wrapper-only .has-error, and
// (unverified) focus handling on validation errors.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2947.linear.md?raw'
import PaymentForm from '../../presto/components/checkout/PaymentForm.vue'

export default {
  title: 'Epic 5 – platform Order Management/ADA-PLAT-MGMT-03 – Reservation Modification Forms',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2947'),
}

const ID = 'ENG-2947'
const FILE = 'order_management/edit.plush.html'

const ITEMS = {
  orphans: { n: 1, state: 'corrected', title: 'Labels aren’t linked to their controls (~9 of 11 in 624-710)', wcag: ['1.3.1', '3.3.2', '4.1.2'], element: 'Form fields · modification form', where: `${FILE}:314, :328-359, :624-710 (Country :632 and State :641 are correct), :807, :839` },
  expiry: { n: 2, title: 'Expiration Month and Year share one unlinked label', wcag: ['1.3.1', '3.3.2'], element: 'Selects · card expiration', where: `${FILE}:816 (label), :819 (month), :828 (year)` },
  errors: { n: 3, title: '.has-error styles the wrapper only; controls never get aria-invalid', wcag: ['3.3.1', '4.1.2'], element: 'Validation · error state', where: `${FILE} (throughout)` },
  focus: { n: 4, state: 'unverified', title: 'Does focus move to the error after a failed submit?', wcag: ['2.4.3', '2.1.1'], element: 'Focus management · Stimulus JS', where: 'Stimulus controllers for edit.plush.html (not in the reviewed templates)' },
}

const inputStyle = { height: '40px', padding: '0 10px', border: '1px solid #64748B', borderRadius: '4px', font: 'inherit', width: '100%' }
const errStyle = { color: '#B91C1C', fontSize: '13px', margin: '2px 0 0' }

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="edit.plush.html (883 lines) holds the guest-info, dates, special-request and payment-card forms used to modify a reservation. Linear's corrected pass narrows item 1 (Country and State are fine) and marks item 4 unverifiable from templates alone.">

  <ada-item v-bind="I.orphans">
    <p>Most labels have no <code>for</code>, or their inputs have no matching <code>id</code>. The text is visible, but screen readers announce the fields as unnamed "edit text", and clicking a label doesn't focus its field. <em>Corrected:</em> Country (632) and State (641) are already linked, so "pervasive" means about 9 of 11 fields in 624-710, not all of them.</p>
    <ada-code tone="bad" caption="Production pattern — edit.plush.html:624-710" code='<label>First Name</label>
<input type="text" name="FirstName" class="form-control" value="<%= order.FirstName %>">

<label for="Country">Country</label>             <!-- L632: correct -->
<select id="Country" name="Country" class="form-control">…</select>' />
    <sr-output before="edit text" after="First Name, edit text, Alex" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Every input needs a programmatically associated label (for/id or wrapping <label>); placeholder is not a label.">
      <p>Confirmed. For Plush partials that render in loops, build ids from a stable key (e.g. <code>guest-&lt;%= i %&gt;-first</code>) so duplicates don't appear when a form repeats.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.expiry">
    <p>One "Expiration" label sits above two selects and names neither. Screen readers read the month and year dropdowns with no name, just their current option.</p>
    <ada-code tone="bad" caption="Production pattern — edit.plush.html:816-828" code='<label>Expiration</label>                               <!-- L816 -->
<select name="ExpMonth" class="form-control">…</select>   <!-- L819 -->
<select name="ExpYear"  class="form-control">…</select>   <!-- L828 -->' />
    <sr-output before="combo box, 01" after="Expiration date, group · Month, combo box, 01 · Year, combo box, 2027" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Related inputs must be grouped with fieldset/legend when the group label gives essential context. Use autocomplete tokens on payment fields.">
      <p>Agrees with per-select labels. The shared "Expiration" text is a group label, so it belongs in a <code>&lt;legend&gt;</code>, with "Month"/"Year" as the per-select labels. Add <code>autocomplete="cc-exp-month"</code> / <code>"cc-exp-year"</code> as well. This matches ADA-PLAT-RES-05 (ENG-2935).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.errors">
    <p>Bootstrap 3's <code>.has-error</code> on the wrapper <code>&lt;div&gt;</code> only turns the border and help text red. The input itself isn't marked invalid or linked to its message, so the error depends on color alone.</p>
    <ada-code tone="bad" caption="Production pattern — edit.plush.html" code='<div class="form-group <%= if (errors.Get("email")) { %>has-error<% } %>">
  <label>Email</label>
  <input type="email" name="Email" class="form-control">
  <span class="help-block"><%= errors.Get("email") %></span>
</div>' />
    <agent-check agent="forms-specialist" verdict="agrees" rule="aria-invalid=&quot;true&quot; on the field with the error; link the message via aria-describedby; remove aria-invalid when corrected.">
      <p>Confirmed. Because the page is server-rendered, "remove when corrected" happens on the next render automatically. If Stimulus validates live, it must toggle the attribute too.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focus">
    <p><strong>Not verifiable from the templates.</strong> Whether a failed submit moves focus to the first error depends on Stimulus controllers outside the reviewed files. Linear says to audit them directly rather than assume either way.</p>
    <agent-check agent="forms-specialist" verdict="agrees" rule="On submit with errors, move focus to an error summary (role=alert, tabindex=-1) or, with no summary, to the first [aria-invalid=&quot;true&quot;] field.">
      <p>Agrees this needs a code audit. The expected behavior to check against is above. On a full server round-trip, focus lands at the top of the new page unless something moves it, so "no JS" most likely means "no focus management".</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, PaymentForm },
    setup: () => ({ ID, I: ITEMS, PRESTO, formA: ref({}), formB: ref({}) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no reservation-modification form. Its checkout Payment form (PaymentForm.vue) has the same fields as edit.plush.html's card and billing section, so it's the comparison here.">

  <ada-item v-bind="I.orphans">
    <ada-before status="resolved" source="presto-2026 Storybook › Checkout / Payment" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <div style="max-width:720px"><payment-form v-model="formA" /></div>
      <template #notes><p>Every text input and the Country/State selects are wrapped in their <code>&lt;label&gt;</code> (PaymentForm.vue:53-115), so each has a name without needing <code>for</code>/<code>id</code>. ProfileEditModal.vue:58-94 uses the same pattern. The one exception is item 2.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.expiry">
    <ada-before status="applies" source="presto-2026 › PaymentForm.vue:64-71 (frame above)" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <ada-code tone="bad" caption="PaymentForm.vue:64-68" lang="vue" code='<div class="pmf__field">
  <span>Expiration Date <i class="pmf__req">*</i></span>
  <div class="pmf__exp">
    <select v-model="form.expMonth"><option value="" disabled>Month</option>…</select>
    <select v-model="form.expYear"><option value="" disabled>Year</option>…</select>' />
      <template #notes><p>Same defect: "Expiration Date" is a <code>&lt;span&gt;</code> in a <code>&lt;div&gt;</code>, and both selects are unnamed. The disabled "Month"/"Year" options are placeholders, not labels. Axe reports <code>select-name</code> on both selects in each form frame on this page.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.errors">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout / Payment › Validation Errors" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--validation-errors')">
      <div style="max-width:720px"><payment-form v-model="formB" show-errors /></div>
      <template #notes>
        <p>The presto equivalent of <code>.has-error</code> is an <code>is-error</code> class that turns the border red (PaymentForm.vue:147), plus a <code>&lt;small&gt;Required&lt;/small&gt;</code>. No control gets <code>aria-invalid</code> or <code>aria-describedby</code>. No presto component sets <code>aria-invalid</code> anywhere.</p>
        <p>The shared expiration error (:70) sits outside any label, so it isn't tied to either select.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-before status="applies" source="presto-2026 › components/checkout/*.vue">
      <ada-code tone="bad" caption="PaymentForm.vue:36-38 — showErrors only toggles messages" code='const touched = reactive({})
const show = (f) => props.showErrors || touched[f]
const err = (f) => (show(f) && REQUIRED.includes(f) && !String(form[f]).trim() ? "Required" : "")' />
      <template #notes><p>Unlike production, this is verifiable in presto: no checkout component calls <code>focus()</code> or <code>scrollIntoView()</code>. When <code>showErrors</code> flips on (PaymentForm, ContactGroupForm, ReservationGuests, GroupTeamsBlock), focus stays on the submit button and nothing is announced.</p></template>
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
      // Item 3 demo: inline errors on the control.
      const f3 = reactive({ first: '', email: '' })
      const e3 = reactive({ first: '', email: '' })
      const validate3 = () => {
        e3.first = f3.first.trim() ? '' : 'Enter the guest’s first name.'
        e3.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f3.email) ? '' : 'Enter an email like name@example.com.'
      }
      // Item 4 demo: error summary, focused on failed submit.
      const f4 = reactive({ arrive: '', nights: '' })
      const e4 = reactive({ arrive: '', nights: '' })
      const summary = ref(null)
      const submitted4 = ref(false)
      const submit4 = async () => {
        e4.arrive = f4.arrive ? '' : 'Choose a new arrival date.'
        e4.nights = Number(f4.nights) > 0 ? '' : 'Enter the number of nights (1 or more).'
        submitted4.value = true
        await nextTick()
        if (e4.arrive || e4.nights) summary.value?.focus()
      }
      const goTo = (id) => document.getElementById(id)?.focus()
      return { ID, I: ITEMS, inputStyle, errStyle, f3, e3, validate3, f4, e4, summary, submitted4, submit4, goTo }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in each item is the fix from Linear's acceptance criteria. Items 3 and 4 have working forms: submit them empty to see the error handling.">

  <ada-item v-bind="I.orphans">
    <ada-option letter="A" title="Add matching id/for to every still-broken control (skip Country :632, State :641)" recommended
      code='<label for="FirstName">First Name</label>
<input type="text" id="FirstName" name="FirstName" class="form-control"
       autocomplete="given-name" value="<%= order.FirstName %>">

<label for="SpecialRequests">Special Requests</label>
<textarea id="SpecialRequests" name="SpecialRequests" class="form-control"></textarea>'>
      <div class="ada-mini-frame ada-focus-demo" style="display:grid;gap:4px;max-width:420px">
        <label for="ada-2947-first" style="font-weight:600">First Name</label>
        <input id="ada-2947-first" :style="inputStyle" autocomplete="given-name" value="Alex" />
        <label for="ada-2947-req" style="font-weight:600;margin-top:8px">Special Requests</label>
        <textarea id="ada-2947-req" :style="{ ...inputStyle, height: '64px', padding: '8px 10px' }"></textarea>
        <p class="ada-note">Click a label: focus moves to its field.</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.expiry">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Give Month and Year their own labels (816-828)" recommended
        code='<label for="ExpMonth">Expiration month</label>
<select id="ExpMonth" name="ExpMonth" class="form-control">…</select>
<label for="ExpYear">Expiration year</label>
<select id="ExpYear" name="ExpYear" class="form-control">…</select>'>
        <div class="ada-row ada-focus-demo">
          <div style="display:grid;gap:4px"><label for="ada-2947-m" style="font-weight:600">Expiration month</label>
            <select id="ada-2947-m" :style="inputStyle"><option>01</option><option>02</option><option>12</option></select></div>
          <div style="display:grid;gap:4px"><label for="ada-2947-y" style="font-weight:600">Expiration year</label>
            <select id="ada-2947-y" :style="inputStyle"><option>2027</option><option>2028</option></select></div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="fieldset + legend for the group, short labels + autocomplete"
        code='<fieldset>
  <legend>Expiration date</legend>
  <label for="ExpMonth">Month</label>
  <select id="ExpMonth" name="ExpMonth" autocomplete="cc-exp-month">…</select>
  <label for="ExpYear">Year</label>
  <select id="ExpYear" name="ExpYear" autocomplete="cc-exp-year">…</select>
</fieldset>'>
        <fieldset class="ada-focus-demo" style="border:1px solid #CBD5E1;border-radius:6px;padding:8px 12px 12px;margin:0">
          <legend style="font-weight:700;padding:0 4px">Expiration date</legend>
          <div class="ada-row">
            <div style="display:grid;gap:4px"><label for="ada-2947-bm">Month</label>
              <select id="ada-2947-bm" autocomplete="cc-exp-month" :style="inputStyle"><option>01</option><option>12</option></select></div>
            <div style="display:grid;gap:4px"><label for="ada-2947-by">Year</label>
              <select id="ada-2947-by" autocomplete="cc-exp-year" :style="inputStyle"><option>2027</option><option>2028</option></select></div>
          </div>
        </fieldset>
        <template #why><p>Keeps the visible "Expiration" heading as the group name ("Expiration date, group · Month, combo box"), and browsers can autofill both selects.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.errors">
    <ada-option letter="A" title="aria-invalid + aria-describedby on the control, not just .has-error on the wrapper" recommended
      code='<div class="form-group <%= if (errors.Get("email")) { %>has-error<% } %>">
  <label for="Email">Email</label>
  <input type="email" id="Email" name="Email" class="form-control"
    <%= if (errors.Get("email")) { %>aria-invalid="true" aria-describedby="Email-error"<% } %>>
  <%= if (errors.Get("email")) { %>
    <span id="Email-error" class="help-block">Error: <%= errors.Get("email") %></span>
  <% } %>
</div>'>
      <form class="ada-mini-frame ada-focus-demo" style="display:grid;gap:4px;max-width:420px" novalidate @submit.prevent="validate3">
        <label for="ada-2947-e-first" style="font-weight:600">First Name</label>
        <input id="ada-2947-e-first" v-model="f3.first" :style="inputStyle"
          :aria-invalid="e3.first ? 'true' : null" :aria-describedby="e3.first ? 'ada-2947-e-first-err' : null" />
        <p v-if="e3.first" id="ada-2947-e-first-err" :style="errStyle">Error: {{ e3.first }}</p>
        <label for="ada-2947-e-email" style="font-weight:600;margin-top:8px">Email</label>
        <input id="ada-2947-e-email" v-model="f3.email" type="email" :style="inputStyle"
          :aria-invalid="e3.email ? 'true' : null" :aria-describedby="e3.email ? 'ada-2947-e-email-err' : null" />
        <p v-if="e3.email" id="ada-2947-e-email-err" :style="errStyle">Error: {{ e3.email }}</p>
        <div style="margin-top:10px"><q-btn type="submit" unelevated color="primary" no-caps label="Save changes" /></div>
      </form>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.focus">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Audit the Stimulus controllers; if focus doesn't move, add a handler" recommended lang="js"
        code='// form_validation_controller.js (Stimulus) — run on connect after a failed POST,
// and on submit when validating client-side.
connect() { this.focusFirstError() }

focusFirstError() {
  const summary = this.element.querySelector("[data-error-summary]")
  const first = this.element.querySelector("[aria-invalid=true]")
  ;(summary || first)?.focus()
}'>
        <p class="ada-note">Check first: open edit.plush.html with an invalid value, submit, and press <kbd>Tab</kbd>. If the next stop is the page header rather than the field after the first error, focus isn't being managed.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Error summary with links, focused on failed submit"
        code='<div data-error-summary role="alert" tabindex="-1" class="alert alert-danger">
  <h2 class="h5">Please fix 2 errors</h2>
  <ul>
    <li><a href="#ArrivalDate">Choose a new arrival date.</a></li>
    <li><a href="#Nights">Enter the number of nights.</a></li>
  </ul>
</div>'>
        <form class="ada-mini-frame ada-focus-demo" style="display:grid;gap:4px;max-width:420px" novalidate @submit.prevent="submit4">
          <div v-if="submitted4 && (e4.arrive || e4.nights)" ref="summary" role="alert" tabindex="-1"
            style="padding:10px 12px;margin-bottom:8px;border-radius:4px;background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
            <p style="margin:0;font-weight:700">Please fix {{ (e4.arrive ? 1 : 0) + (e4.nights ? 1 : 0) }} error(s)</p>
            <ul style="margin:4px 0 0;padding-left:18px">
              <li v-if="e4.arrive"><a href="#ada-2947-arrive" style="color:#991B1B" @click.prevent="goTo('ada-2947-arrive')">{{ e4.arrive }}</a></li>
              <li v-if="e4.nights"><a href="#ada-2947-nights" style="color:#991B1B" @click.prevent="goTo('ada-2947-nights')">{{ e4.nights }}</a></li>
            </ul>
          </div>
          <label for="ada-2947-arrive" style="font-weight:600">New arrival date</label>
          <input id="ada-2947-arrive" v-model="f4.arrive" type="date" :style="inputStyle" :aria-invalid="e4.arrive ? 'true' : null" />
          <label for="ada-2947-nights" style="font-weight:600;margin-top:8px">Nights</label>
          <input id="ada-2947-nights" v-model="f4.nights" inputmode="numeric" :style="inputStyle" :aria-invalid="e4.nights ? 'true' : null" />
          <div style="margin-top:10px"><q-btn type="submit" unelevated color="primary" no-caps label="Update reservation" /></div>
        </form>
        <template #why><p>Focus lands on the summary, so the errors are read even though the page just changed, and each link jumps to its field. This pattern works for both server round-trips and client-side validation.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
