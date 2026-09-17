<script setup>
// PaymentForm — the inline "Payment Method" form used in the checkout Payment
// step (replaces the tile selector + Add-payment dialogs). Two sections: Credit
// Card Information (accepted-card logos, cardholder name, card number, expiration
// month/year, security code) and Billing Information. Built from DS field styles;
// credit card only. `reassurance` shows the "$0 due now" hold note. Required-field
// errors surface on blur or when showErrors is set.
import { reactive, computed, watch, useId } from 'vue'
import { paymentLogo } from '../../lib/paymentLogos'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  // Optional reassurance line above the card fields (hidden by default). Pass a
  // string (e.g. a hold "$0 due now" note) to show it.
  reassurance: { type: String, default: '' },
  showErrors: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'update:valid'])

const form = reactive({
  cardholderName: '', cardNumber: '', expMonth: '', expYear: '', cvc: '',
  address1: '', address2: '', address3: '', country: 'United States', city: '', state: '', postal: '',
  ...props.modelValue,
})
watch(form, () => emit('update:modelValue', { ...form }), { deep: true })

// Accepted credit cards (logo imagery).
const CARDS = ['Visa', 'Mastercard', 'Discover', 'Amex']
const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const YEARS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035']
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Mexico', 'Germany', 'France']
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
const CVC_HINT = 'The 3- or 4-digit security code printed on your card (on the back for Visa/Mastercard/Discover, on the front for American Express).'

const REQUIRED = ['cardholderName', 'cardNumber', 'expMonth', 'expYear', 'cvc', 'address1', 'city', 'state', 'postal']
const touched = reactive({})
const show = (f) => props.showErrors || touched[f]
const err = (f) => (show(f) && REQUIRED.includes(f) && !String(form[f]).trim() ? 'Required' : '')

// WCAG 1.3.1 / 3.3.2 / 4.1.2 — every control needs a stable id so an explicit
// <label for>, its error message and (for the security code) its hint can be
// associated programmatically. useId() keeps the ids unique when more than one
// PaymentForm is mounted (expanded checkout + a dialog, say).
const uid = useId()
const fid = (f) => `${uid}-${f}`
const errId = (f) => `${uid}-${f}-err`
const cvcHintId = `${uid}-cvc-hint`
// aria-describedby: the field's own error node, plus any static hint. Both are
// dropped again the moment the error clears (3.3.1).
const describedBy = (f, extra = null) => [extra, err(f) ? errId(f) : null].filter(Boolean).join(' ') || undefined
const invalid = (f) => (err(f) ? 'true' : undefined)

// The step owns the submit, so it needs to know whether the card is complete —
// and, on a failed submit, which control to send focus to (3.3.1 / 2.4.3).
const missing = computed(() => REQUIRED.filter((f) => !String(form[f]).trim()))
watch(missing, (m) => emit('update:valid', m.length === 0), { immediate: true })
defineExpose({
  // Force every message to show and report validity.
  validate: () => missing.value.length === 0,
  // Mark everything touched so blur-gated messages appear on a failed submit.
  touchAll: () => REQUIRED.forEach((f) => { touched[f] = true }),
  firstInvalidId: () => (missing.value.length ? fid(missing.value[0]) : ''),
})
</script>

