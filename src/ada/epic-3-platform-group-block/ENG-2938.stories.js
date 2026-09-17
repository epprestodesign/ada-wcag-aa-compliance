// ENG-2938 · ADA-PLAT-GRP-01 — Group Block checkout wizard container and step
// navigation: step list semantics, role="alert" coverage, step titles.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2938.linear.md?raw'
import CheckoutPage from '../../presto/components/checkout/CheckoutPage.vue'
import GroupTeamsBlock from '../../presto/components/checkout/GroupTeamsBlock.vue'

export default {
  title: 'Epic 3 – platform Group Block Flow/ADA-PLAT-GRP-01 – Wizard Container and Step Navigation',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2938'),
}

const ID = 'ENG-2938'

const ITEMS = {
  steps: { n: 1, title: 'Wizard has no step list, nav landmark or aria-current', wcag: ['1.3.1', '4.1.2'], element: 'Wizard container · step indicator', where: 'platform/app/templates/enduser/group_blocks/index.plush.html · partials/section.plush.html:3-4' },
  alerts: { n: 2, title: 'role="alert" is missing on three step-level error blocks', wcag: ['4.1.2', '1.3.1'], state: 'corrected', element: 'Error message blocks', where: 'group_blocks/contact.plush.html:103,122 · group_blocks/policies.plush.html:8 (index.plush.html:20 already has it)' },
  titles: { n: 3, title: 'Step titles are <span> elements, not headings', wcag: ['1.3.1', '2.4.6'], state: 'corrected', element: 'Step titles', where: 'platform/app/templates/enduser/partials/section.plush.html:3-4' },
}

// Group hold cart, from presto-2026 stories/checkout/CheckoutPageGroup.stories.js.
const cart = {
  heldSeconds: 372,
  hotels: [
    { name: 'Embassy Suites Chicago Downtown', imageCategories: ['suites', 'rooms'], seed: 0, rooms: [
      { type: 'Two-Room Suite King', summary: '1 King Bed · Sleeps 4', nights: [{ date: 'Tue, Jun 23', qty: 4, roomsLeft: 6, price: 269 }, { date: 'Wed, Jun 24', qty: 1, roomsLeft: 5, price: 299 }] },
      { type: 'Two-Room Suite Double', summary: '2 Queen Beds · Sleeps 4', price: 289, nights: [{ date: 'Tue, Jun 23', qty: 1, roomsLeft: 5 }, { date: 'Wed, Jun 24', qty: 1, roomsLeft: 4 }] },
    ] },
    { name: 'The Concord Hotel', imageCategories: ['lobby', 'rooms'], seed: 2, rooms: [
      { type: 'King Studio', summary: '1 King Bed · Sleeps 2', price: 165, nights: [{ date: 'Tue, Jun 23', qty: 1, roomsLeft: 6 }] },
    ] },
  ],
}
const summary = { title: 'Group hold', subtitle: 'Embassy Suites + The Concord', rrow1: '8 rooms · 2 hotels' }

const STEPS = ['Organization and contact', 'Group agreement and policies', 'Confirmation']

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The group block wizard is a server-rendered, multi-page flow. Screen-reader users can't tell how many steps there are, which step they're on, or what went wrong when a step fails validation.">

  <ada-item v-bind="I.steps">
    <p>The wizard shows numbered step markers visually, but they're plain elements. There's no <code>&lt;nav&gt;</code>, no ordered list, and nothing marks the current step, so assistive tech can't report "step 2 of 3".</p>
    <ada-code tone="bad" caption="Production pattern — partials/section.plush.html:3-4 (reconstructed from Linear; class names illustrative)" code='<div class="section-header">
  <span class="section-number"><%= number %></span>
  <span class="section-title"><%= title %></span>
</div>' />
    <sr-output before="Organization and contact" after="Group block steps, navigation. List, 3 items. 1, Organization and contact, current step" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Multi-step forms: progress indicator inside nav aria-label, as an ordered list, with aria-current=&quot;step&quot; on the current step.">
      <p>Agrees. Linear's acceptance criterion only names the <code>&lt;ol class="wizard-steps"&gt;</code>; keep the <code>&lt;nav aria-label&gt;</code> wrapper from the problem statement too. Completed steps also need a text cue ("completed"), not just a check icon or color.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.alerts">
    <p>Coverage is mixed. The wizard's own top-level error in <code>index.plush.html:20</code> already has <code>role="alert"</code>. The three step-level error blocks in <code>contact.plush.html</code> and <code>policies.plush.html</code> don't.</p>
    <div class="ada-options ada-options--2">
      <ada-code tone="good" caption="Production — group_blocks/index.plush.html:20 (already correct)" code='<div class="alert alert-danger" role="alert">…</div>' />
      <ada-code tone="bad" caption="Production pattern — contact.plush.html:103,122 · policies.plush.html:8" code='<div class="alert alert-danger">
  <%= errors.Get("…") %>
