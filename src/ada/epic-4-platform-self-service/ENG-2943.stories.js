// ENG-2943 · ADA-PLAT-AUTH-01 — Manage Booking / Reservation Lookup Portal:
// <h6> page title, duplicate <label for="PipeID">, silent lookup errors.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2943.linear.md?raw'
import ManageBooking from '../../presto/components/managebooking/ManageBooking.vue'
import PaymentForm from '../../presto/components/checkout/PaymentForm.vue'

export default {
  title: 'Epic 4 – platform Guest Self-Service/ADA-PLAT-AUTH-01 – Manage Booking Lookup Portal',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2943'),
}

const ID = 'ENG-2943'
const FILE = 'platform/app/templates/enduser/auth/new.plush.html'

const ITEMS = {
  title: { n: 1, title: 'Portal title is an <h6>, and the page has no <h1>', wcag: ['1.3.1', '2.4.6'], element: 'Heading · page title', where: `${FILE}:15` },
  labels: { n: 2, title: 'Two <label for="PipeID"> tags for one input', wcag: ['1.3.1', '3.3.2'], element: 'Form field · Pipe ID', where: `${FILE}:35, :37` },
  errors: { n: 3, title: 'Lookup error isn’t announced, and inputs never get aria-invalid', wcag: ['3.3.1', '1.3.1'], element: 'Error alert · EmailAddress / PipeID inputs', where: `${FILE}:23, :36` },
}

const user = { name: 'Justin Girard', email: 'youraccount@eventpipe.com' }

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The guest lookup portal is a single Plush template (new.plush.html). The 'search' page is just the searchAuthPath() route. Guests type an email and a Pipe ID here to reach their booking, so a screen-reader user who can't get past this form can't manage the booking at all.">

  <ada-item v-bind="I.title">
    <p>The only heading is an <code>&lt;h6&gt;</code>. Screen-reader users who jump to the first heading, or list headings, find a level-6 heading and no page title. The level was picked for its small type size, not for structure.</p>
    <ada-code tone="bad" caption="Production pattern — new.plush.html:15" code='<div class="card-body">
  <h6 class="card-title">Manage Your Booking</h6>   <!-- L15: only heading on the page -->
  …' />
    <sr-output before="heading level 6, Manage Your Booking" after="heading level 1, Manage Your Booking" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Exactly one H1 per page; never choose a heading level for visual appearance. Use CSS for size.">
      <p>Confirmed. Promote to <code>&lt;h1&gt;</code> and keep the small look with a class (e.g. Bootstrap <code>.h6</code>), so the page doesn't change visually.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.labels">
    <p>Line 35 labels the Pipe ID input. Line 37 adds a second <code>&lt;label for="PipeID"&gt;</code> holding the hint text. Browsers join both labels into one long accessible name, and clicking the hint also focuses the input, which is confusing.</p>
    <ada-code tone="bad" caption="Production pattern — new.plush.html:35-37" code='<label for="PipeID">Pipe ID</label>                        <!-- L35 -->
<input type="text" name="PipeID" id="PipeID" class="form-control">  <!-- L36 -->
<label for="PipeID">Your Pipe ID is in your confirmation email</label>  <!-- L37 -->' />
    <sr-output before="Pipe ID Your Pipe ID is in your confirmation email, edit text" after="Pipe ID, edit text, Your Pipe ID is in your confirmation email" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Link help text to the input with aria-describedby. It must stay visible, not hidden in a tooltip.">
      <p>Confirmed. With <code>aria-describedby</code>, the name stays short ("Pipe ID") and the hint is read as a description after it, which is what the Linear fix does.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.errors">
    <p>When the lookup fails, the page re-renders with a Bootstrap alert at line 23. It has no <code>role="alert"</code>, and neither input is marked invalid. A screen-reader user hears the page reload and nothing else.</p>
    <ada-code tone="bad" caption="Production pattern — new.plush.html:23 (error) and the inputs" code='<%= if (errors) { %>
  <div class="alert alert-danger">We could not find a reservation…</div>   <!-- L23 -->
