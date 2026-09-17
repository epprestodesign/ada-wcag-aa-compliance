// ENG-2928 · ADA-FUSE-06 — Live Checkout & Supplier Verification: session
// expiry dialog, detached labels, error focus + policy gate, fee breakdown
// structure, state-machine announcements and CSS reading order.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2928.linear.md?raw'
import HoldTimerPill from '../../presto/components/HoldTimerPill.vue'
import ReservationGuests from '../../presto/components/checkout/ReservationGuests.vue'
import PoliciesAgreement from '../../presto/components/checkout/PoliciesAgreement.vue'
import CartReview from '../../presto/components/CartReview.vue'
import { reserveCart } from '../../presto/stories/checkout/_fixtures.js'
import { policies as detailPolicies } from '../../presto/stories/details/_detail-data.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-06 – Live Checkout & Supplier Verification',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2928'),
}

const ID = 'ENG-2928'

const ITEMS = {
  session: { n: 1, title: 'Session-expired modal isn’t an alertdialog and doesn’t return focus', wcag: ['4.1.2', '2.4.3'], element: 'Modal · session expiry', where: 'fuse/src/modules/reservation/components/checkout/SessionExpiredDialog.vue' },
  labels: { n: 2, title: 'GuestDetails.vue fields use detached labels', wcag: ['1.3.1', '3.3.2'], element: 'Form fields · q-input', where: 'fuse/src/modules/reservation/components/checkout/GuestDetails.vue:161-171,175-185,191-201,209-236,244-250' },
  focus: { n: 3, title: 'Errors are scrolled to but never focused; no policy-agreement gate', wcag: ['2.4.3', '3.3.2'], element: 'Form · error focus + submit button', where: 'GuestDetails.vue:78-84 (scrollToErrorField) · :335-340 (Complete Booking)' },
  price: { n: 4, title: 'Sticky fee breakdown has no semantic structure', wcag: ['1.3.1'], element: 'Price breakdown · fee rows', where: 'fuse/src/components/PriceDetails.vue · shared/ReservationRoomDetails.vue:115-117 · PoliciesStep.vue:46,68,78' },
  state: { n: 5, title: 'State changes are silent and CSS order breaks reading order', wcag: ['1.3.2', '4.1.3'], element: 'Checkout layout · live region + flex order', where: 'fuse/src/modules/reservation/views/LiveCheckoutView.vue' },
}

const guestRooms = [{ adults: 2, children: 0 }]
const agreementHotels = [{ policies: detailPolicies.slice(5, 7) }]