</div>' />
    </div>
    <agent-check agent="live-region-controller" verdict="refines" rule="role=&quot;alert&quot; is for error conditions, but alerts already in the DOM when the page loads are NOT announced.">
      <p>Agrees role="alert" is the right role. But these errors come back in a server-rendered page after the POST, so the alert is in the DOM at load and many screen readers won't announce it. Pair it with a focus move to the error block (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.titles">
    <p>Each step's title is a <code>&lt;span&gt;</code>. It looks like a heading but isn't one, so heading navigation (<kbd>H</kbd>) skips it. An earlier draft said <code>&lt;div&gt;</code>; Linear corrected that.</p>
    <sr-output before="(not in the headings list)" after="Heading level 2, Step 1 of 3: Organization and contact" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Each wizard step has a heading indicating step number and name; focus or a live region announces step changes.">
      <p>Linear corrects the element type but has no acceptance criterion for item 3. Moving the titles into the step list (AC 1) labels the steps. The current step's title should also be a real heading (Option B).</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, CheckoutPage, GroupTeamsBlock },
    setup: () => ({ ID, I: ITEMS, cart, summary, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 redesigns the group block wizard as one page with a stepped accordion (Review order → Contact and group information → Review your reservation).">

  <ada-item v-bind="I.steps">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout Experience / Group Block" :href="PRESTO.story('checkout-experience-group-block--no-team-block')">
      <checkout-page mode="group" :cart="cart" :summary="summary" :show-teams="false" style="min-height:0" />
      <template #notes>
        <p><code>CheckoutPage.vue:166-188</code> renders each step as a <code>&lt;section&gt;</code> with a <code>&lt;header&gt;</code> of two <code>&lt;span&gt;</code>s (number and title). There's no <code>&lt;nav&gt;</code> or <code>&lt;ol&gt;</code>, and no <code>aria-current</code>.</p>
        <p>Step state is visual only: upcoming steps are <code>opacity: 0.5</code> (<code>:255</code>) and done steps swap the number for a check icon. The done header is also a clickable <code>&lt;header&gt;</code> (<code>:168</code>), though an Edit button is there for keyboard users. axe measures the faded upcoming titles at <strong>3.49:1</strong> (<code>#828690</code> on <code>#FAFAFA</code>).</p>
        <p class="ada-note">axe also flags the green per-night price in <code>CartReview</code> (<code>#16A34A</code> on white, 3.29:1). That's a real presto defect, but outside this ticket.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.alerts">
    <ada-before status="applies" source="presto-2026 Storybook › Group Block / Contact Info / Teams Block › Validation Errors" :href="PRESTO.story('checkout-experience-components-group-block-contact-info-teams-block--validation-errors')">
      <div style="max-width:640px"><group-teams-block :show-teams="false" show-errors /></div>
      <template #notes>
        <p>Pressing <strong>Next</strong> with empty fields sets <code>showErrors</code> (<code>StepContactInfo.vue:41</code>). Each error is a plain <code>&lt;small class="gtb__errmsg"&gt;</code> (<code>GroupTeamsBlock.vue:118,128,…</code>) with no <code>role="alert"</code> or live region, and focus stays on the button. Nothing is announced. The redesign has no step-level error summary at all.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.titles">
    <ada-before status="applies" source="presto-2026 Storybook › Checkout Experience / Group Block w/ Team Block" :href="PRESTO.story('checkout-experience-group-block--page')">
      <checkout-page mode="group" :cart="cart" :summary="summary" style="min-height:0" />
      <template #notes>
        <p>Same pattern: step titles are <code>&lt;span class="ck__steptitle"&gt;</code> (<code>CheckoutPage.vue:170</code>). The page has an <code>&lt;h1&gt;</code> "Confirm and pay", but the step bodies jump straight to <code>&lt;h4&gt;</code> ("Primary contact", "Policies"), so the outline skips two levels.</p>
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
      const cur = ref(0)
      const head = ref(null)
      const go = (d) => {
        cur.value = Math.min(STEPS.length - 1, Math.max(0, cur.value + d))
        nextTick(() => head.value?.focus())
      }
      const errText = ref('')
      const submitA = () => { errText.value = errText.value ? '' : 'Organization Name is required.' }
      const showSummary = ref(false)
      const summaryEl = ref(null)
      const submitB = () => { showSummary.value = true; nextTick(() => summaryEl.value?.focus()) }
      const stepStyle = (i) => ({
        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '6px',
        fontWeight: i === cur.value ? 700 : 400,
        background: i === cur.value ? 'var(--ds-palette-navy-50)' : 'transparent',
        border: i === cur.value ? '2px solid var(--ds-palette-navy-900)' : '1px solid var(--ds-color-border)',
      })
      return { ID, I: ITEMS, STEPS, cur, head, go, stepStyle, errText, submitA, showSummary, summaryEl, submitB }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. The demos are live: use Next and Back, then check what a screen reader hears.">

  <ada-item v-bind="I.steps">
    <ada-option letter="A" title="Accessible step list: nav + ol.wizard-steps + aria-current=&quot;step&quot;" recommended lang="html"
      code='<nav aria-label="Group block steps">
  <ol class="wizard-steps">
    <%= for (i, s) in steps { %>
      <li <%= if (i == current) { %>aria-current="step"<% } %>>
        <span class="wizard-steps__n"><%= i + 1 %></span>
        <%= s.Title %>
        <%= if (i < current) { %><span class="sr-only">(completed)</span><% } %>
      </li>
    <% } %>
  </ol>
</nav>'>
      <div class="ada-focus-demo ada-stack">
        <nav aria-label="Group block steps (demo)">
          <ol class="ada-row" style="list-style:none;margin:0;padding:0">
            <li v-for="(s, i) in STEPS" :key="s" :aria-current="i === cur ? 'step' : null" :style="stepStyle(i)">
              <span aria-hidden="true">{{ i < cur ? '✓' : i + 1 }}</span>
              <span>{{ s }}</span>
              <span v-if="i < cur" class="ada-sr-only">(completed)</span>
              <span v-if="i === cur" style="font-size:12px">(current)</span>
            </li>
          </ol>
        </nav>
        <h4 ref="head" tabindex="-1" style="margin:0;font-size:18px;line-height:1.3;font-weight:700">Step {{ cur + 1 }} of {{ STEPS.length }}: {{ STEPS[cur] }}</h4>
        <div class="ada-row">
          <q-btn outline color="primary" no-caps label="Back" :disable="cur === 0" @click="go(-1)" />
          <q-btn unelevated color="primary" no-caps label="Next" :disable="cur === STEPS.length - 1" @click="go(1)" />
        </div>
        <p class="ada-note">The current step is bold, outlined and labelled "(current)", so it isn't signalled by color alone.</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.alerts">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add role=&quot;alert&quot; to the three step-level error blocks only" recommended lang="html"
        code='<!-- contact.plush.html:103 and :122, policies.plush.html:8 -->
<div class="alert alert-danger" role="alert">
  <%= errors.Get("…") %>
</div>
<!-- index.plush.html:20 already has role="alert": leave it -->'>
        <div class="ada-stack ada-focus-demo">
          <div role="alert" style="min-height:24px;color:var(--ds-palette-red-800);font-weight:700">{{ errText }}</div>
          <q-btn unelevated color="primary" no-caps :label="errText ? 'Clear the error' : 'Continue with a missing field'" style="justify-self:start" @click="submitA" />
          <p class="ada-note">This demo injects text into a region that already exists, which is when role="alert" is announced reliably.</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="Server-rendered errors: also move focus to the alert on load" lang="html"
        code='<div id="step-errors" class="alert alert-danger" role="alert" tabindex="-1">
  <h2>There is 1 error on this step</h2>
  <ul><li><a href="#OrganizationName">Organization Name is required</a></li></ul>
</div>
<script>document.getElementById("step-errors")?.focus()</script>'>
        <div class="ada-stack ada-focus-demo">
          <div v-if="showSummary" ref="summaryEl" role="alert" tabindex="-1" style="border:2px solid var(--ds-palette-red-700);border-radius:6px;padding:10px 12px;background:var(--ds-palette-red-50);color:var(--ds-palette-red-800)">
            <p style="margin:0 0 4px;font-weight:700">There is 1 error on this step</p>
            <a href="#grp01-org" @click.prevent style="color:inherit">Organization Name is required</a>
          </div>
          <q-btn unelevated color="primary" no-caps label="Simulate the page reload with errors" style="justify-self:start" @click="submitB" />
        </div>
        <template #why><p>platform posts each step and re-renders the page, so the alert is in the DOM at load and may not be announced. Moving focus to it makes the screen reader read it, and the links take the user to each field.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.titles">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Step titles move into the ol.wizard-steps list (AC 1)" recommended lang="html"
        code='<ol class="wizard-steps">
  <li aria-current="step">
    <span class="wizard-steps__n">1</span> Organization and contact
  </li>
  …
</ol>'>
        <p class="ada-note">The same list as item 1: each title is now read as "1, Organization and contact, current step" inside a named navigation list.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Render the current step title as an h2 in section.plush.html" lang="html"
        code='<!-- partials/section.plush.html:3-4 -->
<h2 class="section-title">
  <span class="section-number">Step <%= number %> of <%= total %>:</span>
  <%= title %>
</h2>'>
        <div class="ada-mini-frame">
          <p style="margin:0 0 4px;font-size:12px;color:var(--ds-color-text-subtle)">Page h1: Hold a Group Block</p>
          <h4 style="margin:0;font-size:18px"><span style="color:var(--ds-color-text-subtle)">Step 1 of 3:</span> Organization and contact</h4>
        </div>
        <template #why><p>Keeps the visual style (use CSS) but puts the step in the heading outline, so <kbd>H</kbd> lands on it right after page load. In production, use <code>&lt;h2&gt;</code> under the page <code>&lt;h1&gt;</code>. The demo uses a lower level to fit this page's outline.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