<% } %>
…
<input type="email" name="EmailAddress" id="EmailAddress" class="form-control">
<input type="text"  name="PipeID"       id="PipeID"       class="form-control">' />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Set aria-invalid=&quot;true&quot; on the field with the error, and link the error message to it with aria-describedby.">
      <p>Confirmed. The error isn't tied to either field, so users can't tell which value was wrong.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="refines" rule="Alerts already in the DOM when the page loads are NOT announced; the page-load announcement wins. Use assertive rarely.">
      <p>This is a server round-trip, so the alert is in the HTML when the new page loads. <code>role="alert"</code> alone may never be spoken. Also give the alert <code>tabindex="-1"</code> and move focus to it on load (forms-specialist's error-summary pattern). That makes it announce reliably. <code>role="alert"</code> already implies <code>aria-live="assertive"</code>, so adding both is redundant but harmless.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ManageBooking, PaymentForm },
    setup: () => ({ ID, I: ITEMS, PRESTO, user, form: ref({}) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no guest lookup form. 'Manage Booking' in the Global Nav opens a signed-in account page (ManageBooking.vue). Below, each item is checked against that page and against the form pattern the redesign would reuse.">

  <ada-item v-bind="I.title">
    <ada-before status="applies" source="presto-2026 Storybook › Manage Booking / Account" :href="PRESTO.story('manage-booking-account--profile')">
      <manage-booking :user="user" default-section="profile" />
      <template #notes>
        <p>The Manage Booking page has no <code>&lt;h1&gt;</code> either. The member name is a <code>&lt;strong&gt;</code> (ManageBooking.vue:106), and the first heading is the content panel's <code>&lt;h2&gt;</code> (:132). The same fix applies: add one <code>&lt;h1&gt;</code> page title.</p>
        <p><strong>Axe on this frame:</strong> <code>color-contrast</code> flags the "Not provided" placeholders (<code>.is-empty</code> uses <code>--ds-color-text-subtlest</code>, Slate 400 #94A3B8, 2.56:1 on white; ManageBooking.vue:285). That's a separate presto token problem, not part of this item.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.labels">
    <ada-before status="no-equivalent" source="presto-2026 › ManageBooking.vue / ProfileEditModal.vue">
      <template #empty>presto-2026 has no Email + Pipe ID lookup form, so there's no Pipe ID field to compare. The Proposal shows the pattern to use when one is designed.</template>
      <template #notes>
        <p>For reference, the redesign's forms (ProfileEditModal.vue:58-94, PaymentForm.vue) wrap each input in a single <code>&lt;label&gt;</code>, so the duplicate-label bug doesn't occur there. Their helper text (e.g. ProfileEditModal.vue:82 "Accessibility needs") isn't linked with <code>aria-describedby</code>, though. Carry the Proposal pattern over.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.errors">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout / Payment › Validation Errors" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--validation-errors')">
      <div style="max-width:720px"><payment-form v-model="form" show-errors /></div>
      <template #notes>
        <p>With no lookup form, this is the closest match: the validation pattern a presto lookup form would reuse. Errors only add an <code>is-error</code> class (red border) and a <code>&lt;small&gt;Required&lt;/small&gt;</code> (PaymentForm.vue:55-56). There's no <code>aria-invalid</code>, no <code>aria-describedby</code>, no <code>role="alert"</code>, and focus never moves. No presto component uses <code>aria-invalid</code>.</p>
        <p>Because the <code>&lt;small&gt;</code> sits inside the <code>&lt;label&gt;</code>, "Required" does end up in the field's name. That's accidental and doesn't tell users the field is invalid.</p>
        <p><strong>Axe on this frame:</strong> <code>select-name</code> ×2 on the unlabeled Expiration Month and Year selects (PaymentForm.vue:65-68). It's the same defect as ENG-2947 item 2.</p>
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
      const email = ref('')
      const pipe = ref('')
      const failed = ref(false)
      const alertEl = ref(null)
      const submit = () => {
        failed.value = true
        // Server round-trip simulation: the alert is focused so it is always read.
        requestAnimationFrame(() => alertEl.value?.focus())
      }
      const reset = () => { failed.value = false; email.value = ''; pipe.value = '' }
      const inputStyle = { height: '40px', padding: '0 10px', border: '1px solid #64748B', borderRadius: '4px', font: 'inherit' }
      return { ID, I: ITEMS, email, pipe, failed, alertEl, submit, reset, inputStyle }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in each item is the fix from Linear's acceptance criteria. All three items are demonstrated on one lookup form, rebuilt with Bootstrap-style markup like the Plush template.">

  <ada-item v-bind="I.title">
    <ada-option letter="A" title="Promote the portal title to <h1> (keep the small look with a class)" recommended lang="html"
      code='<h1 class="card-title h6">Manage Your Booking</h1>'>
      <div class="ada-mini-frame">
        <p class="ada-note">Rendered as the page's only <code>&lt;h1&gt;</code>. It's styled small in the portal card, so the look doesn't change:</p>
        <p role="heading" aria-level="1" style="margin:8px 0 0;font-size:16px;font-weight:700">Manage Your Booking</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.labels">
    <ada-option letter="A" title="Keep one label (L35); turn L37 into help text linked with aria-describedby" recommended lang="html"
      code='<label for="PipeID">Pipe ID</label>
<input type="text" name="PipeID" id="PipeID" class="form-control"
       aria-describedby="pipeIdHelp">
<small id="pipeIdHelp" class="form-text">Your Pipe ID is in your confirmation email</small>'>
      <p class="ada-note">See the working field in item 3's demo: the Pipe ID input is read as "Pipe ID, edit text, Your Pipe ID is in your confirmation email".</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.errors">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="role=alert on the error (L23) + aria-invalid on the invalid inputs" recommended lang="html"
        code='<%= if (errors) { %>
  <div class="alert alert-danger" id="lookupError" role="alert" aria-live="assertive">
    We couldn’t find a reservation with that email and Pipe ID.
  </div>
<% } %>
<label for="EmailAddress">Email address</label>
<input type="email" id="EmailAddress" name="EmailAddress"
       <%= if (errors) { %>aria-invalid="true" aria-describedby="lookupError"<% } %>>

<label for="PipeID">Pipe ID</label>
<input type="text" id="PipeID" name="PipeID"
       aria-describedby="pipeIdHelp<%= if (errors) { %> lookupError<% } %>"
       <%= if (errors) { %>aria-invalid="true"<% } %>>
<small id="pipeIdHelp" class="form-text">Your Pipe ID is in your confirmation email</small>'>
        <form class="ada-mini-frame ada-focus-demo" style="max-width:420px;display:grid;gap:4px" novalidate @submit.prevent="submit">
          <p class="ada-note" style="margin-bottom:8px">Press <strong>Find booking</strong> to simulate a failed lookup.</p>
          <div v-if="failed" id="ada-2943-err" ref="alertEl" tabindex="-1" role="alert" style="padding:10px 12px;margin-bottom:8px;border-radius:4px;background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
            We couldn’t find a reservation with that email and Pipe ID. Check both and try again.
          </div>
          <label for="ada-2943-email" style="font-weight:600">Email address</label>
          <input id="ada-2943-email" :style="inputStyle" v-model="email" type="email" autocomplete="email"
            :aria-invalid="failed ? 'true' : null" :aria-describedby="failed ? 'ada-2943-err' : null" />
          <label for="ada-2943-pipe" style="margin-top:8px;font-weight:600">Pipe ID</label>
          <input id="ada-2943-pipe" :style="inputStyle" v-model="pipe" type="text"
            :aria-invalid="failed ? 'true' : null" :aria-describedby="failed ? 'ada-2943-help ada-2943-err' : 'ada-2943-help'" />
          <small id="ada-2943-help" style="color:#475569;font-size:13px">Your Pipe ID is in your confirmation email.</small>
          <div class="ada-row" style="margin-top:12px">
            <q-btn type="submit" unelevated color="primary" no-caps label="Find booking" />
            <q-btn v-if="failed" flat color="primary" no-caps label="Reset demo" @click="reset" />
          </div>
        </form>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="Also focus the alert on load, since the page is server-rendered" lang="html"
        code='<div class="alert alert-danger" id="lookupError"
     role="alert" tabindex="-1" data-controller="focus-on-load">
  We couldn’t find a reservation…
</div>

// focus_on_load_controller.js (Stimulus)
connect() { this.element.focus() }'>
        <template #why><p>An alert that's already in the HTML when the page loads may not be announced. Moving focus to it guarantees the message is read, and puts the user right above the fields to fix. The demo in Option A does this.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
