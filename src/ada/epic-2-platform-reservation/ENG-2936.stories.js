// ENG-2936 · ADA-PLAT-RES-06 — platform checkout step 3 (Policies & order
// placement): duplicate policy-checkbox id, countdown timer semantics + time
// extension, heading skip, no focus on invalid submit, processing overlay.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2936.linear.md?raw'
import PoliciesAgreement from '../../presto/components/checkout/PoliciesAgreement.vue'
import HoldTimerPill from '../../presto/components/HoldTimerPill.vue'
import HoldTimerBanner from '../../presto/components/HoldTimerBanner.vue'
import CheckoutPage from '../../presto/components/checkout/CheckoutPage.vue'
import StepContactInfo from '../../presto/components/checkout/steps/StepContactInfo.vue'
import { reserveCart } from '../../presto/stories/checkout/_fixtures.js'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-06 – Checkout Step 3: Reservation Policies & Order Placement',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2936'),
}

const ID = 'ENG-2936'
const DIR = 'platform/app/templates/enduser'

const ITEMS = {
  dupId: { n: 1, title: 'Policy checkbox label is fine; a hidden input duplicates its id', wcag: ['4.1.1', '1.3.1', '4.1.2'], state: 'corrected', element: 'Checkbox · policy agreement', where: `${DIR}/orders/policies_checkbox.plush.html:7-10` },
  timer: { n: 2, title: 'Countdown timer has no timer semantics', wcag: ['2.2.1', '4.1.2'], element: 'Timer · reservation hold', where: `${DIR}/partials/timer.plush.html:8-16` },
  headings: { n: 3, title: 'Heading skip from h2 to h5 and h6 in the order summary', wcag: ['1.3.1'], state: 'corrected', element: 'Headings · hotel and room summary', where: `${DIR}/orders/room_summary.plush.html:2 · summary_content.plush.html:14, 16` },
  focus: { n: 4, title: 'Final submit does not move focus to the invalid field', wcag: ['3.3.1'], element: 'Form · submit validation', where: 'All three checkout Stimulus controllers (no focus or scroll logic)' },
  overlay: { n: 5, title: '"Processing, do not refresh" overlay has no dialog or live semantics', wcag: ['4.1.2'], state: 'new', element: 'Overlay · order processing', where: `${DIR}/orders/index.plush.html:37-53` },
}

