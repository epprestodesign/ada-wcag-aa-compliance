// ENG-2950 · ADA-BLITZ-RES-01 — Guest reservation lookup portal + "forgot
// confirmation number" mode: labels, fake link, page title, error + loading
// announcements, logo alt.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2950.linear.md?raw'
import ManageBooking from '../../presto/components/managebooking/ManageBooking.vue'
import epLogo from '../../presto/assets/eventpipe logos/eventpipe-logo.svg'

export default {
  title: 'Epic 6 – blitz Live Inventory/ADA-BLITZ-RES-01 – Reservation Lookup & Forgot Confirmation Number',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2950'),
}

const ID = 'ENG-2950'
const VIEW = 'blitz/src/modules/reservation/views/BookingsLookupView.vue'

const ITEMS = {
  labels: { n: 1, title: 'Lookup inputs have orphaned labels', wcag: ['1.3.1', '3.3.2', '4.1.2'], element: 'Form fields · q-input', where: `${VIEW}:154, :167 (labels) · :156, :169 (inputs)` },
  forgot: { n: 2, title: '"Forgot" link is a clickable span', wcag: ['2.1.1', '4.1.2'], element: 'Fake link · span @click', where: `${VIEW}:216` },
  title: { n: 3, title: 'Page title is a styled div', wcag: ['1.3.1', '2.4.6'], element: 'Page heading', where: `${VIEW}:142` },
  failure: { n: 4, title: 'Lookup failure message is not announced', wcag: ['3.3.1', '4.1.3'], element: 'Error message', where: `${VIEW}:179` },
  loading: { n: 5, title: 'Loading overlay has no status text', wcag: ['4.1.3'], element: 'Loading state · $q.loading', where: `${VIEW}:55, :102, :120` },
  logo: { n: 6, title: 'Logo alt says "Housing Company logo"', wcag: ['1.1.1'], state: 'new', element: 'Image · logo alt', where: `${VIEW}:140 (same bug as PrestoFooter.vue:11)` },
}