<template>
  <section class="pmf">
    <p v-if="reassurance" class="pmf__reassure"><q-icon name="check_circle" size="18px" /> {{ reassurance }}</p>

    <!-- CREDIT CARD INFORMATION — 1.3.1: the two visual sections are real
         groups, so "City" and "Postal Code" are announced as billing fields
         rather than as bare siblings. The legend carries the section heading. -->
    <fieldset class="pmf__group">
      <legend class="pmf__h">Credit Card Information</legend>
      <div class="pmf__cards">
        <img v-for="c in CARDS" :key="c" :src="paymentLogo(c)" :alt="c" class="pmf__cardlogo" />
        <span class="pmf__cardstext">Credit Cards Accepted</span>
      </div>

      <div class="pmf__grid">
        <div class="pmf__field">
          <label class="pmf__label" :for="fid('cardholderName')">Cardholder Name <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
          <input :id="fid('cardholderName')" v-model="form.cardholderName" autocomplete="cc-name" required :aria-invalid="invalid('cardholderName')" :aria-describedby="describedBy('cardholderName')" placeholder="Cardholder Name" :class="{ 'is-error': err('cardholderName') }" @blur="touched.cardholderName = true" />
          <small v-if="err('cardholderName')" :id="errId('cardholderName')" class="pmf__err">{{ err('cardholderName') }}</small>
        </div>
        <div class="pmf__field">
          <label class="pmf__label" :for="fid('cardNumber')">Card Number <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
          <input :id="fid('cardNumber')" v-model="form.cardNumber" inputmode="numeric" autocomplete="cc-number" required :aria-invalid="invalid('cardNumber')" :aria-describedby="describedBy('cardNumber')" placeholder="Card Number" :class="{ 'is-error': err('cardNumber') }" @blur="touched.cardNumber = true" />
          <small v-if="err('cardNumber')" :id="errId('cardNumber')" class="pmf__err">{{ err('cardNumber') }}</small>
        </div>

        <!-- Expiration — 4.1.2: the pair used to be a <span> over two unnamed
             selects (axe select-name). Each select now carries its own label and
             error node; the fieldset keeps "Expiration Date" as the group name. -->
        <fieldset class="pmf__field pmf__expset">
          <legend class="pmf__label">Expiration Date <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></legend>
          <div class="pmf__exp">
            <span class="pmf__selectwrap">
              <label class="sr-only" :for="fid('expMonth')">Expiration month</label>
              <select :id="fid('expMonth')" v-model="form.expMonth" autocomplete="cc-exp-month" required :aria-invalid="invalid('expMonth')" :aria-describedby="describedBy('expMonth')" :class="{ 'is-error': err('expMonth') }" @blur="touched.expMonth = true"><option value="" disabled>Month</option><option v-for="m in MONTHS" :key="m" :value="m">{{ m }}</option></select>
              <q-icon name="expand_more" size="18px" aria-hidden="true" />
            </span>
            <span class="pmf__selectwrap">
              <label class="sr-only" :for="fid('expYear')">Expiration year</label>
              <select :id="fid('expYear')" v-model="form.expYear" autocomplete="cc-exp-year" required :aria-invalid="invalid('expYear')" :aria-describedby="describedBy('expYear')" :class="{ 'is-error': err('expYear') }" @blur="touched.expYear = true"><option value="" disabled>Year</option><option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option></select>
              <q-icon name="expand_more" size="18px" aria-hidden="true" />
            </span>
          </div>
          <small v-if="err('expMonth')" :id="errId('expMonth')" class="pmf__err">Expiration month is required</small>
          <small v-if="err('expYear')" :id="errId('expYear')" class="pmf__err">Expiration year is required</small>
        </fieldset>

        <!-- Security code — 1.3.1/4.1.2: the info button used to sit INSIDE the
             label, folding "About the security code" into the input's name (and
             interactive content in a label is invalid). It now sits beside the
             label, and the hint reaches the input through aria-describedby so
             keyboard users get it without the hover-only tooltip (1.4.13). -->
        <div class="pmf__field">
          <span class="pmf__labelrow">
            <label class="pmf__label" :for="fid('cvc')">Security Code <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
            <button type="button" class="pmf__info" aria-label="About the security code" :aria-describedby="cvcHintId"><q-icon name="info" size="15px" /><q-tooltip class="pmf__tooltip" anchor="top middle" self="bottom middle" :offset="[0, 8]" max-width="300px">{{ CVC_HINT }}</q-tooltip></button>
          </span>
          <input :id="fid('cvc')" v-model="form.cvc" inputmode="numeric" autocomplete="cc-csc" required :aria-invalid="invalid('cvc')" :aria-describedby="describedBy('cvc', cvcHintId)" placeholder="Security Code" :class="{ 'is-error': err('cvc') }" @blur="touched.cvc = true" />
          <small v-if="err('cvc')" :id="errId('cvc')" class="pmf__err">{{ err('cvc') }}</small>
          <span :id="cvcHintId" class="sr-only">{{ CVC_HINT }}</span>
        </div>
      </div>
    </fieldset>

    <hr class="pmf__rule" />

    <!-- BILLING INFORMATION -->
    <fieldset class="pmf__group">
      <legend class="pmf__h">Billing Information</legend>
      <div class="pmf__grid">
        <div class="pmf__field pmf__field--full">
          <label class="pmf__label" :for="fid('address1')">Address Line 1 <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
          <input :id="fid('address1')" v-model="form.address1" autocomplete="billing address-line1" required :aria-invalid="invalid('address1')" :aria-describedby="describedBy('address1')" placeholder="Address Line 1" :class="{ 'is-error': err('address1') }" @blur="touched.address1 = true" />
          <small v-if="err('address1')" :id="errId('address1')" class="pmf__err">{{ err('address1') }}</small>
        </div>
        <div class="pmf__field pmf__field--full">
          <label class="pmf__label" :for="fid('address2')">Address Line 2</label>
          <input :id="fid('address2')" v-model="form.address2" autocomplete="billing address-line2" placeholder="Address Line 2" />
        </div>
        <div class="pmf__field pmf__field--full">
          <label class="pmf__label" :for="fid('address3')">Address Line 3</label>
          <input :id="fid('address3')" v-model="form.address3" autocomplete="billing address-line3" placeholder="Address Line 3" />
        </div>

        <div class="pmf__field pmf__field--full">
          <label class="pmf__label" :for="fid('country')">Country</label>
          <span class="pmf__selectwrap"><select :id="fid('country')" v-model="form.country" autocomplete="billing country-name"><option v-for="c in COUNTRIES" :key="c" :value="c">{{ c }}</option></select><q-icon name="expand_more" size="18px" aria-hidden="true" /></span>
        </div>

        <!-- City / State / Postal Code — one row -->
        <div class="pmf__field--full pmf__citygrid">
          <div class="pmf__field">
            <label class="pmf__label" :for="fid('city')">City <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
            <input :id="fid('city')" v-model="form.city" autocomplete="billing address-level2" required :aria-invalid="invalid('city')" :aria-describedby="describedBy('city')" placeholder="City" :class="{ 'is-error': err('city') }" @blur="touched.city = true" />
            <small v-if="err('city')" :id="errId('city')" class="pmf__err">{{ err('city') }}</small>
          </div>
          <div class="pmf__field">
            <label class="pmf__label" :for="fid('state')">State <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
            <span class="pmf__selectwrap"><select :id="fid('state')" v-model="form.state" autocomplete="billing address-level1" required :aria-invalid="invalid('state')" :aria-describedby="describedBy('state')" :class="{ 'is-error': err('state') }" @blur="touched.state = true"><option value="" disabled>Select</option><option v-for="s in STATES" :key="s" :value="s">{{ s }}</option></select><q-icon name="expand_more" size="18px" aria-hidden="true" /></span>
            <small v-if="err('state')" :id="errId('state')" class="pmf__err">{{ err('state') }}</small>
          </div>
          <div class="pmf__field">
            <label class="pmf__label" :for="fid('postal')">Postal Code <i class="pmf__req" aria-hidden="true">*</i><span class="sr-only">(required)</span></label>
            <input :id="fid('postal')" v-model="form.postal" autocomplete="billing postal-code" required :aria-invalid="invalid('postal')" :aria-describedby="describedBy('postal')" placeholder="Postal Code" :class="{ 'is-error': err('postal') }" @blur="touched.postal = true" />
            <small v-if="err('postal')" :id="errId('postal')" class="pmf__err">{{ err('postal') }}</small>
          </div>
        </div>
      </div>
    </fieldset>
  </section>
