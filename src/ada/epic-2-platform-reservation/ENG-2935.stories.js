// ENG-2935 · ADA-PLAT-RES-05 — platform checkout step 2 (Payment & credit card):
// orphaned billing/card labels, shared expiry label, card-brand alt text,
// unreachable CVV popover trigger, fake-span Edit/Discard/Email actions.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2935.linear.md?raw'
import PaymentForm from '../../presto/components/checkout/PaymentForm.vue'
import ReservationGuests from '../../presto/components/checkout/ReservationGuests.vue'
import { paymentLogo } from '../../presto/lib/paymentLogos'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-05 – Checkout Step 2: Payment & Credit Card Intake',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2935'),
}

const ID = 'ENG-2935'
const PAY = 'payment_information.plush.html'
const CC = 'credit_card_section.plush.html'

const ITEMS = {
  billing: { n: 1, title: 'Billing and email labels are orphaned (Country and State are fine)', wcag: ['1.3.1'], state: 'corrected', element: 'Form fields · billing address, email', where: `platform/app/templates/enduser/orders/${PAY}:47, 51, 58, 106, 110 (+2 in fallback block)` },
  card: { n: 2, title: 'Cardholder Name, Card Number and Security Code labels are orphaned', wcag: ['1.3.1', '4.1.2'], element: 'Form fields · credit card', where: `platform/app/templates/enduser/orders/${CC}:83, 96, 135` },
  expiry: { n: 3, title: 'Expiration Month and Year share one unlabeled label', wcag: ['1.3.1', '4.1.2'], state: 'corrected', element: 'Select pair · card expiry', where: `platform/app/templates/enduser/orders/${CC}:111-132` },
  alt: { n: 4, title: 'All four card-brand images use alt="Card image cap"', wcag: ['1.1.1'], element: 'Images · card brands', where: `platform/app/templates/enduser/orders/${CC}:34-37` },
  cvv: { n: 5, title: 'CVV popover trigger is not keyboard-reachable', wcag: ['2.1.1', '4.1.2'], state: 'corrected', element: 'Popover trigger · CVV help', where: 'platform/app/templates/partials/tooltip.plush.html:36-46 · end_user.js:44' },
  editDiscard: { n: 6, title: '"Edit" and "Discard" are non-interactive spans', wcag: ['2.1.1', '4.1.2'], element: 'Action links · saved card', where: `platform/app/templates/enduser/orders/${PAY}:23-29` },
  emails: { n: 7, title: '"Remove Email" and "Add Additional Email" are fake spans', wcag: ['2.1.1', '4.1.2'], state: 'new', element: 'Buttons · email list', where: `platform/app/templates/enduser/orders/${PAY}:117, :140` },
}

