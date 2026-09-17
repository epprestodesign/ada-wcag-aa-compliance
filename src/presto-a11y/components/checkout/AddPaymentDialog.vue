<script setup>
// AddPaymentDialog — Instacart-style "Add Payment" form modal: card number,
// expiry, CVC, billing ZIP, and a human-check, with a Save that stays disabled
// until the form is valid. Emits `save` with the new card on success.
import { ref, computed, useId } from 'vue'
import { useQuasar } from 'quasar'

defineProps({ modelValue: { type: Boolean, default: false } })
const $q = useQuasar()
const emit = defineEmits(['update:modelValue', 'save', 'back'])

const number = ref('')
const exp = ref('')
const cvc = ref('')
const zip = ref('')
const human = ref(false)

const digits = (s) => s.replace(/\D/g, '')
const brandOf = (n) => {
  const d = digits(n)
  if (/^3/.test(d)) return 'Amex'
  if (/^4/.test(d)) return 'Visa'
  if (/^5/.test(d)) return 'Mastercard'
  if (/^6/.test(d)) return 'Discover'
  return 'Card'
}
// Light formatting as the user types.
const onNumber = (e) => { number.value = digits(e.target.value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }
const onExp = (e) => { const d = digits(e.target.value).slice(0, 4); exp.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }

const valid = computed(() =>
  digits(number.value).length >= 15 &&
  /^\d\d\/\d\d$/.test(exp.value) &&
  digits(cvc.value).length >= 3 &&
  digits(zip.value).length >= 5 &&
  human.value)

// WCAG 1.3.1 / 3.3.2 / 4.1.2 — these inputs were named by their placeholder
// alone (read as a value, gone the moment you type). Same field convention as
// PaymentForm: an explicit <label for> (visually hidden where the design has no
// room for one) plus the standard autocomplete tokens.
const uid = useId()
const fid = (f) => `${uid}-${f}`

const close = () => emit('update:modelValue', false)
const reset = () => { number.value = ''; exp.value = ''; cvc.value = ''; zip.value = ''; human.value = false }
const save = () => {
  // aria-disabled keeps the button clickable, so an incomplete save sends focus
  // to the first field that still needs an answer instead of doing nothing.
  if (!valid.value) {
    const f = digits(number.value).length < 15 ? 'number'
      : !/^\d\d\/\d\d$/.test(exp.value) ? 'exp'
        : digits(cvc.value).length < 3 ? 'cvc'
          : digits(zip.value).length < 5 ? 'zip' : ''
    document.getElementById(fid(f))?.focus()
    return
  }
  emit('save', { id: `card-${digits(number.value).slice(-4)}`, brand: brandOf(number.value), last4: digits(number.value).slice(-4), exp: exp.value })
  close()
  reset()
}
</script>

<template>
  <q-dialog :model-value="modelValue" :maximized="$q.screen.lt.sm" @update:model-value="emit('update:modelValue', $event)">
    <div class="apd">
      <div class="apd__head">
        <button type="button" class="apd__icon" aria-label="Back" @click="emit('back'); close()"><q-icon name="arrow_back" size="22px" /></button>
        <h3 class="apd__title">Add Payment</h3>
        <span class="apd__spacer" />
      </div>

      <div class="apd__body">
        <div class="apd__field apd__field--full">
          <q-icon name="credit_card" size="22px" class="apd__cardicon" aria-hidden="true" />
          <label class="sr-only" :for="fid('number')">Card number</label>
          <input :id="fid('number')" class="apd__input" inputmode="numeric" autocomplete="cc-number" required placeholder="Card number" :value="number" @input="onNumber" />
        </div>
        <div class="apd__row">
          <label class="sr-only" :for="fid('exp')">Expiration date, MM slash YY</label>
          <input :id="fid('exp')" class="apd__field apd__input" inputmode="numeric" autocomplete="cc-exp" required placeholder="MM/YY" :value="exp" @input="onExp" />
          <label class="sr-only" :for="fid('cvc')">Security code</label>
          <input :id="fid('cvc')" class="apd__field apd__input" inputmode="numeric" autocomplete="cc-csc" required maxlength="4" placeholder="CVC" v-model="cvc" />
        </div>
        <div class="apd__field apd__zip">
          <q-icon name="place" size="20px" aria-hidden="true" />
          <div class="apd__zipfields">
            <label :for="fid('zip')">Billing ZIP code</label>
            <input :id="fid('zip')" class="apd__input apd__input--zip" inputmode="numeric" autocomplete="billing postal-code" required maxlength="5" placeholder="ZIP" v-model="zip" />
          </div>
          <span class="apd__city">Everett, MA</span>
        </div>
        <label class="apd__robot">
          <input type="checkbox" v-model="human" />
          <span>I'm not a robot</span>
          <span class="apd__recaptcha"><q-icon name="autorenew" size="20px" color="primary" /><small>reCAPTCHA</small></span>
        </label>
      </div>

      <div class="apd__foot">
        <!-- 3.3.2/4.1.2: the Save used to drop out of the tab order with no
             explanation; it stays focusable and says what is missing. -->
        <q-btn unelevated no-caps class="apd__save" :class="{ 'is-disabled': !valid }" :aria-disabled="!valid" :aria-describedby="valid ? undefined : `${uid}-savehint`" label="Save" @click="save" />
        <p v-if="!valid" :id="`${uid}-savehint`" class="apd__savehint">Enter the card number, expiry, security code and ZIP, and confirm you're not a robot, to save this card.</p>
      </div>
    </div>
  </q-dialog>
</template>

<style scoped>
.apd { width: 560px; max-width: 92vw; background: var(--ds-color-surface); border-radius: var(--ds-radius-lg); overflow: hidden; display: flex; flex-direction: column; }
/* Phones: fills the maximized dialog. */
@media (max-width: 600px) { .apd { width: 100%; max-width: 100%; height: 100%; border-radius: 0; } }
.apd__head { display: flex; align-items: center; padding: 16px 18px; }
.apd__icon { width: 36px; height: 36px; border: 0; border-radius: 50%; background: none; color: var(--ds-color-text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.apd__icon:hover { background: var(--ds-palette-slate-100); }
.apd__title { flex: 1; text-align: center; font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--ds-color-text); }
.apd__spacer { width: 36px; }
.apd__body { padding: 4px 24px 24px; display: flex; flex-direction: column; gap: 16px; }
.apd__field { display: flex; align-items: center; gap: 12px; border: 1px solid var(--ds-color-border-bold); border-radius: var(--ds-radius-md); padding: 0 16px; height: 64px; }
.apd__cardicon { color: var(--ds-color-text); flex: none; }
.apd__input { flex: 1; min-width: 0; border: 0; outline: none; background: none; font-family: inherit; font-size: 1.0625rem; color: var(--ds-color-text); height: 100%; }
.apd__input::placeholder { color: var(--ds-color-text-subtlest); }
.apd__row { display: flex; gap: 16px; }
.apd__row .apd__field { flex: 1; }
.apd__zip { justify-content: space-between; }
.apd__zipfields { flex: 1; display: flex; flex-direction: column; }
.apd__zipfields label { font-size: 0.75rem; color: var(--ds-color-text-subtle); }
.apd__input--zip { height: auto; font-size: 1.0625rem; }
.apd__city { color: var(--ds-color-text-subtle); }
.apd__robot { display: flex; align-items: center; gap: 14px; border: 1px solid var(--ds-color-border); border-radius: var(--ds-radius-md); padding: 16px; background: var(--ds-color-surface-sunken); cursor: pointer; }
.apd__robot input { width: 24px; height: 24px; }
.apd__robot > span:nth-child(2) { flex: 1; font-size: 1rem; color: var(--ds-color-text); }
.apd__recaptcha { display: flex; flex-direction: column; align-items: center; color: var(--ds-color-text-subtle); }
.apd__foot { border-top: 1px solid var(--ds-color-border); padding: 16px 24px; }
.apd__save { width: 100%; height: 56px; border-radius: var(--ds-radius-pill); background: var(--ds-color-background-brand-bold); color: #fff; font-weight: 700; font-size: 1.0625rem; }
/* 1.4.3: the not-ready Save is focusable (aria-disabled), so its label has to
   meet contrast — Slate 500 on Slate 200 did not. */
.apd__save.is-disabled { background: var(--ds-palette-slate-200); color: var(--ds-color-text-subtle); }
.apd__savehint { margin: 10px 0 0; font-size: 0.8125rem; line-height: 1.45; color: var(--ds-color-text-subtle); text-align: center; }
</style>