</template>

<style scoped>
.pmf__reassure { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; color: var(--ds-color-text-success); font-weight: 600; font-size: 0.9375rem; }

/* 1.3.1: "Credit Card Information" / "Billing Information" are <fieldset>
   groups now; the reset keeps the section heading and grid looking unchanged. */
.pmf__group { border: 0; padding: 0; margin: 0; min-width: 0; }
.pmf__h { display: block; width: 100%; padding: 0; font-size: 1rem; font-weight: 700; color: var(--ds-color-text); margin: 0 0 12px; }
.pmf__rule { border: 0; border-top: 1px solid var(--ds-color-border); margin: 24px 0; }

/* Accepted-card logos row */
.pmf__cards { display: flex; align-items: center; gap: 8px; margin: 0 0 18px; }
.pmf__cardlogo { height: 26px; width: auto; display: block; }
.pmf__cardstext { margin-left: 6px; color: var(--ds-color-text-subtle); font-size: 0.9375rem; }

.pmf__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.pmf__field { display: flex; flex-direction: column; gap: 6px; border: 0; padding: 0; margin: 0; min-width: 0; }
.pmf__field--full { grid-column: 1 / -1; }
/* Field labels (now explicit <label for> / <legend>, not spans) keep the
   original label typography. */
.pmf__field > label, .pmf__field > legend, .pmf__labelrow, .pmf__field > span { display: inline-flex; align-items: center; gap: 4px; font-size: 0.8125rem; font-weight: 600; color: var(--ds-color-text); }
.pmf__field > legend { display: block; width: 100%; padding: 0; margin-bottom: 6px; }
/* A fieldset can't be a flex container without the legend leaving the flow, so
   the expiry group lays its rows out with plain block flow + margins instead. */