const CODE = {
  labelsBad: `<!-- ${VIEW}:154-156 (same at 167-169) -->
<q-item-label>…</q-item-label>   <!-- renders a <div>, tied to nothing -->
<q-input v-model="…" outlined />`,
  forgotBad: `<!-- ${VIEW}:216 -->
<span class="cursor-pointer forgot-link" @click="enableForgotMode">…</span>`,
  titleBad: `<!-- ${VIEW}:142 -->
<div class="... text-h6 ...">…</div>`,
  failureBad: `<!-- ${VIEW}:179 — rendered on a failed lookup -->
<div class="failure-container">…</div>   <!-- no role, no aria-live -->`,
  loadingBad: `// ${VIEW}:55, :102, :120
$q.loading.show()   // spinner only: no message, nothing announced`,
  logoBad: `<!-- ${VIEW}:140 -->
<img :src="logo" alt="Housing Company logo" />`,
  labelsA: `<q-input v-model="confirmation" outlined label="Confirmation number" />
<q-input v-model="email" outlined type="email" label="Email address" />`,
  labelsB: `<!-- Keeps today's "label above the field" layout -->
<label for="lookup-confirmation" class="lookup-label">Confirmation number</label>
<q-input for="lookup-confirmation" v-model="confirmation" outlined />
<!-- QInput's "for" prop becomes the native input's id -->`,
  forgotA: `<q-btn flat no-caps color="primary" class="forgot-link"
       label="Forgot your confirmation number?"
       @click="enableForgotMode" />`,
  titleA: `<h1 class="text-h6 q-my-none">Find your reservation</h1>`,
  failureA: `<!-- Keep the container mounted; swap only its text -->
<div role="alert" class="failure-container">
  <template v-if="lookupFailed">
    We couldn't find that reservation. Check the confirmation number and try again.
  </template>
</div>`,
  loadingA: `$q.loading.show({ message: 'Looking up your reservation…' })
status.value = 'Looking up your reservation…'   // → <div role="status">
// …after the request
$q.loading.hide()
status.value = ''`,
  logoA: `<img :src="company.logo" :alt="company.name" />
<!-- or alt="" when the company name is already shown as text beside it -->`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The guest-facing lookup screen in blitz, where guests find a reservation or switch to &quot;forgot confirmation number&quot; mode. Six defects stop keyboard and screen-reader users from completing it.">

  <ada-item v-bind="I.labels">
    <p>Each field has a visible caption in a <code>&lt;q-item-label&gt;</code> above it, but nothing links the caption to the input. Screen readers announce the fields as "edit text" with no name.</p>
    <ada-code tone="bad" caption="Production pattern" lang="vue" :code="CODE.labelsBad" />
    <sr-output before="edit text" after="Confirmation number, edit text" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Every input needs a programmatic label; a visible &lt;label&gt; is preferred over aria-label.">
      <p>Agrees. Note that <code>&lt;q-item-label&gt;</code> renders a <code>&lt;div&gt;</code>, and <code>for</code>/<code>id</code> only works on a real <code>&lt;label&gt;</code>. For the <code>for</code>/<code>id</code> route, replace it with <code>&lt;label for&gt;</code> and use QInput's <code>for</code> prop (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.forgot">
    <p>The "forgot" control is a <code>&lt;span&gt;</code> with a click handler. It can't be reached with Tab, doesn't respond to Enter or Space, and has no role.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.forgotBad" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Anything clickable must be focusable and keyboard-operable; use native elements.">
      <p>Confirmed.</p>
    </agent-check>
    <agent-check agent="aria-specialist" verdict="agrees" rule="Use a button for in-page actions and a link for navigation.">
      <p><code>enableForgotMode</code> switches the form in place without navigating, so Linear is right to ask for a button rather than a link.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.title">
    <p>The page title is a <code>&lt;div class="text-h6"&gt;</code>. It looks like a heading, but screen-reader users can't find it by heading navigation, and the page has no <code>&lt;h1&gt;</code>.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.titleBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Each page has exactly one h1 that describes its purpose.">
      <p>Confirmed. Keep the <code>text-h6</code> class for the look, and change only the element.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.failure">
    <p>When a lookup fails, the error appears on screen but isn't announced. A screen-reader user who presses Find hears nothing.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.failureBad" />
    <agent-check agent="live-region-controller" verdict="refines" rule="role=&quot;alert&quot; is already assertive; the live region must be in the DOM before its text changes.">
      <p>Agrees. Two details: <code>role="alert"</code> plus <code>aria-live="polite"</code> gives conflicting signals, so use one of them (alert fits a failed submit). And if the container is added with <code>v-if</code>, some screen readers miss it, so keep the container mounted and change only its text.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Errors should be tied to the fields they describe.">
      <p>If the failure is about a specific field, also set <code>aria-invalid</code> and <code>aria-describedby</code> on that input.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.loading">
    <p><code>$q.loading.show()</code> covers the page with a spinner and no text. Screen-reader users don't know a lookup is running.</p>
    <ada-code tone="bad" caption="Production" lang="js" :code="CODE.loadingBad" />
    <agent-check agent="live-region-controller" verdict="refines" rule="Announce loading for operations over about 2 seconds, through a polite region that already exists.">
      <p>Agrees. In Quasar 2.19.3 (presto-2026's version) and in current 2.x, <code>Loading.js</code> gives the overlay no role or <code>aria-live</code>, even when you pass a <code>message</code>. The message helps sighted users, but the announcement needs its own <code>role="status"</code> region.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.logo">
    <p>The logo's alt text is a generic placeholder. It doesn't name the real housing company, so screen-reader users get the wrong brand.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.logoBad" />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Logo alt text names the organization; don't add the word &quot;logo&quot;.">
      <p>Use the company's name, for example <code>alt="EventPipe"</code>, not "EventPipe logo". If the name is already shown as text next to the image, use <code>alt=""</code>.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ManageBooking },
    setup() {
      const $q = useQuasar()
      const showBackdrop = () => {
        $q.loading.show({ message: 'Processing payment…' })
        setTimeout(() => $q.loading.hide(), 1800)
      }
      return { ID, I: ITEMS, PRESTO, showBackdrop }
    },
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no reservation lookup screen. Its Manage Booking account page is the closest match, so the items below compare against that and the shared shell.">

  <ada-item v-bind="I.labels">
    <ada-before status="resolved" source="presto-2026 Storybook › Manage Booking / Account › Profile" :href="PRESTO.story('manage-booking-account--profile')">
      <ada-code tone="good" caption="presto-2026 — ProfileEditModal.vue:58-60" lang="vue" code='<label class="pe__field"><span>First name <i>*</i></span><input v-model="form.firstName" placeholder="First name" /></label>
<label class="pe__field"><span>Middle name</span><input v-model="form.middleName" placeholder="Middle name" /></label>
<label class="pe__field"><span>Last name <i>*</i></span><input v-model="form.lastName" placeholder="Last name" /></label>' />
      <template #notes>
        <p>presto-2026 has no lookup form. Its closest forms (the profile editor under Manage Booking) wrap each input in a <code>&lt;label&gt;</code>, so every field has a name. Use that pattern when the lookup is redesigned.</p>
        <p>Side note: the required <code>*</code> isn't hidden from screen readers, and the inputs have no <code>required</code> attribute.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.forgot">
    <ada-before status="resolved" source="presto-2026 › ManageBooking.vue:127, :137">
      <ada-code tone="good" caption="presto-2026 — link-styled actions are real buttons" lang="vue" code='<button class="mb__signout" @click="emit(&apos;sign-out&apos;)">Sign out</button>
<button class="mb__row-action" @click="openEdit(&apos;basic&apos;)">Edit</button>' />
      <template #notes><p>Manage Booking styles its in-page actions like links but builds them as <code>&lt;button&gt;</code>s, so they're focusable and work with the keyboard. (The Global Nav "Contact Us" is the exception: it's an <code>&lt;a href="#"&gt;</code> used as a menu toggle. See ENG-2922.)</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.title">
    <ada-before status="partial" source="presto-2026 Storybook › Manage Booking / Account › Profile" :href="PRESTO.story('manage-booking-account--profile')">
      <manage-booking default-section="profile" />
      <template #notes>
        <p>The content title ("Justin Girard") is a real <code>&lt;h2&gt;</code> with <code>&lt;h3&gt;</code> sub-sections (<code>ManageBooking.vue:132-161</code>). But the page has no <code>&lt;h1&gt;</code>: the greeting name is a <code>&lt;strong&gt;</code>, and nothing names the page "Manage Booking".</p>
        <p>Axe also flags the grey "Not provided" values in this frame. They use <code>--ds-color-text-subtlest</code> (Slate 400, 2.56:1), which is a presto-2026 contrast defect of the same kind as ENG-2949 item 4.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.failure">
    <ada-before status="no-equivalent">
      <template #empty>presto-2026 has no lookup, and no failed-lookup message. The Proposal story shows the announced error pattern to use.</template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.loading">
    <ada-before status="partial" source="presto-2026 Storybook › Backdrop / Global Loading" :href="PRESTO.story('components-actions-backdrop--global-loading')">
      <q-btn color="primary" no-caps label="Show full-screen backdrop" @click="showBackdrop" />
      <template #notes><p>presto-2026's backdrop passes a visible <code>message</code>, which is better than blitz. But Quasar's Loading plugin still renders it with no <code>role="status"</code>, so screen readers don't announce it.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.logo">
    <ada-before status="resolved" source="presto-2026 Storybook › App Shell / Page Frame" :href="PRESTO.story('app-shell-page-frame--book-reservation')">
      <ada-code tone="good" caption="presto-2026 — PageFrame.vue:28" lang="vue" code='<img :src="epLogo" alt="EventPipe" class="pf__logo" />' />
      <template #notes><p>The shared footer names the company, and doesn't add "logo".</p></template>
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
      const confirmation = ref('')
      const email = ref('')
      const confirmationB = ref('')
      const forgotMode = ref(false)
      const failed = ref(false)
      const status = ref('')
      const busy = ref(false)
      const runLookup = () => {
        busy.value = true
        status.value = 'Looking up your reservation…'
        setTimeout(() => { busy.value = false; status.value = 'Reservation found.' }, 1500)
      }
      return { ID, I: ITEMS, CODE, epLogo, confirmation, email, confirmationB, forgotMode, failed, status, busy, runLookup }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Field names in the demos are examples. Press Tab through the demos to check them.">

  <ada-item v-bind="I.labels">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Give each q-input a :label" recommended lang="vue" :code="CODE.labelsA">
        <div class="ada-stack ada-focus-demo" style="max-width:360px">
          <q-input v-model="confirmation" outlined dense label="Confirmation number" />
          <q-input v-model="email" outlined dense type="email" label="Email address" />
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Real label element linked with for and id" lang="vue" :code="CODE.labelsB">
        <div class="ada-stack ada-focus-demo" style="max-width:360px;gap:4px">
          <label for="ada-2950-conf" style="font-weight:700;font-size:14px">Confirmation number</label>
          <q-input for="ada-2950-conf" v-model="confirmationB" outlined dense />
        </div>
        <template #why><p>This keeps the caption above the field, as blitz has it today, and clicking the caption focuses the input. <code>&lt;q-item-label&gt;</code> can't do this because it isn't a <code>&lt;label&gt;</code>.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.forgot">
    <ada-option letter="A" title="Replace the span with a real button" recommended lang="vue" :code="CODE.forgotA">
      <div class="ada-stack ada-focus-demo">
        <div><q-btn flat no-caps color="primary" :label="forgotMode ? 'I have my confirmation number' : 'Forgot your confirmation number?'" @click="forgotMode = !forgotMode" /></div>
        <p class="ada-note">Mode: {{ forgotMode ? 'Find by email and dates' : 'Find by confirmation number' }}</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.title">
    <ada-option letter="A" title="Make the page title an h1" recommended lang="vue" :code="CODE.titleA">
      <div class="ada-mini-frame">
        <h1 class="text-h6" style="margin:0">Find your reservation</h1>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.failure">
    <ada-option letter="A" title="role=&quot;alert&quot; on a failure container that stays mounted" recommended lang="vue" :code="CODE.failureA">
      <div class="ada-stack ada-focus-demo" style="max-width:420px">
        <div class="ada-row">
          <q-btn unelevated color="primary" no-caps label="Find reservation (fails)" @click="failed = true" />
          <q-btn outline color="primary" no-caps label="Reset" @click="failed = false" />
        </div>
        <div role="alert" :style="failed ? 'background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;border-radius:4px;padding:10px 12px' : ''">
          <template v-if="failed">We couldn't find that reservation. Check the confirmation number and try again.</template>
        </div>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.loading">
    <ada-option letter="A" title="Loading message plus a role=&quot;status&quot; announcement" recommended lang="js" :code="CODE.loadingA">
      <div class="ada-stack ada-focus-demo" style="max-width:420px">
        <div class="ada-row" style="align-items:center">
          <q-btn unelevated color="primary" no-caps label="Find reservation" :loading="busy" @click="runLookup" />
          <q-spinner v-if="busy" size="20px" color="primary" aria-hidden="true" />
        </div>
        <div role="status" class="ada-note">{{ status }}</div>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.logo">
    <ada-option letter="A" title="Use the company's real name as alt text" recommended lang="vue" :code="CODE.logoA">
      <div class="ada-mini-frame"><img :src="epLogo" alt="EventPipe" style="height:28px;display:block" /></div>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