const CODE = {
  sessionBad: `<q-dialog v-model="expired" persistent>     <!-- role="dialog", no label -->
  <q-card>
    <div class="text-h6">Your session has expired</div>
    <q-btn label="Start over" @click="restart" />
  </q-card>
</q-dialog>`,
  labelsBad: `<div class="text-caption">Last name</div>
<q-input v-model="guest.lastName" placeholder="Last name" outlined dense />`,
  focusBad: `function scrollToErrorField () {         // L78-84
  const el = document.querySelector('.q-field--error')
  el?.scrollIntoView({ behavior: 'smooth' })  // focus never moves
}

<q-btn type="submit" label="Complete Booking" />   <!-- L335-340: no :disabled gate -->`,
  priceBad: `<div class="price-details sticky">
  <div class="text-bold">Price Details</div>
  <div class="row justify-between"><div>Room (2 nights)</div><div>$329.56</div></div>
  <div class="row justify-between"><div>Taxes & fees</div><div>$47.53</div></div>
  <div class="row justify-between text-bold"><div>Total</div><div>$377.09</div></div>
</div>`,
  stateBad: `<div class="live-checkout">                 <!-- display:flex -->
  <q-spinner v-if="state === 'LOADING'" />    <!-- silent -->
  <checkout-form v-else-if="state === 'CHECKOUT_FORM'" />
  <aside class="summary" />                   <!-- .summary { order: -1 } -->
</div>`,
  prestoOrder: `/* presto-2026 CheckoutPage.vue:276 (≤600px) */
.ck__railwrap--lead { order: -1; }         /* rail shown above the steps; DOM has it after */

/* presto-2026 prototype/src/App.vue:390 */
.ck__railwrap .ck__timer { order: -1; }    /* timer shown above the summary; DOM has it below */

/* CheckoutPage.vue:42 — rail countdown ticks every second, no live region / role */
heldTimer = setInterval(() => { heldSecs.value-- }, 1000)`,
  sessionFix: `<q-dialog v-model="expired" persistent role="alertdialog"
  aria-labelledby="exp-title" aria-describedby="exp-desc">
  <q-card>
    <h2 id="exp-title">Your session has expired</h2>
    <p id="exp-desc">Your held rate was released. Search again to see current prices.</p>
    <q-btn autofocus label="Search again" v-close-popup @click="restart" />
  </q-card>
</q-dialog>
<!-- q-dialog traps focus and refocuses the trigger on hide -->`,
  sessionWarn: `<p role="timer" aria-live="off">{{ mm }}:{{ ss }} left to book</p>
<p role="status">{{ milestone }}</p>        <!-- "2 minutes left" at milestones only -->
<q-btn label="I need more time" @click="extend" />  <!-- ≥20 s before expiry -->`,
  labelsFix: `<q-input v-model="guest.lastName" label="Last name *" outlined
  autocomplete="family-name" :rules="[required]" lazy-rules />`,
  focusFix: `function scrollToErrorField (field) {
  field.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  field.focus()
}

<q-checkbox v-model="hasAgreedToPolicies" label="I agree to the reservation policies" />
<q-btn type="submit" label="Complete Booking" :disabled="!hasAgreedToPolicies" />`,
  focusAria: `<q-checkbox ref="agree" v-model="agreed" label="I agree…"
  :aria-invalid="agreeErr ? 'true' : undefined" aria-describedby="agree-err" />
<p id="agree-err" v-if="agreeErr">Agree to the policies to complete your booking</p>
<q-btn type="submit" label="Complete Booking" />   <!-- always enabled -->

function onSubmit () {
  if (!agreed.value) { agreeErr.value = true; agree.value.$el.focus(); return }
  …
}`,
  priceFix: `<section class="price-details" aria-labelledby="pd-h">
  <h2 id="pd-h">Price details</h2>
  <dl>
    <div><dt>Room, 2 nights</dt><dd>$329.56</dd></div>
    <div><dt>Taxes & fees</dt><dd>$47.53</dd></div>
    <div class="total"><dt>Total (USD)</dt><dd>$377.09</dd></div>
  </dl>
</section>`,
  priceTable: `<table>
  <caption>Price details</caption>
  <thead><tr><th scope="col">Night</th><th scope="col">Rooms</th><th scope="col">Rate</th></tr></thead>
  <tbody><tr><th scope="row">Tue, Jun 23</th><td>1</td><td>$164.78</td></tr>…</tbody>
  <tfoot><tr><th scope="row" colspan="2">Total</th><td>$377.09</td></tr></tfoot>
</table>`,
  stateFix: `<div class="live-checkout" aria-live="polite">
  <p v-if="state === 'LOADING'" aria-live="assertive">Checking the latest price…</p>
  …
</div>

/* DOM order = visual order: put <aside> first in the markup on mobile,
   or use grid areas that follow the DOM instead of order: -1 */
.live-checkout { display: grid; grid-template-areas: "summary" "form"; }
@media (min-width: 900px) {
  .live-checkout { grid-template-areas: "summary form"; }
}`,
  stateStatus: `<p role="status">{{ statusText }}</p>   <!-- "Checking the latest price…" → "Price confirmed" -->
<p role="alert">{{ alertText }}</p>     <!-- only: "The price changed to $X" / "Session expired" -->

// on step change: focus the new step heading
await nextTick(); stepHeading.value.focus()   // <h2 tabindex="-1">`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The Live (supplier-rate) checkout re-verifies price and availability as it goes. Its dialogs, errors and state changes don't reach screen-reader users, and its layout reorders content visually.">

  <ada-item v-bind="I.session">
    <p>When the hold runs out, a <code>q-dialog</code> appears. It's announced as a plain, unnamed dialog, not as an urgent alert, and focus isn't returned to a sensible place when it closes.</p>
    <ada-code tone="bad" caption="Production pattern — SessionExpiredDialog.vue" :code="CODE.sessionBad" />
    <sr-output before="dialog" after="Your session has expired, alert dialog. Your held rate was released…" />
    <agent-check agent="modal-specialist" verdict="refines" rule="Alert dialogs: role=&quot;alertdialog&quot;, aria-labelledby + aria-describedby, focus on the safest action, focus returns on close.">
      <p>Agrees. The acceptance criteria list role, label and trap, but the Problem also cites <strong>focus return</strong>. Keep that in scope. Add <code>aria-describedby</code> for the short explanation, and put initial focus on the primary action ("Search again").</p>
    </agent-check>
    <agent-check agent="cognitive-accessibility" verdict="refines" rule="2.2.1 Timing Adjustable: warn at least 20 seconds before a timeout and let users extend it.">
      <p>An accessible "expired" dialog comes too late for users who need more time. Warn before expiry and offer an extension (Option B). This is SC 2.2.1, which isn't in this ticket's WCAG list.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.labels">
    <p>The Live flow's own <code>GuestDetails.vue</code> has the same bug as the contracted flow (ADA-FUSE-05): a caption above the field, and an input named only by its placeholder. It's a separate implementation, so it needs its own fix.</p>
    <ada-code tone="bad" caption="Production pattern — GuestDetails.vue:161-250" :code="CODE.labelsBad" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Every control needs a programmatically associated label; placeholder is never a label.">
      <p>Confirmed. Fix both flows the same way (with <code>autocomplete</code> tokens, per the ADA-FUSE-05 note) so they don't drift apart again.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focus">
    <p><code>scrollToErrorField()</code> scrolls the error into view, but keyboard focus stays on "Complete Booking", so a screen reader says nothing. The Live submit button also has no policy gate, unlike the contracted flow's <code>:disabled="!hasAgreedToPolicies"</code>.</p>
    <ada-code tone="bad" caption="Production — GuestDetails.vue:78-84, :335-340" :code="CODE.focusBad" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="If the user triggered the change, move focus to the new content.">
      <p>Confirmed: scrolling without focus leaves keyboard and screen-reader users behind.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Native disabled removes a control from the tab order and gives no reason; consider an enabled button that reports the problem.">
      <p>Copying the contracted flow's <code>:disabled</code> gate works, but a greyed-out button doesn't say <em>why</em> it's disabled, and screen-reader users tabbing through may never find it. The better pattern keeps the button enabled. Submitting without agreeing shows an error tied to the checkbox and moves focus there (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.price">
    <p>The sticky price breakdown is built from <code>&lt;div&gt;</code> rows, so a screen reader reads it as one run of words and numbers. Linear's corrected file list adds two related problems: the hotel name in <code>ReservationRoomDetails.vue:115-117</code> and the section titles in <code>PoliciesStep.vue</code> are styled <code>&lt;div&gt;</code>s, not headings.</p>
    <ada-code tone="bad" caption="Production pattern — PriceDetails.vue" :code="CODE.priceBad" />
    <sr-output before="Price Details Room (2 nights) $329.56 Taxes &amp; fees $47.53 Total $377.09" after="Price details, heading level 2 · description list, 3 items · Room, 2 nights: $329.56 …" />
    <agent-check agent="tables-data-specialist" verdict="agrees" rule="Label → value pairs belong in a <dl>; use a <table> only when the data has rows AND columns.">
      <p>Confirmed. A flat fee list is a <code>&lt;dl&gt;</code>. If the breakdown ever shows nights × rooms × rate, switch to a captioned table (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.state">
    <p>The checkout moves through LOADING → CHECKOUT_FORM → SUBMITTING… with no live region, so a screen reader hears nothing while prices are re-checked. Flex <code>order</code> also shows content in a different order than the DOM, so the reading and Tab order don't match what's on screen.</p>
    <ada-code tone="bad" caption="Production pattern — LiveCheckoutView.vue" :code="CODE.stateBad" />
    <agent-check agent="live-region-controller" verdict="disagrees" rule="Use aria-live=&quot;polite&quot; for loading states; reserve assertive for critical alerts (errors, session expiring). Never assertive for routine updates.">
      <p>A price check is routine, not an emergency. <code>aria-live="assertive"</code> on the loading indicator would interrupt whatever the user is reading every time it runs. Use <code>role="status"</code> (polite) for "Checking the latest price…", and keep assertive for "The price changed" or a failed check (Option B). Linear's <code>polite</code> wrapper around the state container is right.</p>
    </agent-check>
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="DOM order determines tab order; it must match the visual layout.">
      <p>Confirmed. Fix the source order, or use grid areas that follow the DOM. Don't rely on <code>order</code>.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, HoldTimerPill, ReservationGuests, PoliciesAgreement, CartReview },
    setup: () => ({ ID, I: ITEMS, PRESTO, CODE, guestRooms, agreementHotels, reserveCart, guests: ref([]) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same checkout concerns in presto-2026. The redesign shows a visible hold timer and gates its CTA on the policy checkbox. It has no expiry dialog, and it reorders the rail with CSS order.">

  <ada-item v-bind="I.session">
    <ada-before status="partial" source="presto-2026 Storybook › Hold Timer Pill / Urgent" :href="PRESTO.story('checkout-experience-group-block-hold-timer-pill--urgent')">
      <div style="position:relative;transform:translateZ(0);height:96px;background:#F8FAFC;border-radius:8px">
        <hold-timer-pill :seconds="45" />
      </div>
      <template #notes>
        <p><strong>Right:</strong> the time limit is visible up front. <code>CheckoutPage.vue</code> shows "Time left to book" with the note "If the timer expires, you'll need to run your search again", and the floating pill turns amber under a minute.</p>
        <p><strong>Missing:</strong> nothing happens at 0:00. There's no session-expired dialog: <code>HoldTimerPill</code> emits <code>expire</code>, but no screen handles it. There's also no way to extend the hold (2.2.1).</p>
        <p><strong>Live-region problem:</strong> <code>HoldTimerPill.vue:49</code> is <code>role="status" aria-live="polite"</code> and its text changes <em>every second</em>, so a screen reader can queue an announcement per tick. The rail countdown in <code>CheckoutPage.vue:42</code> has no role at all.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.labels">
    <ada-before status="partial" source="presto-2026 Storybook › Reservation Guests / Single Room" :href="PRESTO.story('checkout-experience-components-book-reservation-reservation-guests--single-room')">
      <div style="max-width:640px"><reservation-guests :rooms="guestRooms" v-model="guests" /></div>
      <template #notes>
        <p><strong>Right:</strong> <code>ReservationGuests.vue</code> wraps First/Last name, Email, Address, City, Postal and the additional-guest inputs in a <code>&lt;label&gt;</code>, so they have names.</p>
        <p><strong>Still unlabeled:</strong> <em>Mobile number</em> (<code>:138-142</code>): the <code>PhoneField</code> input has only a placeholder, and its "+1" button has no context. <em>Country</em> (<code>:207-216</code>): the select sits in a <code>&lt;div&gt;</code>, which axe flags as <code>select-name</code>. There's no <code>required</code> or <code>autocomplete</code>, and "Required" isn't linked to its field.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-before status="partial" source="presto-2026 Storybook › Review Reservation / Policies / Single Reservation" :href="PRESTO.story('checkout-experience-components-book-reservation-review-reservation-policies--single-reservation')">
      <div style="max-width:640px"><policies-agreement :hotels="agreementHotels" /></div>
      <template #notes>
        <p><strong>Gate: already there.</strong> <code>PoliciesAgreement.vue:111</code> renders "Book Now" with <code>:disabled="!allAgreed"</code>, the same approach as the contracted flow. It still has the agent's caveat: the disabled button gives no reason.</p>
        <p><strong>Error focus: still missing.</strong> <code>StepContactInfo.vue:41</code> only sets <code>showErrors</code> on a failed Next. It doesn't scroll or focus (see ADA-FUSE-05 item 2).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.price">
    <ada-before status="partial" source="presto-2026 Storybook › Reservation Summary" :href="PRESTO.story('checkout-experience-components-reservation-summary--no-fees')">
      <div style="max-width:420px"><cart-review mode="reserve" :cart="reserveCart" readonly :show-requests="false" /></div>
      <template #notes>
        <p><strong>Right:</strong> the rail's price card has a real <code>&lt;h4&gt;Price details&lt;/h4&gt;</code> (<code>CartReview.vue:235</code>) and the hotel name is an <code>&lt;h3&gt;</code>. The confirmation page already uses <code>&lt;dl&gt;</code> for its totals.</p>
        <p><strong>Still flat:</strong> every fee row is <code>&lt;div class="cr__kv"&gt;&lt;span&gt;…&lt;/span&gt;&lt;span&gt;…&lt;/span&gt;&lt;/div&gt;</code> (<code>CartReview.vue:216, :244</code>), with no <code>&lt;dl&gt;</code> or table. <code>PoliciesAgreement</code>'s section titles are real <code>&lt;h4&gt;</code>s, but a named hotel's header is two <code>&lt;span&gt;</code>s with no heading.</p>
        <p><strong>Also flagged by axe (outside this item's SC):</strong> "Rates are quoted in USD ($)." uses <code>--ds-color-text-subtlest</code> at 12px.</p>
        <contrast-pair fg="#94A3B8" bg="#FFFFFF" label="CartReview .cr__quoted — Slate 400, 12px" sample="Rates are quoted in USD ($)." />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.state">
    <ada-before status="applies" source="presto-2026 › CheckoutPage.vue + prototype App.vue" :href="PRESTO.story('checkout-experience-book-reservation--page')">
      <ada-code tone="bad" caption="presto-2026 — CSS order and countdown" :code="CODE.prestoOrder" />
      <template #notes>
        <p><strong>Reading order:</strong> on phones the order rail is moved above the steps with <code>order: -1</code> (DES-421), while it stays after them in the DOM. The prototype also pulls the timer above the summary the same way. Screen-reader and Tab order don't match what's on screen.</p>
        <p><strong>Status:</strong> <code>next()</code> opens the next accordion step without moving focus or announcing anything. The step headers are <code>&lt;header&gt;</code>/<code>&lt;span&gt;</code>, not headings. presto has no price re-check state, so there's no loading indicator to announce yet.</p>
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
      // Item 1 — session expiry.
      const expired = ref(false)
      const left = ref(120)
      const milestone = ref('')
      const extend = () => { left.value += 600; milestone.value = `Time extended. ${Math.floor(left.value / 60)} minutes left.` }
      const mmss = () => `${Math.floor(left.value / 60)}:${String(left.value % 60).padStart(2, '0')}`

      // Item 3 — focus + gate.
      const required = (v) => !!(v && String(v).trim()) || 'Required'
      const g = reactive({ last: '', last2: '', phone: '' })
      const agreedA = ref(false)
      const onInvalid = (field) => { field.$el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }); field.focus() }
      const doneA = ref('')
      const agreedB = ref(false)
      const agreeErr = ref(false)
      const agreeBox = ref(null)
      const doneB = ref('')
      const submitB = async () => {
        if (!agreedB.value) { agreeErr.value = true; doneB.value = ''; await nextTick(); agreeBox.value?.$el?.focus(); return }
        agreeErr.value = false; doneB.value = 'Booking submitted.'
      }

      // Item 5 — state machine.
      const stateA = ref('Ready to book.')
      const loadingA = ref('')
      const runA = () => {
        loadingA.value = 'Checking the latest price…'; stateA.value = ''
        setTimeout(() => { loadingA.value = ''; stateA.value = 'Price confirmed: $377.09.' }, 1200)
      }
      const statusB = ref('')
      const alertB = ref('')
      const runB = (changed) => {
        statusB.value = 'Checking the latest price…'; alertB.value = ''
        setTimeout(() => {
          if (changed) { statusB.value = ''; alertB.value = 'The price changed to $389.20. Review it before booking.' }
          else statusB.value = 'Price confirmed: $377.09.'
        }, 1200)
      }

      return {
        ID, I: ITEMS, CODE, expired, left, milestone, extend, mmss,
        required, g, agreedA, onInvalid, doneA, agreedB, agreeErr, agreeBox, doneB, submitB,
        stateA, loadingA, runA, statusB, alertB, runB,
      }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. For item 5, the live-region agent disagrees with Linear's assertive loading indicator; Option B shows the polite alternative.">

  <ada-item v-bind="I.session">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="role=&quot;alertdialog&quot; + aria-labelledby + focus trap (and focus return)" recommended lang="vue" :code="CODE.sessionFix">
        <div class="ada-focus-demo">
          <q-btn outline color="primary" no-caps label="Simulate session expiry" aria-haspopup="dialog" @click="expired = true" />
        </div>
        <p class="ada-note" style="margin-top:8px">Focus moves to "Search again". <kbd>Tab</kbd> stays inside, and focus returns to the button when the dialog closes.</p>
        <q-dialog v-model="expired" persistent role="alertdialog" aria-labelledby="eng2928-exp-t" aria-describedby="eng2928-exp-d">
          <q-card style="max-width:380px">
            <q-card-section>
              <h2 id="eng2928-exp-t" style="margin:0 0 8px;font-size:20px">Your session has expired</h2>
              <p id="eng2928-exp-d" style="margin:0">Your held rate was released. Search again to see current prices.</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn autofocus unelevated no-caps color="primary" label="Search again" @click="expired = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="cognitive-accessibility" title="Warn before expiry and let users extend (2.2.1)" lang="vue" :code="CODE.sessionWarn">
        <div class="ada-mini-frame ada-focus-demo" style="background:#DBEAFE;border-color:#BFDBFE;color:#1E40AF">
          <p style="margin:0;font-weight:700">Your held rate expires soon</p>
          <p role="timer" aria-live="off" style="margin:4px 0 8px;font-size:22px;font-weight:800">{{ mmss() }} left to book</p>
          <q-btn unelevated no-caps color="primary" label="I need more time" @click="extend" />
          <p role="status" style="margin:8px 0 0">{{ milestone }}</p>
        </div>
        <template #why><p>The timer itself stays silent (<code>aria-live="off"</code>). Only milestones and the extension are announced, so users aren't flooded every second. Users who need more time can get it before the dialog appears. This also fixes the per-second <code>role="status"</code> in presto's <code>HoldTimerPill</code>.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.labels">
    <ada-option letter="A" title="Real :label props in GuestDetails.vue" recommended lang="vue" :code="CODE.labelsFix">
      <div class="ada-row" style="max-width:640px">
        <q-input v-model="g.last2" label="Last name *" outlined autocomplete="family-name" style="flex:1;min-width:220px" />
        <q-input v-model="g.phone" label="Mobile number *" type="tel" outlined autocomplete="tel" style="flex:1;min-width:220px" />
      </div>
      <p class="ada-note">Same pattern as ADA-FUSE-05 item 1; see its Option B for fieldset + autocomplete.</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.focus">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title=".focus() in scrollToErrorField() + :disabled policy gate" recommended lang="vue" :code="CODE.focusFix">
        <q-form class="ada-stack ada-focus-demo" style="max-width:420px" @submit="doneA = 'Booking submitted.'" @validation-error="onInvalid">
          <q-input v-model="g.last" label="Last name *" outlined autocomplete="family-name" :rules="[required]" lazy-rules />
          <q-checkbox v-model="agreedA" label="I agree to the reservation policies" />
          <div><q-btn type="submit" unelevated no-caps color="primary" label="Complete Booking" :disable="!agreedA" /></div>
          <p class="ada-note" role="status">{{ doneA }}</p>
        </q-form>
        <p class="ada-note">Tick the box and submit with "Last name" empty: focus jumps to the field.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Keep the button enabled; report the missing agreement" lang="vue" :code="CODE.focusAria">
        <form novalidate class="ada-stack ada-focus-demo" style="max-width:420px" @submit.prevent="submitB">
          <div>
            <q-checkbox ref="agreeBox" v-model="agreedB" label="I agree to the reservation policies"
              :aria-invalid="agreeErr && !agreedB ? 'true' : undefined" :aria-describedby="agreeErr && !agreedB ? 'eng2928-agree-err' : undefined" />
            <p v-if="agreeErr && !agreedB" id="eng2928-agree-err" style="margin:2px 0 0 8px;color:#B91C1C;font-size:13px">Agree to the policies to complete your booking.</p>
          </div>
          <div><q-btn type="submit" unelevated no-caps color="primary" label="Complete Booking" /></div>
          <p class="ada-note" role="status">{{ doneB }}</p>
        </form>
        <template #why><p>The button is always reachable. If the box isn't ticked, the reason appears next to the checkbox and focus moves there. Nobody is left wondering why "Complete Booking" does nothing.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.price">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Semantic <dl> for fee rows, under a real heading" recommended lang="vue" :code="CODE.priceFix">
        <section aria-labelledby="eng2928-pd" class="ada-mini-frame" style="max-width:360px">
          <h2 id="eng2928-pd" style="margin:0 0 8px;font-size:17px">Price details</h2>
          <dl style="margin:0;display:grid;gap:6px">
            <div style="display:flex;justify-content:space-between"><dt>Room, 2 nights</dt><dd style="margin:0">$329.56</dd></div>
            <div style="display:flex;justify-content:space-between"><dt>Taxes &amp; fees</dt><dd style="margin:0">$47.53</dd></div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #CBD5E1;padding-top:6px;font-weight:700"><dt>Total (USD)</dt><dd style="margin:0">$377.09</dd></div>
          </dl>
        </section>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="tables-data-specialist" title="Captioned table when rows have several columns" lang="html" :code="CODE.priceTable">
        <table style="border-collapse:collapse;width:100%;max-width:360px">
          <caption style="text-align:left;font-weight:700;padding-bottom:6px">Price details</caption>
          <thead><tr>
            <th scope="col" style="text-align:left;border-bottom:1px solid #CBD5E1;padding:4px">Night</th>
            <th scope="col" style="text-align:right;border-bottom:1px solid #CBD5E1;padding:4px">Rooms</th>
            <th scope="col" style="text-align:right;border-bottom:1px solid #CBD5E1;padding:4px">Rate</th>
          </tr></thead>
          <tbody>
            <tr><th scope="row" style="text-align:left;font-weight:400;padding:4px">Tue, Jun 23</th><td style="text-align:right;padding:4px">1</td><td style="text-align:right;padding:4px">$164.78</td></tr>
            <tr><th scope="row" style="text-align:left;font-weight:400;padding:4px">Wed, Jun 24</th><td style="text-align:right;padding:4px">1</td><td style="text-align:right;padding:4px">$164.78</td></tr>
            <tr><th scope="row" style="text-align:left;font-weight:400;padding:4px">Taxes &amp; fees</th><td></td><td style="text-align:right;padding:4px">$47.53</td></tr>
          </tbody>
          <tfoot><tr><th scope="row" colspan="2" style="text-align:left;border-top:1px solid #CBD5E1;padding:4px">Total (USD)</th><td style="text-align:right;border-top:1px solid #CBD5E1;padding:4px;font-weight:700">$377.09</td></tr></tfoot>
        </table>
        <template #why><p>Use this only for multi-night, multi-room stays, where each row has several values. A screen reader can then read "Wed, Jun 24, Rate, $164.78" instead of a run of numbers.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.state">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-live=&quot;assertive&quot; on price-check loading, polite around the state machine, DOM order = visual order" lang="vue" :code="CODE.stateFix">
        <div class="ada-mini-frame ada-focus-demo">
          <q-btn outline color="primary" no-caps label="Re-check price" @click="runA" />
          <div aria-live="polite" style="margin-top:8px;min-height:24px">
            <p aria-live="assertive" style="margin:0">{{ loadingA }}</p>
            <p style="margin:0;font-weight:700">{{ stateA }}</p>
          </div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" recommended title="Polite status for loading; alert only when the price changes" lang="vue" :code="CODE.stateStatus">
        <div class="ada-mini-frame ada-focus-demo">
          <div class="ada-row">
            <q-btn outline color="primary" no-caps label="Re-check price" @click="runB(false)" />
            <q-btn outline color="primary" no-caps label="Re-check (price changed)" @click="runB(true)" />
          </div>
          <p role="status" style="margin:8px 0 0;min-height:22px">{{ statusB }}</p>
          <p role="alert" style="margin:0;color:#B91C1C;font-weight:700">{{ alertB }}</p>
        </div>
        <template #why><p>A routine check is announced when the reader is free. Only a price change interrupts, because the user has to act on it. Also, when checkout moves to a new step, move focus to that step's heading (keyboard-navigator), since a live region alone doesn't show where the user now is.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