.pmf__expset { display: block; }
.pmf__expset .pmf__err { display: block; margin-top: 6px; }
/* Security code: label + info button on one row (the button used to live inside
   the label). */
.pmf__labelrow { gap: 4px; }
.pmf__labelrow > label { display: inline-flex; align-items: center; gap: 4px; }
.pmf__req { color: var(--ds-color-text-danger); font-style: normal; }
.pmf__err { color: var(--ds-color-text-danger); font-size: 0.75rem; font-weight: 500; }

.pmf__field > input,
.pmf__selectwrap select {
  height: 46px; width: 100%; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md);
  padding: 0 14px; font-family: inherit; font-size: 0.9375rem; color: var(--ds-color-text); background: var(--ds-color-surface);
  outline: none; transition: border-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.pmf__field > input:focus, .pmf__selectwrap select:focus { border-color: var(--ds-color-border-focused); }
.pmf__field > input::placeholder { color: var(--ds-color-text-subtlest); }
.pmf__field > input.is-error, .pmf__selectwrap select.is-error { border-color: var(--ds-color-text-danger); }

.pmf__selectwrap { position: relative; display: flex; align-items: center; }
.pmf__selectwrap select { padding-right: 38px; appearance: none; -webkit-appearance: none; cursor: pointer; }
.pmf__selectwrap .q-icon { position: absolute; right: 12px; color: var(--ds-color-text-subtle); pointer-events: none; }

/* Expiration — Month + Year selects side by side */
.pmf__exp { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* City / State / Postal Code — one row */
.pmf__citygrid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px 16px; }

/* Security-code info tooltip trigger */
.pmf__info { display: inline-flex; align-items: center; padding: 0; border: 0; background: none; color: var(--ds-color-text-subtle); cursor: pointer; }
.pmf__info:hover { color: var(--ds-color-text); }

@media (max-width: 560px) { .pmf__grid, .pmf__citygrid { grid-template-columns: 1fr; } }
</style>

<!-- Unscoped: q-tooltip content is teleported outside this component. -->
<style>
.pmf__tooltip { max-width: 300px; font-size: 0.8125rem; line-height: 1.5; padding: 10px 12px; }
</style>