// Production snippets are reconstructed from the patterns and line numbers Linear
// cites (the platform repo isn't checked out here).
const C = {
  dupBad: `<!-- policies_checkbox.plush.html:7-10 -->
<label for="AcceptedReservationPolicies" class="form-check-label">          <!-- L7 -->
  <input type="hidden"   id="AcceptedReservationPolicies"                   <!-- L8 -->
         name="AcceptedReservationPolicies" value="false">
  <input type="checkbox" id="AcceptedReservationPolicies"                   <!-- L9 -->
         name="AcceptedReservationPolicies" value="true" class="form-check-input">
  I agree to the reservation policies                                        <!-- L10 -->
</label>`,
  timerBad: `<!-- partials/timer.plush.html:8-16 -->
<div class="timer-banner" data-controller="timer"
     data-timer-expires-value="<%= hold.ExpiresAt %>">
  <i class="fa fa-clock"></i>
  Your rooms are held for
  <span data-timer-target="display">14:59</span>
</div>`,
  headingsBad: `<!-- index.plush.html — earlier on the page -->
<h2>Review your reservation</h2>
…
<!-- room_summary.plush.html:2 — the HOTEL name -->
<h5 class="fw-bold"><%= hotel.Name %></h5>
<!-- summary_content.plush.html:14, 16 — per-room headings -->
<h6><%= room.TypeName %></h6>`,
  focusBad: `// checkout Stimulus controller (pattern shared by all three)
submit(event) {
  if (!this.validate()) {
    event.preventDefault()
    this.element.classList.add('was-validated')  // red borders appear…
    return                                        // …focus stays on "Place Order"
  }
}`,
  overlayBad: `<!-- index.plush.html:37-53 -->
<div id="processing-overlay" class="overlay d-none">
  <div class="overlay-content">
    <div class="spinner-border"></div>
    <p>Processing your reservation, please do not refresh the page.</p>
  </div>
</div>
// JS: overlay.classList.remove('d-none') — focus stays on the submit button`,
  prestoPolicies: `<!-- presto-2026 PoliciesAgreement.vue:121-124 — implicit label, no ids -->
<label class="pol__agree">
  <input type="checkbox" v-model="agreed[0]" class="pol__check" />
  <span>{{ singleAgreement }}</span>
</label>`,
  prestoTimer: `<!-- presto-2026 CheckoutPage.vue:198-204 — rail timer: no role, no live region -->
<div class="ck__timer">
  <span class="ck__timer-label"><q-icon name="timer" /> Time left to book</span>
  <span class="ck__timer-clock">{{ timerText }}</span>   <!-- updates every second -->
</div>

<!-- HoldTimerPill.vue:52 — polite live region that re-renders every second -->
<div class="htp" role="status" aria-live="polite"> … {{ clock }} </div>

// prototype/src/store.js — stopHoldTimer() on 0; no warning, no "extend"`,
  prestoHeadings: `<!-- presto-2026 heading outline, Book Reservation checkout -->
<h1>Confirm and pay</h1>                                   CheckoutPage.vue:150
  <span class="ck__steptitle">Enter contact information</span>   ← not a heading (:160)
      <h4>Room 1 — Guest Information</h4>                 ReservationGuests.vue:124
  <span class="ck__steptitle">Review your reservation</span>
      <h4>Protect your stay</h4>                          StepReviewReservation.vue:44
        <h5>Enhanced Booking Protection</h5>             :47
      <h4>Policies</h4>                                   :79
        <h3>Policies</h3> / <h4>GrandStay Refund Policy</h4>   PoliciesAgreement.vue:96-101`,
  prestoFocus: `// presto-2026 StepContactInfo.vue:578
const onNext = () => { if (valid.value) emit('next'); else { showErrors.value = true } }
// errors render as <small class="cgf__err">Required</small> — no aria-invalid,
// no aria-describedby, no focus move, no announcement`,
  dupFix: `<!-- policies_checkbox.plush.html — rename only the hidden input's id -->
<label for="AcceptedReservationPolicies" class="form-check-label">
  <input type="hidden" id="AcceptedReservationPoliciesDefault"
         name="AcceptedReservationPolicies" value="false">
  <input type="checkbox" id="AcceptedReservationPolicies"
         name="AcceptedReservationPolicies" value="true" class="form-check-input">
  I agree to the reservation policies
</label>`,
  timerFix: `<!-- partials/timer.plush.html -->
<div class="timer-banner" data-controller="timer"
     role="timer" aria-live="polite"
     aria-label="Time left to complete your reservation">
  <i class="fa fa-clock" aria-hidden="true"></i>
  Your rooms are held for <span data-timer-target="display">14:59</span>
</div>`,
  timerMilestones: `<div role="timer" aria-live="off"
     aria-labelledby="hold-label">
  <span id="hold-label">Time left to book</span>
  <span data-timer-target="display">14:59</span>
</div>
<p class="visually-hidden" role="status" data-timer-target="announce"></p>

// timer_controller.js
tick() {
  this.displayTarget.textContent = fmt(this.remaining)
  if ([600, 300, 120, 60].includes(this.remaining))
    this.announceTarget.textContent = \`\${this.remaining / 60} minutes left to book.\`
}`,
  timerExtend: `<!-- shown 2 minutes before expiry (≥ 20 s required) -->
<div role="alertdialog" aria-modal="true"
     aria-labelledby="extend-title" aria-describedby="extend-desc">
  <h2 id="extend-title">Need more time?</h2>
  <p id="extend-desc">Your rooms are released in 2 minutes.</p>
  <button type="button" data-action="timer#extend">Extend hold 15 minutes</button>
  <button type="button" data-action="timer#dismiss">I'm done</button>
</div>

// server: POST /orders/:id/hold/extend  → up to 10× the default hold`,
  headingsFix: `<h2>Review your reservation</h2>
…
<!-- room_summary.plush.html:2 -->
<h3 class="h5 fw-bold"><%= hotel.Name %></h3>     <!-- keep the look with a class -->
<!-- summary_content.plush.html:14, 16 -->
<h4 class="h6"><%= room.TypeName %></h4>`,
  focusFix: `// shared helper used by all three checkout controllers
focusFirstInvalid(form) {
  const bad = form.querySelector(':invalid, [aria-invalid="true"]')
  if (!bad) return false
  bad.setAttribute('aria-invalid', 'true')
  bad.focus()
  bad.scrollIntoView({ block: 'center' })
  return true
}

submit(event) {
  if (!this.validate()) {
    event.preventDefault()
    this.focusFirstInvalid(this.element)
  }
}`,
  focusSummary: `<div id="error-summary" role="alert" tabindex="-1" hidden>
  <h2>There are 2 problems with your reservation</h2>
  <ul>
    <li><a href="#cardholder-name">Cardholder Name: enter the name on the card</a></li>
    <li><a href="#AcceptedReservationPolicies">Accept the reservation policies to continue</a></li>
  </ul>
</div>

// on invalid submit
summary.hidden = false
summary.focus()`,
  overlayFix: `<div id="processing-overlay" class="overlay d-none"
     role="alertdialog" aria-modal="true"
     aria-labelledby="processing-title" aria-describedby="processing-desc"
     aria-live="assertive" tabindex="-1">
  <div class="overlay-content">
    <div class="spinner-border" aria-hidden="true"></div>
    <h2 id="processing-title">Processing your reservation</h2>
    <p id="processing-desc">Please don't refresh or close this page.</p>
  </div>
</div>

// JS
overlay.classList.remove('d-none')
document.querySelector('main').inert = true
overlay.focus()`,
  overlayBusy: `<form aria-busy="true" …>             <!-- while posting -->
  …
  <button type="submit" aria-disabled="true">Placing order…</button>
</form>
<p role="status">Processing your reservation. Please don't refresh the page.</p>`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The last checkout step: agree to policies, watch the hold timer, place the order. Linear refutes the original checkbox finding but confirms four other gaps, one of them new.">

  <ada-item v-bind="I.dupId">
    <p><strong>Refuted:</strong> the policy checkbox <em>is</em> wrapped by <code>&lt;label for="AcceptedReservationPolicies"&gt;</code>. <strong>Real bug:</strong> line 8 is a <code>type="hidden"</code> input with the <em>same</em> <code>id</code>. That's invalid HTML, and the label's target is ambiguous.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — policies_checkbox.plush.html:7-10" :code="C.dupBad" />
    <sr-output before="checkbox, not checked (no name, if the hidden input wins)" after="I agree to the reservation policies, checkbox, not checked" />
    <agent-check agent="forms-specialist" verdict="refines" rule="WCAG 2.2 removed 4.1.1 Parsing (always satisfied); a label that fails to associate is still a 1.3.1 / 4.1.2 failure.">
      <p>SC 4.1.1 is obsolete in WCAG 2.2, so “invalid HTML” on its own is no longer a failure. The defect is still real under 1.3.1/4.1.2. When a label has a <code>for</code> attribute, its target is the <strong>first</strong> element in the document with that id. The hidden input comes first, and <code>type="hidden"</code> isn't labelable, so the label gets <em>no</em> control at all. The wrapping doesn't rescue it, because an explicit <code>for</code> overrides implicit wrapping. Result: the checkbox can lose its name, and clicking the text may not toggle it. Linear's fix (rename the hidden id) is correct. Keep <code>name</code> unchanged so the unchecked <code>false</code> still posts.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.timer">
    <p>The hold countdown is a plain <code>&lt;div&gt;</code>/<code>&lt;span&gt;</code> that JS rewrites every second. Assistive tech isn't told it's a timer, and nothing warns users before the hold runs out.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — timer.plush.html:8-16" :code="C.timerBad" />
    <agent-check agent="live-region-controller" verdict="disagrees" rule="role=&quot;timer&quot; does not imply aria-live; typically keep aria-live=&quot;off&quot; to prevent constant interruption, and announce milestones separately via a polite region.">
      <p>The finding is right; the fix as written is not. <code>aria-live="polite"</code> on text that changes every second makes screen readers read the countdown nonstop (“14:58… 14:57…”), which makes the rest of the form unusable. Use <code>role="timer"</code> with <code>aria-live="off"</code>, and send milestone messages (10, 5, 2, 1 min) to a separate <code>role="status"</code> region (Option B).</p>
    </agent-check>
    <agent-check agent="cognitive-accessibility" verdict="refines" rule="Time limits: warn at least 20 seconds before expiry and let users extend (≥10× the default) or turn it off. FAIL if there's a warning but no way to extend.">
      <p>Linear lists SC <strong>2.2.1 Timing Adjustable</strong>, but <code>role="timer"</code> doesn't satisfy it. 2.2.1 needs a way to <em>turn off, adjust or extend</em> the limit, unless the limit is essential or real-time. An inventory hold is only essential if extending it would invalidate the booking, and that's a business decision to document. Otherwise add an “Extend hold” warning before expiry (Option C).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.headings">
    <p>Linear corrected this item: the <code>&lt;h5&gt;</code> at <code>room_summary.plush.html:2</code> is the <strong>hotel name</strong>, and the per-room headings are <code>&lt;h6&gt;</code>. Since an <code>&lt;h2&gt;</code> comes earlier, the outline jumps h2 → h5 → h6.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — room_summary / summary_content" :code="C.headingsBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Never skip heading levels; never choose a heading level for visual appearance — use CSS.">
      <p>Confirmed. Make the hotel <code>&lt;h3&gt;</code> and the rooms <code>&lt;h4&gt;</code>, and keep the current size with Bootstrap's <code>.h5</code>/<code>.h6</code> classes.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focus">
    <p>When “Place Order” fails validation, fields turn red, but focus stays on the button. A screen-reader or magnifier user doesn't know which field failed or where it is. Linear confirmed that none of the three Stimulus controllers has focus or scroll logic.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — checkout Stimulus controllers" :code="C.focusBad" lang="js" />
    <agent-check agent="forms-specialist" verdict="refines" rule="On submit with errors, focus the error summary; if there is no summary, focus the first invalid field. Errors need aria-invalid and aria-describedby.">
      <p>Agrees. The error text also has to be linked (<code>aria-invalid="true"</code> + <code>aria-describedby</code>), or the focused field won't say what's wrong. This checkout can fail on fields from several steps at once, so an error summary is often the better target (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.overlay">
    <p>New finding: the full-screen “processing, do not refresh” overlay only toggles a CSS class. It has no dialog role, doesn't move focus and isn't announced. Screen-reader users don't hear the warning, and keyboard focus stays on controls behind the overlay.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — index.plush.html:37-53" :code="C.overlayBad" />
    <agent-check agent="modal-specialist" verdict="refines" rule="alertdialog needs aria-modal, aria-labelledby and aria-describedby, and focus must move into it; use inert on the page behind.">
      <p>Agrees with <code>role="alertdialog"</code>. Moving focus into the dialog (<code>tabindex="-1"</code> on the container) is what makes it announce, since it has no buttons to focus. Once focus moves, <code>aria-live</code> is redundant. Setting <code>inert</code> on the page behind stops Tab from reaching the form mid-submit.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="refines" rule="For operations over 2 seconds, announce that loading is happening; aria-busy suppresses intermediate announcements.">
      <p>If the overlay didn't block the page, a <code>role="status"</code> message plus <code>aria-busy</code> on the form would meet 4.1.3 without dialog semantics (Option B). Because this overlay does block the page, the dialog pattern fits better.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, PoliciesAgreement, HoldTimerPill, HoldTimerBanner, CheckoutPage, StepContactInfo },
    setup: () => ({ ID, I: ITEMS, C, PRESTO, cart: { ...reserveCart, heldSeconds: 895 }, summary: { total: 322.31 }, contact: ref([]), rooms: [{ adults: 1, children: 0 }] }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="In presto-2026 this is the Review Reservation step of the Book Reservation checkout, plus the shared hold timer.">

  <ada-item v-bind="I.dupId">
    <ada-before status="resolved" source="presto-2026 Storybook › Checkout › Review Reservation › Policies" :href="PRESTO.story('checkout-experience-components-book-reservation-review-reservation-policies--single-reservation')">
      <div style="max-width:640px"><policies-agreement flow="reserve" /></div>
      <template #notes>
        <p>The agreement checkbox is wrapped by a <code>&lt;label&gt;</code> with no <code>for</code> and no <code>id</code>s (<code>PoliciesAgreement.vue:121-124</code>), so there's nothing to collide with. It also posts no hidden fallback field, because this is an SPA. Click the sentence to check it toggles the box.</p>
        <p><strong>Side note (not this item):</strong> “Book Now” is <code>disabled</code> until the box is checked. A disabled button can't be focused and gives no reason why, so the error pattern from item 4 would help here too.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.timer">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout › Hold Timer Pill" :href="PRESTO.story('checkout-experience-group-block-hold-timer-pill--default')">
      <div class="ada-stack">
        <div style="position:relative;transform:translateZ(0);min-height:84px;border:1px dashed #CBD5E1;border-radius:8px">
          <hold-timer-pill :seconds="480" running position="top-left" />
        </div>
        <div style="position:relative;transform:translateZ(0);overflow:hidden;border-radius:8px;padding-bottom:84px;border:1px dashed #CBD5E1">
          <hold-timer-banner :seconds="372" />
        </div>
      </div>
      <template #notes>
        <p><strong>Same gap, one part worse.</strong> The checkout rail timer (<code>CheckoutPage.vue:198-204</code>) and <code>HoldTimerBanner</code> (above, bottom; it also spawns its own pill when the strip starts off-screen) are plain spans: no <code>role="timer"</code>, no name, no announcements. <code>HoldTimerPill</code> (above, top) has <code>role="status" aria-live="polite"</code> on the element whose clock changes <strong>every second</strong>, so a screen reader reads the countdown nonstop.</p>
        <p><strong>2.2.1:</strong> the prototype's store just calls <code>stopHoldTimer()</code> at 0. There's no warning before expiry and no way to extend, only the static note “you'll need to run your search again.”</p>
        <ada-code tone="bad" caption="presto-2026 source" :code="C.prestoTimer" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.headings">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout Experience › Book Reservation" :href="PRESTO.story('checkout-experience-book-reservation--page')">
      <div style="max-width:1100px"><checkout-page mode="reservation" :cart="cart" :summary="summary" /></div>
      <template #notes>
        <p><strong>Different markup, same kind of skip.</strong> The page has an <code>&lt;h1&gt;</code>, but the step titles (“Enter contact information”, “Review your reservation”) are <code>&lt;span&gt;</code>s, so step content starts at <code>&lt;h4&gt;</code>: h1 → h4 → h5. Inside the policies card, <code>PoliciesAgreement</code> adds an <code>&lt;h3&gt;</code> under the step's <code>&lt;h4&gt;</code> “Policies”.</p>
        <ada-code tone="bad" caption="presto-2026 heading outline" :code="C.prestoHeadings" />
        <p><strong>Also flagged by axe in this frame (outside this item):</strong> the faded upcoming-step titles measure 3.49:1 (#828690 on #FAFAFA), and the rail's quoted-rate note measures 2.56:1 (#94A3B8 on white). Both fail 1.4.3 in the presto component. They belong with the palette work in ENG-2930.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout › Contact Info" :href="PRESTO.story('checkout-experience-components-book-reservation-contact-info--reservation')">
      <div style="max-width:640px"><step-contact-info mode="reservation" :rooms="rooms" v-model="contact" /></div>
      <template #notes>
        <p>Scroll down and press <strong>Next</strong> with the form empty. “Required” messages appear, but focus stays on Next, nothing is announced, and the messages aren't tied to their fields (<code>StepContactInfo.vue:578</code>). <code>StepPayment</code>'s Next doesn't validate at all.</p>
        <p class="ada-note">axe's <code>select-name</code> findings in this frame and in item 3 are the unlabeled Country select from ENG-2934 item 1.</p>
        <ada-code tone="bad" caption="presto-2026 source" :code="C.prestoFocus" lang="js" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.overlay">
    <ada-before status="no-equivalent" source="presto-2026 › CheckoutPage.vue:132 (confirm)">
      <template #empty>presto-2026 has no processing state. “Book Now” calls <code>$q.notify()</code> immediately with “Reservation confirmed” (Quasar's notify has <code>role="alert"</code>). When the redesign is wired to a real payment call, it will need the pending-state pattern shown in the Proposal.</template>
    </ada-before>
  </ada-item>
</ada-issue>`,
  }),
}

/* --------------------------------------------------------------- Proposal */
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export const Proposal = {
  parameters: VIEW_PARAMS.proposal,
  render: () => ({
    components: kit,
    setup() {
      const agreeA = ref(false)
      // Timers — one shared tick; each option shows its own markup.
      const t = reactive({ a: 899, b: 899, c: 135, announce: '', warn: false, extendedMsg: '' })
      const tick = setInterval(() => {
        if (t.a > 0) t.a--
        if (t.b > 0) {
          t.b--
          if ([600, 300, 120, 60].includes(t.b)) t.announce = `${t.b / 60} minute${t.b === 60 ? '' : 's'} left to book.`
        }
        if (t.c > 0) {
          t.c--
          if (t.c === 120 && !t.warn) openWarn()
        }
      }, 1000)
      onBeforeUnmount(() => clearInterval(tick))
      const jumpB = () => { t.b = 301 }
      const warnEl = ref(null)
      const warnTrigger = ref(null)
      const openWarn = async () => { t.warn = true; await nextTick(); warnEl.value?.querySelector('button')?.focus() }
      const extend = async () => { t.c += 900; t.warn = false; t.extendedMsg = 'Hold extended by 15 minutes.'; await nextTick(); warnTrigger.value?.focus() }
      const dismiss = async () => { t.warn = false; await nextTick(); warnTrigger.value?.focus() }

      // Focus-first-invalid demos.
      const fa = reactive({ name: '', agree: false, tried: false })
      const nameA = ref(null)
      const agreeRefA = ref(null)
      const errNameA = computed(() => fa.tried && !fa.name.trim())
      const errAgreeA = computed(() => fa.tried && !fa.agree)
      const okA = ref('')
      const submitA = async () => {
        fa.tried = true
        okA.value = ''
        await nextTick()
        if (errNameA.value) return nameA.value?.focus()
        if (errAgreeA.value) return agreeRefA.value?.focus()
        okA.value = 'Order placed.'
      }
      const fb = reactive({ name: '', agree: false, tried: false })
      const summaryB = ref(null)
      const errorsB = computed(() => {
        if (!fb.tried) return []
        const e = []
        if (!fb.name.trim()) e.push({ id: 'pb-f-name', msg: 'Cardholder Name: enter the name on the card' })
        if (!fb.agree) e.push({ id: 'pb-f-agree', msg: 'Accept the reservation policies to continue' })
        return e
      })
      const okB = ref('')
      const submitB = async () => {
        fb.tried = true
        okB.value = ''
        await nextTick()
        if (errorsB.value.length) summaryB.value?.focus()
        else okB.value = 'Order placed.'
      }
      const goTo = (id) => document.getElementById(id)?.focus()

      // Processing overlay demos.
      const procA = ref(false)
      const procDoneA = ref('')
      const overlayA = ref(null)
      const placeA = ref(null)
      let procTimer = null
      const startA = async () => {
        procDoneA.value = ''
        procA.value = true
        await nextTick()
        overlayA.value?.focus()
        procTimer = setTimeout(async () => {
          procA.value = false
          procDoneA.value = 'Reservation confirmed. Confirmation #72055771948934.'
          await nextTick()
          placeA.value?.focus()
        }, 2500)
      }
      const procB = ref(false)
      const statusB = ref('')
      const startB = () => {
        procB.value = true
        statusB.value = 'Processing your reservation. Please don’t refresh the page.'
        procTimer = setTimeout(() => { procB.value = false; statusB.value = 'Reservation confirmed.' }, 2500)
      }
      onBeforeUnmount(() => clearTimeout(procTimer))

      return {
        ID, I: ITEMS, C, fmt, agreeA, t, jumpB, warnEl, warnTrigger, openWarn, extend, dismiss,
        fa, nameA, agreeRefA, errNameA, errAgreeA, okA, submitA, fb, summaryB, errorsB, okB, submitB, goTo,
        procA, procDoneA, overlayA, placeA, startA, procB, statusB, startB,
      }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is Linear's acceptance criterion. For the timer, the agents recommend replacing Linear's polite live region (B) and adding an extend control (C).">

  <ada-item v-bind="I.dupId">
    <ada-option letter="A" title="Rename the hidden input's id; leave the label association alone" recommended :code="C.dupFix">
      <div class="ada-mini-frame ada-focus-demo" style="max-width:480px">
        <label for="pa-accept-policies" style="display:flex;gap:10px;align-items:flex-start;cursor:pointer">
          <input type="hidden" id="pa-accept-policies-default" name="AcceptedReservationPolicies" value="false" />
          <input type="checkbox" id="pa-accept-policies" name="AcceptedReservationPolicies" value="true" v-model="agreeA" style="width:20px;height:20px;margin:2px 0 0" />
          <span>I have read and agree to the Reservation Policies, and I authorize the charge to my card.</span>
        </label>
        <p class="ada-note" style="margin-top:6px">Checkbox is {{ agreeA ? 'checked' : 'not checked' }}. Click the sentence to toggle it.</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.timer">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="role timer and aria-live polite on timer.plush.html (as written in Linear)" :code="C.timerFix">
        <div class="ada-mini-frame" style="background:#DBEAFE;color:#1E40AF;border-color:#BFDBFE">
          <div role="timer" aria-live="polite" aria-label="Time left to complete your reservation" class="ada-row" style="align-items:center;justify-content:space-between">
            <span style="font-weight:700;display:inline-flex;gap:6px;align-items:center"><q-icon name="timer" size="18px" /> Your rooms are held for</span>
            <span style="font-weight:700;font-variant-numeric:tabular-nums">{{ fmt(t.a) }}</span>
          </div>
        </div>
        <template #why><p><strong>Caution (live-region-controller):</strong> with <code>aria-live="polite"</code>, this text is re-announced every second. Test it with VoiceOver or NVDA before shipping. It also doesn't address 2.2.1 (see C).</p></template>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="role timer with aria-live off, plus milestone announcements" recommended :code="C.timerMilestones" lang="html">
        <div class="ada-mini-frame" style="background:#DBEAFE;color:#1E40AF;border-color:#BFDBFE">
          <div role="timer" aria-live="off" aria-labelledby="pb-hold-label" class="ada-row" style="align-items:center;justify-content:space-between">
            <span id="pb-hold-label" style="font-weight:700;display:inline-flex;gap:6px;align-items:center"><q-icon name="timer" size="18px" /> Time left to book</span>
            <span style="font-weight:700;font-variant-numeric:tabular-nums">{{ fmt(t.b) }}</span>
          </div>
        </div>
        <p role="status" class="ada-note" style="margin-top:6px">{{ t.announce }}</p>
        <div class="ada-focus-demo" style="margin-top:6px"><q-btn outline no-caps color="primary" size="sm" label="Jump to 5:01 (demo)" @click="jumpB" /></div>
        <template #why><p>Screen-reader users can still read the timer on demand, but they only hear it announced at 10, 5, 2 and 1 minutes left. Press the demo button and wait a second to hear the 5-minute message.</p></template>
      </ada-option>
      <ada-option letter="C" origin="agent" agent="cognitive-accessibility" title="Warn before expiry and offer Extend hold (SC 2.2.1)" recommended :code="C.timerExtend">
        <div class="ada-mini-frame ada-focus-demo ada-stack" style="position:relative">
          <div class="ada-row" style="align-items:center;justify-content:space-between">
            <span role="timer" aria-live="off" aria-label="Time left to book" style="font-weight:700;font-variant-numeric:tabular-nums">Time left: {{ fmt(t.c) }}</span>
            <button ref="warnTrigger" type="button" class="q-btn q-btn--outline q-btn--rectangle text-primary q-btn--no-uppercase" style="padding:4px 10px" @click="openWarn">Show warning now</button>
          </div>
          <p role="status" class="ada-note">{{ t.extendedMsg }}</p>
          <div v-if="t.warn" ref="warnEl" role="alertdialog" aria-modal="true" aria-labelledby="pc-extend-title" aria-describedby="pc-extend-desc"
            style="border:2px solid #B45309;background:#FFFBEB;border-radius:8px;padding:12px">
            <h4 id="pc-extend-title" style="margin:0 0 4px;font-size:16px">Need more time?</h4>
            <p id="pc-extend-desc" style="margin:0 0 8px">Your rooms are released in {{ fmt(t.c) }}.</p>
            <div class="ada-row">
              <q-btn unelevated no-caps color="primary" label="Extend hold 15 minutes" @click="extend" />
              <q-btn flat no-caps color="primary" label="Dismiss" @click="dismiss" />
            </div>
          </div>
        </div>
        <template #why><p>2.2.1 requires a way to extend the limit, at least 20 seconds before it expires. The warning opens on its own at 2:00, or right away with the demo button. Focus moves to “Extend hold”, then returns afterward. Skip this only if the business documents the hold as essential.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.headings">
    <ada-option letter="A" title="Hotel name becomes h3, room names h4 (keep the look with classes)" recommended :code="C.headingsFix">
      <div class="ada-mini-frame" style="max-width:480px">
        <p class="ada-note" style="margin-bottom:6px">Resulting outline (level shown before each heading):</p>
        <ul style="margin:0;padding-left:0;list-style:none;line-height:1.8">
          <li><code>h2</code> Review your reservation</li>
          <li style="padding-left:20px"><code>h3</code> <strong>The Concord Hotel</strong></li>
          <li style="padding-left:40px"><code>h4</code> Aparthotel, 1 King Bed and 1 Queen Sofa Bed</li>
          <li style="padding-left:40px"><code>h4</code> King Studio</li>
        </ul>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.focus">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Focus the first invalid field on submit" recommended :code="C.focusFix" lang="js">
        <form class="ada-mini-frame ada-focus-demo ada-stack" novalidate style="max-width:420px" @submit.prevent="submitA">
          <div class="ada-stack" style="gap:4px">
            <label for="pa-f-name">Cardholder Name</label>
            <input id="pa-f-name" ref="nameA" v-model="fa.name" type="text" autocomplete="cc-name" :aria-invalid="String(errNameA)" :aria-describedby="errNameA ? 'pa-f-name-err' : undefined"
              :style="{ height: '40px', padding: '0 10px', borderRadius: '6px', border: errNameA ? '2px solid #B91C1C' : '1px solid #64748B' }" />
            <p v-if="errNameA" id="pa-f-name-err" style="margin:0;color:#B91C1C;font-size:13px"><q-icon name="error" size="14px" /> Enter the name on the card.</p>
          </div>
          <div class="ada-stack" style="gap:4px">
            <label for="pa-f-agree" style="display:flex;gap:8px;align-items:flex-start">
              <input id="pa-f-agree" ref="agreeRefA" v-model="fa.agree" type="checkbox" :aria-invalid="String(errAgreeA)" :aria-describedby="errAgreeA ? 'pa-f-agree-err' : undefined" style="width:18px;height:18px;margin:2px 0 0" />
              I agree to the reservation policies
            </label>
            <p v-if="errAgreeA" id="pa-f-agree-err" style="margin:0;color:#B91C1C;font-size:13px"><q-icon name="error" size="14px" /> Accept the policies to continue.</p>
          </div>
          <div><button type="submit" class="q-btn q-btn--unelevated q-btn--rectangle bg-primary text-white q-btn--no-uppercase" style="padding:8px 20px">Place Order</button></div>
          <p role="status" class="ada-note">{{ okA }}</p>
        </form>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Error summary that takes focus and links to each field" :code="C.focusSummary">
        <form class="ada-mini-frame ada-focus-demo ada-stack" novalidate style="max-width:420px" @submit.prevent="submitB">
          <div v-show="errorsB.length" ref="summaryB" role="alert" tabindex="-1" style="border:2px solid #B91C1C;border-radius:8px;padding:10px 12px;background:#FEF2F2">
            <h4 style="margin:0 0 4px;font-size:15px;color:#991B1B">There {{ errorsB.length === 1 ? 'is 1 problem' : 'are ' + errorsB.length + ' problems' }} with your reservation</h4>
            <ul style="margin:0;padding-left:18px">
              <li v-for="e in errorsB" :key="e.id"><a :href="'#' + e.id" style="color:#991B1B" @click.prevent="goTo(e.id)">{{ e.msg }}</a></li>
            </ul>
          </div>
          <div class="ada-stack" style="gap:4px">
            <label for="pb-f-name">Cardholder Name</label>
            <input id="pb-f-name" v-model="fb.name" type="text" autocomplete="cc-name" :aria-invalid="String(fb.tried && !fb.name.trim())" style="height:40px;padding:0 10px;border-radius:6px;border:1px solid #64748B" />
          </div>
          <label for="pb-f-agree" style="display:flex;gap:8px;align-items:flex-start">
            <input id="pb-f-agree" v-model="fb.agree" type="checkbox" :aria-invalid="String(fb.tried && !fb.agree)" style="width:18px;height:18px;margin:2px 0 0" />
            I agree to the reservation policies
          </label>
          <div><button type="submit" class="q-btn q-btn--unelevated q-btn--rectangle bg-primary text-white q-btn--no-uppercase" style="padding:8px 20px">Place Order</button></div>
          <p role="status" class="ada-note">{{ okB }}</p>
        </form>
        <template #why><p>This checkout can fail on fields from several steps at once. The summary lists every problem, and each link jumps focus to its field.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.overlay">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Overlay as role alertdialog with aria-live; focus moves in" recommended :code="C.overlayFix">
        <div class="ada-mini-frame ada-focus-demo" style="position:relative;min-height:160px">
          <div :inert="procA || undefined" class="ada-stack">
            <p style="margin:0">Total due today: <strong>$322.31</strong></p>
            <div><button ref="placeA" type="button" class="q-btn q-btn--unelevated q-btn--rectangle bg-primary text-white q-btn--no-uppercase" style="padding:8px 20px" @click="startA">Place Order</button></div>
            <p role="status" class="ada-note">{{ procDoneA }}</p>
          </div>
          <div v-if="procA" ref="overlayA" role="alertdialog" aria-modal="true" aria-labelledby="pa-proc-title" aria-describedby="pa-proc-desc" aria-live="assertive" tabindex="-1"
            style="position:absolute;inset:0;background:rgba(15,23,42,.88);color:#fff;border-radius:8px;display:grid;place-items:center;text-align:center;padding:12px">
            <div>
              <q-spinner size="28px" color="white" aria-hidden="true" />
              <h4 id="pa-proc-title" style="margin:8px 0 2px;font-size:16px">Processing your reservation</h4>
              <p id="pa-proc-desc" style="margin:0">Please don't refresh or close this page.</p>
            </div>
          </div>
        </div>
        <template #why><p>Press Place Order: focus moves into the overlay, the page behind becomes <code>inert</code>, and when processing finishes focus returns with a confirmation status.</p></template>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="Non-blocking alternative: aria-busy form plus a status message" :code="C.overlayBusy">
        <form class="ada-mini-frame ada-focus-demo ada-stack" :aria-busy="String(procB)" @submit.prevent="startB">
          <p style="margin:0">Total due today: <strong>$322.31</strong></p>
          <div><button type="submit" :aria-disabled="String(procB)" class="q-btn q-btn--unelevated q-btn--rectangle bg-primary text-white q-btn--no-uppercase" style="padding:8px 20px" @click="procB && $event.preventDefault()">
            <q-spinner v-if="procB" size="16px" color="white" aria-hidden="true" style="margin-right:6px" />{{ procB ? 'Placing order…' : 'Place Order' }}
          </button></div>
          <p role="status" class="ada-note">{{ statusB }}</p>
        </form>
        <template #why><p>Use this only if the product can drop the full-screen blocker. The warning is announced without moving focus, and <code>aria-disabled</code> keeps the button focusable so a second press does nothing.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