// Production snippets are reconstructed from the patterns and line numbers Linear
// cites (the platform repo isn't checked out here).
const C = {
  billingBad: `<!-- payment_information.plush.html:47 / :51 / :58 -->
<label class="form-label">Billing Address</label>
<input type="text" class="form-control" name="BillingAddress">
<label class="form-label">City</label>
<input type="text" class="form-control" name="BillingCity">
<label class="form-label">Postal Code</label>
<input type="text" class="form-control" name="BillingPostalCode">

<!-- :30 — already correct, leave alone -->
<label for="BillingCountry">Country</label>
<select id="BillingCountry" name="BillingCountry">…</select>`,
  cardBad: `<!-- credit_card_section.plush.html:83 / :96 / :135 -->
<label>Cardholder Name</label>
<input type="text" name="CardholderName">
<label>Card Number</label>
<input type="text" name="CardNumber" data-controller="card-number">
<label>Security Code</label>
<input type="text" name="SecurityCode">`,
  expiryBad: `<!-- credit_card_section.plush.html:111-132 -->
<label>Expiration Date</label>
<div class="d-flex">
  <select name="ExpMonth" class="form-select">
    <option>01</option> … <option>12</option>
  </select>
  <select name="ExpYear" class="form-select">
    <option>2026</option> … <option>2036</option>
  </select>
</div>`,
  altBad: `<!-- credit_card_section.plush.html:34-37 -->
<img src="/assets/images/visa.svg"       alt="Card image cap">
<img src="/assets/images/mastercard.svg" alt="Card image cap">
<img src="/assets/images/amex.svg"       alt="Card image cap">
<img src="/assets/images/discover.svg"   alt="Card image cap">`,
  cvvBad: `<!-- partials/tooltip.plush.html:36-46 -->
<span data-bs-toggle="popover" data-bs-trigger="click"
      data-bs-content="<%= content %>">
  <i class="fa fa-question-circle"></i>
</span>

// end_user.js:44 — click-triggered Bootstrap popover
new bootstrap.Popover(el, { trigger: 'click' })`,
  editBad: `<!-- payment_information.plush.html:23-29 -->
<span class="link-primary" data-action="click->payment#edit">Edit</span>
<span class="link-secondary" data-action="click->payment#discard">Discard</span>`,
  emailsBad: `<!-- payment_information.plush.html:117 / :140 -->
<span class="text-danger" data-action="click->payment#removeEmail">
  <i class="fa fa-times"></i> Remove Email
</span>
<span class="link-primary" data-action="click->payment#addEmail">
  <i class="fa fa-plus"></i> Add Additional Email
</span>`,
  prestoBilling: `<!-- presto-2026 PaymentForm.vue:94-126 — wrapping labels -->
<label class="pmf__field">
  <span>City *</span>
  <input v-model="form.city" placeholder="City" />
</label>

<!-- ReservationGuests.vue:150-156 — additional email has no label -->
<div class="cgf__field">
  <span>Additional email (optional)</span>
  <div class="rg__emailrow"><input type="email" v-model="e.value" /> …</div>
</div>`,
  prestoCard: `<!-- presto-2026 PaymentForm.vue:57-81 -->
<label class="pmf__field">
  <span>Card Number *</span>
  <input v-model="form.cardNumber" inputmode="numeric" placeholder="Card Number" />
</label>
<label class="pmf__field">
  <span>Security Code *
    <button type="button" aria-label="About the security code">…</button>  <!-- inside the label -->
  </span>
  <input v-model="form.cvc" … />
</label>
<!-- no autocomplete="cc-name / cc-number / cc-csc" anywhere -->`,
  prestoExpiry: `<!-- presto-2026 PaymentForm.vue:67-74 -->
<div class="pmf__field">
  <span>Expiration Date *</span>               <!-- a span, not a label -->
  <div class="pmf__exp">
    <select v-model="form.expMonth"><option value="" disabled>Month</option>…</select>
    <select v-model="form.expYear"><option value="" disabled>Year</option>…</select>
  </div>
</div>`,
  prestoAlt: `<!-- presto-2026 PaymentForm.vue:50-53 -->
<img v-for="c in CARDS" :src="paymentLogo(c)" :alt="c" />   <!-- Visa, Mastercard, Discover, Amex -->
<span>Credit Cards Accepted</span>`,
  prestoCvv: `<!-- presto-2026 PaymentForm.vue:77 -->
<button type="button" class="pmf__info" aria-label="About the security code">
  <q-icon name="info" />
  <q-tooltip>{{ CVC_HINT }}</q-tooltip>
</button>`,
  billingFix: `<label for="billing-address" class="form-label">Billing Address</label>
<input id="billing-address" name="BillingAddress" …>

<label for="billing-city" class="form-label">City</label>
<input id="billing-city" name="BillingCity" …>

<label for="billing-postal" class="form-label">Postal Code</label>
<input id="billing-postal" name="BillingPostalCode" …>

<label for="contact-email" class="form-label">Email</label>
<input id="contact-email" type="email" name="Email" …>

<label for="contact-email-confirm" class="form-label">Email Confirmation</label>
<input id="contact-email-confirm" type="email" name="EmailConfirmation" …>

<!-- + the 2 fallback-block fields; Country (L30) and State (L74) unchanged -->`,
  billingFieldset: `<fieldset>
  <legend>Billing address</legend>
  <label for="billing-address">Billing Address</label>
  <input id="billing-address" autocomplete="billing street-address" …>
  <label for="billing-city">City</label>
  <input id="billing-city" autocomplete="billing address-level2" …>
  <label for="billing-postal">Postal Code</label>
  <input id="billing-postal" autocomplete="billing postal-code" …>
</fieldset>
<label for="contact-email">Email</label>
<input id="contact-email" type="email" autocomplete="email" …>`,
  cardFix: `<label for="cc-name">Cardholder Name</label>
<input id="cc-name" name="CardholderName" …>

<label for="cc-number">Card Number</label>
<input id="cc-number" name="CardNumber" …>

<label for="cc-csc">Security Code</label>
<input id="cc-csc" name="SecurityCode" …>`,
  cardAutocomplete: `<input id="cc-name"   autocomplete="cc-name" …>
<input id="cc-number" autocomplete="cc-number" inputmode="numeric" …>
<select id="cc-exp-month" autocomplete="cc-exp-month">…</select>
<select id="cc-exp-year"  autocomplete="cc-exp-year">…</select>
<input id="cc-csc"    autocomplete="cc-csc" inputmode="numeric" …>`,
  expiryFix: `<span class="form-label" id="cc-exp-label">Expiration Date</span>
<div class="d-flex gap-2">
  <div>
    <label for="cc-exp-month">Expiration Month</label>
    <select id="cc-exp-month" name="ExpMonth" class="form-select">…</select>
  </div>
  <div>
    <label for="cc-exp-year">Expiration Year</label>
    <select id="cc-exp-year" name="ExpYear" class="form-select">…</select>
  </div>
</div>`,
  expiryFieldset: `<fieldset>
  <legend>Expiration date</legend>
  <label for="cc-exp-month">Month</label>
  <select id="cc-exp-month" name="ExpMonth" autocomplete="cc-exp-month">…</select>
  <label for="cc-exp-year">Year</label>
  <select id="cc-exp-year" name="ExpYear" autocomplete="cc-exp-year">…</select>
</fieldset>`,
  altFix: `<img src="/assets/images/visa.svg"       alt="Visa">
<img src="/assets/images/mastercard.svg" alt="Mastercard">
<img src="/assets/images/amex.svg"       alt="American Express">
<img src="/assets/images/discover.svg"   alt="Discover">`,
  altList: `<p id="cards-accepted">Cards accepted:</p>
<ul class="list-inline" aria-labelledby="cards-accepted">
  <li class="list-inline-item"><img src="…/visa.svg" alt="Visa"></li>
  <li class="list-inline-item"><img src="…/mastercard.svg" alt="Mastercard"></li>
  <li class="list-inline-item"><img src="…/amex.svg" alt="American Express"></li>
  <li class="list-inline-item"><img src="…/discover.svg" alt="Discover"></li>
</ul>`,
  cvvFix: `<!-- partials/tooltip.plush.html -->
<span tabindex="0" role="button"
      aria-label="What is the security code?"
      aria-describedby="<%= id %>-hint"
      data-bs-toggle="popover" data-bs-trigger="click"
      data-bs-content="<%= content %>">
  <i class="fa fa-question-circle" aria-hidden="true"></i>
</span>
<span id="<%= id %>-hint" class="visually-hidden"><%= content %></span>

// end_user.js — keep click; add Enter/Space for the span
el.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click() }
})`,
  cvvButton: `<button type="button" class="btn btn-link p-0"
        aria-expanded="false" aria-controls="cvv-hint">
  <i class="fa fa-question-circle" aria-hidden="true"></i>
  <span class="visually-hidden">What is the security code?</span>
</button>
<p id="cvv-hint" role="status" hidden>
  The 3- or 4-digit code on your card…
</p>
<input id="cc-csc" aria-describedby="cvv-hint" …>`,
  editFix: `<button type="button" class="btn btn-link" data-action="payment#edit">
  Edit<span class="visually-hidden"> saved card ending 1009</span>
</button>
<button type="button" class="btn btn-link" data-action="payment#discard">
  Discard<span class="visually-hidden"> changes to saved card</span>
</button>`,
  emailsFix: `<label for="email-<%= i %>">Additional Email <%= i %></label>
<input id="email-<%= i %>" type="email" name="AdditionalEmails[<%= i %>]">
<button type="button" class="btn btn-link text-danger"
        aria-label="Remove additional email <%= i %>"
        data-action="payment#removeEmail">
  <i class="fa fa-times" aria-hidden="true"></i> Remove
</button>

<button type="button" class="btn btn-link" data-action="payment#addEmail">
  <i class="fa fa-plus" aria-hidden="true"></i> Add Additional Email
</button>`,
}

const inputStyle = 'height:40px;padding:0 10px;border:1px solid #64748B;border-radius:6px;font:inherit'
const CARDS = [['Visa', 'Visa'], ['Mastercard', 'Mastercard'], ['Amex', 'American Express'], ['Discover', 'Discover']]

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Step 2 of the platform checkout takes billing details and the card. Most fields have no programmatic name, the expiry selects share one label, and the help and action controls can't be reached from the keyboard.">

  <ada-item v-bind="I.billing">
    <p>Billing Address, City, Postal Code, Email and Email Confirmation, plus two more fields in the fallback block, have visible labels that aren't linked to their inputs. Linear confirms that Country (L30) and State (L74) are already linked and should be left alone.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — payment_information.plush.html" :code="C.billingBad" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Every form control MUST have a programmatically associated label (&lt;label for&gt; matching the input id).">
      <p>Confirmed. One count to check: the problem statement lists 7 fields (5 named + 2 in the fallback block), but the acceptance criteria say 9. Either way, fix every bare <code>&lt;label&gt;</code> in the template, not just a fixed number of them.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Use autocomplete attributes (street-address, address-level2, postal-code, email) and fieldset/legend for related groups such as an address.">
      <p>This is a payment form, so SC 1.3.5 Identify Input Purpose (AA) applies too. Linking the labels is necessary but not sufficient: add <code>autocomplete</code> tokens and group the address under a “Billing address” legend (Proposal, Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.card">
    <p>In <code>credit_card_section.plush.html</code>, Cardholder Name, Card Number and Security Code each have a bare <code>&lt;label&gt;</code>. Screen readers announce three unnamed text fields in a row on the most sensitive part of the form.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — credit_card_section.plush.html:83, 96, 135" :code="C.cardBad" />
    <sr-output before="edit text · edit text · edit text" after="Cardholder Name, edit text · Card Number, edit text · Security Code, edit text" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Autocomplete: cc-name, cc-number, cc-exp, cc-csc.">
      <p>Agrees. Also add <code>autocomplete="cc-*"</code> tokens so browsers and password managers can fill the card, which saves motor-impaired users from typing 16 digits.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.expiry">
    <p>Month and Year are two <code>&lt;select&gt;</code>s under one “Expiration Date” <code>&lt;label&gt;</code> that points at neither. Each select is announced only by its current value (“01, combo box”). Linear corrected the line range to L111-132.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — credit_card_section.plush.html:111-132" :code="C.expiryBad" />
    <sr-output before="01, combo box · 2026, combo box" after="Expiration Month, 01, combo box · Expiration Year, 2026, combo box" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Fieldset/legend when the group label provides essential context for the individual fields.">
      <p>Agrees each select needs its own label. A <code>&lt;fieldset&gt;&lt;legend&gt;Expiration date&lt;/legend&gt;</code> with short “Month”/“Year” labels is the idiomatic alternative (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.alt">
    <p>Every brand logo is announced as “Card image cap”, the placeholder alt from Bootstrap's card example. Users can't tell which cards are accepted.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — credit_card_section.plush.html:34-37" :code="C.altBad" />
    <sr-output before="Card image cap, image (×4)" after="Visa, image · Mastercard, image · American Express, image · Discover, image" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Describe content, not appearance; generic alt text (&quot;image&quot;, &quot;photo&quot;) is a defect.">
      <p>Confirmed. If the brands are also written out as text nearby, the logos would be decorative (<code>alt=""</code>) so they aren't announced twice.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.cvv">
    <p>Linear corrected this finding: the CVV help isn't hover-only. It's a Bootstrap popover opened by <strong>click</strong> (<code>end_user.js:44</code>). The real defect is that the trigger is a <code>&lt;span&gt;</code> with no <code>tabindex</code>, so keyboard users can never open it.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — tooltip.plush.html:36-46" :code="C.cvvBad" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="tabindex=&quot;0&quot; makes non-interactive elements focusable (use sparingly) — it does not make them operable.">
      <p>Adding only <code>tabindex="0"</code> makes the span focusable, but Enter and Space still do nothing, because a span doesn't fire <code>click</code> from the keyboard. The span also needs <code>role="button"</code>, a name and a key handler (Option A demo), or it should be a real <code>&lt;button&gt;</code> (Option B).</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Additional instructions beyond the label must be programmatically associated (aria-describedby).">
      <p>Point <code>aria-describedby</code> at hint text that's always in the DOM. Bootstrap only inserts popover content while it's open, so a description that references it would be empty most of the time. Linking the same hint from the Security Code input also helps users who never open the popover.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.editDiscard">
    <p>“Edit” and “Discard” on the saved card are <code>&lt;span&gt;</code>s with click actions. They aren't focusable and have no button role.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — payment_information.plush.html:23-29" :code="C.editBad" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Every interactive element must be reachable and operable by keyboard.">
      <p>Confirmed. Give each a context-specific name too (“Edit saved card ending 1009”), since “Edit” alone is ambiguous in a buttons list.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.emails">
    <p>The same fake-span pattern repeats for “Remove Email” (L117) and “Add Additional Email” (L140).</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — payment_information.plush.html:117, 140" :code="C.emailsBad" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="Deletion and removal: move focus to the next item; never let focus disappear.">
      <p>Agrees. When there's more than one row, name each remove button for its row (“Remove additional email 2”). After a removal, send focus to the next row or to “Add Additional Email”.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, PaymentForm, ReservationGuests },
    setup: () => ({
      ID, I: ITEMS, C, PRESTO,
      pay1: ref({ country: 'United States' }),
      pay2: ref({}),
      guests: ref([{ firstName: 'Alex', lastName: 'Smith', email: 'alex@example.com', additionalEmails: [{ value: 'jordan@example.com' }] }]),
      rooms: [{ adults: 1, children: 0 }],
    }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 replaces this step with the inline PaymentForm (card + billing). Emails moved to the Contact Info step. Most labels are already native. The expiry pair is the clear repeat.">

  <ada-item v-bind="I.billing">
    <ada-before status="partial" source="presto-2026 Storybook › Checkout › Payment" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <div style="max-width:720px"><payment-form v-model="pay1" /></div>
      <template #notes>
        <p><strong>Already right:</strong> Address Line 1-3, Country, City, State and Postal Code each use a wrapping <code>&lt;label&gt;</code> (<code>PaymentForm.vue:94-126</code>), so every billing field has a name.</p>
        <p><strong>Still open:</strong> the required email lives in <code>ReservationGuests</code> and is labeled, but each “Additional email” input is a <code>&lt;span&gt;</code> + bare <code>&lt;input&gt;</code> (<code>ReservationGuests.vue:150-156</code>; see item 7). No billing field has an <code>autocomplete</code> token, and the address isn't grouped in a fieldset. The expiry findings in this frame are item 3.</p>
        <ada-code tone="neutral" caption="presto-2026 source" :code="C.prestoBilling" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.card">
    <ada-before status="resolved" source="presto-2026 Storybook › Checkout › Payment (same frame as item 1)" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <ada-code tone="good" caption="presto-2026 PaymentForm.vue:57-81" :code="C.prestoCard" />
      <template #notes>
        <p>Cardholder Name, Card Number and Security Code are wrapped in <code>&lt;label&gt;</code>, so each has a name. See the frame in item 1.</p>
        <p><strong>Minor:</strong> the CVV info <code>&lt;button&gt;</code> sits <em>inside</em> the Security Code label, so its name (“About the security code”) is folded into the input's name, and interactive content inside a label is invalid. None of the card fields has an <code>autocomplete="cc-*"</code> token either.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.expiry">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout › Payment › Validation Errors" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--validation-errors')">
      <div style="max-width:720px"><payment-form v-model="pay2" show-errors /></div>
      <template #notes>
        <p><strong>Same defect.</strong> “Expiration Date” is a <code>&lt;span&gt;</code>, and the Month/Year <code>&lt;select&gt;</code>s have no label at all (<code>PaymentForm.vue:67-74</code>). The only hint is the disabled placeholder option. axe reports <code>select-name</code> for both selects in this frame. The single “Required” below them isn't tied to either one.</p>
        <ada-code tone="bad" caption="presto-2026 source" :code="C.prestoExpiry" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.alt">
    <ada-before status="resolved" source="presto-2026 › PaymentForm.vue:50-53" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <ada-code tone="good" caption="presto-2026 source" :code="C.prestoAlt" />
      <template #notes><p>Each logo's <code>alt</code> is the brand name (“Visa”, “Mastercard”, “Discover”, “Amex”). The only nit: “Amex” is read letter by letter by some screen readers, so “American Express” is clearer.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.cvv">
    <ada-before status="partial" source="presto-2026 › PaymentForm.vue:77 (Quasar 2.19.3)" :href="PRESTO.story('checkout-experience-components-book-reservation-payment--default')">
      <ada-code tone="neutral" caption="presto-2026 source" :code="C.prestoCvv" />
      <template #notes>
        <p><strong>Already right:</strong> the trigger is a native <code>&lt;button&gt;</code> with an <code>aria-label</code>, so it's reachable and has a name.</p>
        <p><strong>Still open (in the published presto-2026 build):</strong> presto-2026 ships Quasar 2.19.3, whose <code>QTooltip</code> opens only on mouse hover or touch. It doesn't open on keyboard focus and sets no <code>aria-describedby</code>, so keyboard and screen-reader users still can't get the hint. This audit repo runs Quasar 2.33.0, whose QTooltip does open on focus, links <code>aria-describedby</code> and closes on Esc. Upgrading presto-2026 would close this gap.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.editDiscard">
    <ada-before status="no-equivalent" source="presto-2026 › checkout/PaymentForm.vue, PayWith.vue">
      <template #empty>presto-2026's payment step is a fresh, credit-card-only form. It has no saved card with Edit/Discard actions. The old Payment Method dialog (Old Designs) used native buttons, but it's no longer part of the flow.</template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.emails">
    <ada-before status="resolved" source="presto-2026 Storybook › Checkout › Reservation Guests" :href="PRESTO.story('checkout-experience-components-book-reservation-reservation-guests--single-room')">
      <div style="max-width:720px"><reservation-guests v-model="guests" :rooms="rooms" /></div>
      <template #notes>
        <p>“Add another email address” and the remove (×) control are native <code>&lt;button&gt;</code>s (<code>ReservationGuests.vue:154, 158</code>), so they work from the keyboard.</p>
        <p><strong>Leftovers:</strong> every remove button is named just “Remove email”, removal doesn't move focus, and the additional-email input itself has no label. axe also flags the unlabeled Country select in this frame (ENG-2934 item 1).</p>
      </template>
    </ada-before>
  </ada-item>
</ada-issue>`,
  }),
}

/* --------------------------------------------------------------- Proposal */
let seq = 0
export const Proposal = {
  parameters: VIEW_PARAMS.proposal,
  render: () => ({
    components: kit,
    setup() {
      const cvvOpenA = ref(false)
      const cvvOpenB = ref(false)
      const toggleA = () => { cvvOpenA.value = !cvvOpenA.value }
      const editing = ref(false)
      const editBtn = ref(null)
      const cardName = ref('Alex Smith')
      const startEdit = async () => { editing.value = true; await nextTick(); document.getElementById('pe-edit-name')?.focus() }
      const discard = async () => { editing.value = false; cardName.value = 'Alex Smith'; await nextTick(); editBtn.value?.focus() }
      const emails = reactive([{ id: ++seq, v: 'jordan@example.com' }, { id: ++seq, v: 'sam@example.com' }])
      const emailList = ref(null)
      const addBtn = ref(null)
      const emailStatus = ref('')
      const addEmail = async () => {
        emails.push({ id: ++seq, v: '' })
        await nextTick()
        document.getElementById(`pe-email-${emails[emails.length - 1].id}`)?.focus()
      }
      const removeEmail = async (i) => {
        emails.splice(i, 1)
        emailStatus.value = 'Additional email removed.'
        await nextTick()
        const btns = emailList.value?.querySelectorAll('[data-remove]') || []
        ;(btns[i] || btns[i - 1] || addBtn.value)?.focus()
      }
      return { ID, I: ITEMS, C, CARDS, paymentLogo, inputStyle, cvvOpenA, cvvOpenB, toggleA, editing, editBtn, cardName, startEdit, discard, emails, emailList, addBtn, emailStatus, addEmail, removeEmail, exp: reactive({ m: null, y: null }), MONTHS: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], YEARS: ['2026', '2027', '2028', '2029', '2030'] }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is Linear's acceptance criterion. The demos are live: click a label to check it focuses its field, and Tab through the help and action controls.">

  <ada-item v-bind="I.billing">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Connect every orphaned billing and email label; leave Country and State alone" recommended :code="C.billingFix">
        <div class="ada-mini-frame ada-focus-demo ada-stack" style="max-width:420px">
          <div class="ada-stack" style="gap:4px"><label for="pa-bill-addr">Billing Address</label><input id="pa-bill-addr" type="text" :style="inputStyle" /></div>
          <div class="ada-row">
            <div class="ada-stack" style="gap:4px;flex:2"><label for="pa-bill-city">City</label><input id="pa-bill-city" type="text" :style="inputStyle" /></div>
            <div class="ada-stack" style="gap:4px;flex:1"><label for="pa-bill-postal">Postal Code</label><input id="pa-bill-postal" type="text" :style="inputStyle" /></div>
          </div>
          <div class="ada-stack" style="gap:4px"><label for="pa-email">Email</label><input id="pa-email" type="email" :style="inputStyle" /></div>
          <div class="ada-stack" style="gap:4px"><label for="pa-email2">Email Confirmation</label><input id="pa-email2" type="email" :style="inputStyle" /></div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Also group the address in a fieldset and add autocomplete tokens" :code="C.billingFieldset">
        <fieldset class="ada-mini-frame ada-focus-demo ada-stack" style="max-width:420px;margin:0">
          <legend style="font-weight:700;padding:0 4px">Billing address</legend>
          <q-input dense outlined label="Billing Address" autocomplete="billing street-address" />
          <div class="ada-row">
            <q-input dense outlined label="City" autocomplete="billing address-level2" style="flex:2;min-width:140px" />
            <q-input dense outlined label="Postal Code" autocomplete="billing postal-code" style="flex:1;min-width:110px" />
          </div>
        </fieldset>
        <template #why><p>SC 1.3.5 (AA) requires <code>autocomplete</code> on fields that collect the user's own data. It lets browsers fill the address in one step. The legend separates the billing address from the reservation address.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.card">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Connect Cardholder Name, Card Number and Security Code labels" recommended :code="C.cardFix">
        <div class="ada-mini-frame ada-focus-demo ada-stack" style="max-width:420px">
          <div class="ada-stack" style="gap:4px"><label for="pa-cc-name">Cardholder Name</label><input id="pa-cc-name" type="text" :style="inputStyle" /></div>
          <div class="ada-stack" style="gap:4px"><label for="pa-cc-number">Card Number</label><input id="pa-cc-number" type="text" inputmode="numeric" :style="inputStyle" /></div>
          <div class="ada-stack" style="gap:4px;max-width:160px"><label for="pa-cc-csc">Security Code</label><input id="pa-cc-csc" type="text" inputmode="numeric" :style="inputStyle" /></div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Add cc-* autocomplete tokens to every card field" :code="C.cardAutocomplete">
        <div class="ada-mini-frame ada-focus-demo ada-stack" style="max-width:420px">
          <q-input dense outlined label="Cardholder Name" autocomplete="cc-name" />
          <q-input dense outlined label="Card Number" autocomplete="cc-number" inputmode="numeric" />
          <q-input dense outlined label="Security Code" autocomplete="cc-csc" inputmode="numeric" style="max-width:160px" />
        </div>
        <template #why><p>Browsers and password managers can then fill the saved card, so users with motor or memory impairments don't have to type or recall 16 digits.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.expiry">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="A label on each select: Expiration Month and Expiration Year" recommended :code="C.expiryFix">
        <div class="ada-mini-frame ada-focus-demo" style="max-width:420px">
          <p style="margin:0 0 6px;font-weight:700">Expiration Date</p>
          <div class="ada-row">
            <div class="ada-stack" style="gap:4px;flex:1"><label for="pa-exp-m">Expiration Month</label>
              <select id="pa-exp-m" :style="inputStyle"><option v-for="m in MONTHS" :key="m">{{ m }}</option></select></div>
            <div class="ada-stack" style="gap:4px;flex:1"><label for="pa-exp-y">Expiration Year</label>
              <select id="pa-exp-y" :style="inputStyle"><option v-for="y in YEARS" :key="y">{{ y }}</option></select></div>
          </div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Fieldset with an Expiration date legend and short Month and Year labels" :code="C.expiryFieldset">
        <fieldset class="ada-mini-frame ada-focus-demo" style="max-width:420px;margin:0">
          <legend style="font-weight:700;padding:0 4px">Expiration date</legend>
          <div class="ada-row">
            <q-select dense outlined label="Month" v-model="exp.m" :options="MONTHS" style="flex:1;min-width:120px" />
            <q-select dense outlined label="Year" v-model="exp.y" :options="YEARS" style="flex:1;min-width:120px" />
          </div>
        </fieldset>
        <template #why><p>The screen reader hears “Expiration date, group, Month, combo box”. The visible labels stay short, which suits the narrow two-up layout.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.alt">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Brand names as alt text" recommended :code="C.altFix">
        <div class="ada-row" style="align-items:center">
          <img v-for="c in CARDS" :key="c[0]" :src="paymentLogo(c[0])" :alt="c[1]" style="height:28px" />
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Name the logo row as a list of accepted cards" :code="C.altList">
        <p id="pb-cards-accepted" style="margin:0 0 6px;font-weight:700">Cards accepted:</p>
        <ul aria-labelledby="pb-cards-accepted" class="ada-row" style="list-style:none;margin:0;padding:0;align-items:center">
          <li v-for="c in CARDS" :key="c[0]"><img :src="paymentLogo(c[0])" :alt="c[1]" style="height:28px" /></li>
        </ul>
        <template #why><p>The screen reader hears “Cards accepted, list, 4 items, Visa…”. The context comes first, and users can skip the whole row.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.cvv">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="tabindex 0 on the existing trigger (keep click) plus aria-describedby" recommended :code="C.cvvFix">
        <div class="ada-mini-frame ada-focus-demo" style="max-width:420px">
          <div class="ada-row" style="align-items:center;gap:6px">
            <label for="pa-cvv">Security Code</label>
            <span tabindex="0" role="button" aria-label="What is the security code?" aria-describedby="pa-cvv-hint" :aria-expanded="String(cvvOpenA)"
              style="cursor:pointer;display:inline-flex;color:#475569" @click="toggleA" @keydown.enter.prevent="toggleA" @keydown.space.prevent="toggleA">
              <q-icon name="help_outline" size="18px" />
            </span>
          </div>
          <span id="pa-cvv-hint" class="ada-sr-only">The 3- or 4-digit code printed on your card.</span>
          <p v-if="cvvOpenA" style="margin:6px 0;padding:8px 10px;background:#0F172A;color:#fff;border-radius:6px;font-size:13px">The 3- or 4-digit code printed on your card (back for Visa, Mastercard and Discover; front for Amex).</p>
          <input id="pa-cvv" type="text" inputmode="numeric" aria-describedby="pa-cvv-hint" :style="inputStyle" style="margin-top:4px;max-width:160px" />
        </div>
        <template #why><p>Implemented as Linear specifies, plus the <code>role="button"</code> and Enter/Space handler that a focusable span needs (see the keyboard-navigator note). The hint stays in the DOM so <code>aria-describedby</code> always resolves.</p></template>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="keyboard-navigator" title="Replace the span with a real button toggletip" :code="C.cvvButton">
        <div class="ada-mini-frame ada-focus-demo" style="max-width:420px">
          <div class="ada-row" style="align-items:center;gap:6px">
            <label for="pb-cvv">Security Code</label>
            <button type="button" aria-controls="pb-cvv-hint" :aria-expanded="String(cvvOpenB)" style="border:0;background:none;padding:2px;cursor:pointer;color:#475569;display:inline-flex" @click="cvvOpenB = !cvvOpenB">
              <q-icon name="help_outline" size="18px" /><span class="ada-sr-only">What is the security code?</span>
            </button>
          </div>
          <p id="pb-cvv-hint" v-show="cvvOpenB" role="status" style="margin:6px 0;padding:8px 10px;background:#0F172A;color:#fff;border-radius:6px;font-size:13px">The 3- or 4-digit code printed on your card (back for Visa, Mastercard and Discover; front for Amex).</p>
          <input id="pb-cvv" type="text" inputmode="numeric" :style="inputStyle" style="margin-top:4px;max-width:160px" />
        </div>
        <template #why><p>A native button gets focus, Enter/Space and its role for free, and <code>aria-expanded</code> reports the open state. This removes the extra key handler and the Bootstrap popover dependency.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.editDiscard">
    <ada-option letter="A" title="Edit and Discard become buttons with a context-specific name" recommended :code="C.editFix">
      <div class="ada-mini-frame ada-focus-demo" style="max-width:420px">
        <div v-if="!editing" class="ada-row" style="align-items:center">
          <span style="flex:1">Visa ending 1009 · {{ cardName }}</span>
          <button ref="editBtn" type="button" class="q-btn q-btn--flat q-btn--rectangle text-primary q-btn--no-uppercase" style="padding:4px 8px" @click="startEdit">Edit<span class="ada-sr-only"> saved card ending 1009</span></button>
        </div>
        <div v-else class="ada-stack">
          <div class="ada-stack" style="gap:4px"><label for="pe-edit-name">Cardholder Name</label><input id="pe-edit-name" v-model="cardName" type="text" :style="inputStyle" /></div>
          <div><button type="button" class="q-btn q-btn--flat q-btn--rectangle text-negative q-btn--no-uppercase" style="padding:4px 8px" @click="discard">Discard<span class="ada-sr-only"> changes to saved card</span></button></div>
        </div>
      </div>
      <template #why><p>Press Edit: focus moves into the first field. Press Discard: focus returns to Edit.</p></template>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.emails">
    <ada-option letter="A" title="Remove Email and Add Additional Email become real buttons" recommended :code="C.emailsFix">
      <div class="ada-mini-frame ada-focus-demo" style="max-width:420px">
        <ul ref="emailList" class="ada-stack" style="list-style:none;margin:0 0 8px;padding:0">
          <li v-for="(e, i) in emails" :key="e.id" class="ada-stack" style="gap:4px">
            <label :for="'pe-email-' + e.id">Additional Email {{ i + 1 }}</label>
            <div class="ada-row" style="align-items:center;flex-wrap:nowrap">
              <input :id="'pe-email-' + e.id" v-model="e.v" type="email" :style="inputStyle" style="flex:1;min-width:0" />
              <q-btn data-remove flat dense no-caps color="negative" icon="close" label="Remove" :aria-label="'Remove additional email ' + (i + 1)" @click="removeEmail(i)" />
            </div>
          </li>
        </ul>
        <button ref="addBtn" type="button" class="q-btn q-btn--flat q-btn--rectangle text-primary q-btn--no-uppercase" style="padding:4px 8px" @click="addEmail">+ Add Additional Email</button>
        <p role="status" class="ada-note" style="margin-top:4px">{{ emailStatus }}</p>
      </div>
      <template #why><p>Add moves focus to the new field. Remove moves focus to the next row's Remove button, or to Add when none are left.</p></template>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
