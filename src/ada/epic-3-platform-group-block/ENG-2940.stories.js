// ENG-2940 · ADA-PLAT-GRP-03 — Group Block step 2: group agreement and hotel
// policies. Both original claims were refuted; the real gap is that the
// agreement checkbox isn't described by the policy text.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2940.linear.md?raw'
import PoliciesAgreement from '../../presto/components/checkout/PoliciesAgreement.vue'
import StepReviewReservation from '../../presto/components/checkout/steps/StepReviewReservation.vue'

export default {
  title: 'Epic 3 – platform Group Block Flow/ADA-PLAT-GRP-03 – Group Agreement and Hotel Policies',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2940'),
}

const ID = 'ENG-2940'

const ITEMS = {
  label: { n: 1, title: 'Claim: the policy checkbox has no label', wcag: ['1.3.1', '4.1.2'], state: 'refuted', element: 'Checkbox · label', where: 'platform/app/templates/enduser/group_blocks/policies.plush.html:15-17' },
  describe: { n: '1b', title: 'The checkbox isn\'t linked to the policy text it agrees to', wcag: ['1.3.1', '4.1.2'], state: 'new', element: 'Checkbox · description', where: 'group_blocks/policies.plush.html:15-17 → hotel_policies.plush.html' },
  scroll: { n: 2, title: 'Claim: the terms box is a scroll region keyboard users can\'t scroll', wcag: ['1.3.1'], state: 'refuted', element: 'Terms container', where: 'hotel_policies.plush.html · _landing.scss:32-44' },
}

const hotelsOne = [{ name: 'Embassy Suites Chicago Downtown' }]
const hotelsMany = [{ name: 'Embassy Suites Chicago Downtown' }, { name: 'The Concord Hotel' }, { name: 'Hilton Orlando Lake Buena Vista' }]

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Linear re-checked both original claims and refuted them. What's left is one real gap: the agreement checkbox doesn't point at the policies it agrees to.">

  <ada-item v-bind="I.label">
    <p>The original draft said the checkbox was unlabeled. It isn't: the input and label are linked by <code>id</code>/<code>for</code>.</p>
    <ada-code tone="good" caption="Production pattern — policies.plush.html:15-17 (already correct)" code='<input type="checkbox" id="AcceptedPolicies" name="AcceptedPolicies">
<label for="AcceptedPolicies">
  I have read and agree to the Group Agreement and Hotel Policies
</label>' />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Every input needs a programmatic label; explicit for/id is the preferred technique.">
      <p>Confirmed refuted. The explicit <code>for</code>/<code>id</code> pair is the strongest labeling technique, so there's nothing to change here.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.describe">
    <p>The policy text is rendered separately, above the checkbox, by <code>hotel_policies.plush.html</code>. Nothing connects the two, so a screen-reader user who tabs to the checkbox hears "I have read and agree…" without being told what the policies say.</p>
    <sr-output before="I have read and agree to the Group Agreement and Hotel Policies, checkbox, not checked" after="I have read and agree to the Group Agreement and Hotel Policies, checkbox, not checked. [policy text]" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Use aria-describedby to link help or supporting text to an input.">
      <p>Agrees: <code>aria-describedby</code> is the right link between the checkbox and the terms.</p>
    </agent-check>
    <agent-check agent="cognitive-accessibility" verdict="refines" rule="Legal content: keep reading level at Grade 10 or lower, and add a plain-language summary at Grade 6-8.">
      <p>If <code>aria-describedby</code> points at the whole policy block, the screen reader reads every policy as one flat run of text each time the checkbox gets focus, and the headings are lost. Pointing it at a short plain-language summary (and keeping the full policies as a headed section just above) is easier to follow. See Option B.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.scroll">
    <p>The original draft said the terms sat in a fixed-height scroll box. There's no such container in the markup or in <code>_landing.scss:32-44</code>: the policies flow in the page, so there's nothing to make keyboard-scrollable.</p>
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Scrollable regions that aren't natively focusable (overflow: auto) need tabindex=&quot;0&quot;.">
      <p>Confirmed refuted. The rule applies only to overflow containers. Re-check it only if a fixed-height terms box is ever added.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, PoliciesAgreement, StepReviewReservation },
    setup: () => ({ ID, I: ITEMS, PRESTO, hotelsOne, hotelsMany }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has the same surface: PoliciesAgreement, the last step of the group checkout (Hold Group Block Now).">

  <ada-item v-bind="I.label">
    <ada-before status="resolved" source="presto-2026 Storybook › Group Block / Review Reservation / Policies › Single Hotel" :href="PRESTO.story('checkout-experience-components-group-block-review-reservation-policies--single-hotel')">
      <div style="max-width:640px"><policies-agreement flow="group" :hotels="hotelsOne" /></div>
      <template #notes><p>The checkbox is wrapped in its <code>&lt;label&gt;</code> (<code>PoliciesAgreement.vue:106-109</code>), so its name is the agreement sentence. This uses implicit association instead of <code>for</code>/<code>id</code>, but the checkbox is labeled.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.describe">
    <ada-before status="applies" source="presto-2026 Storybook › Group Block / Review Reservation / Policies › Multiple Hotels" :href="PRESTO.story('checkout-experience-components-group-block-review-reservation-policies--multiple-hotels')">
      <div style="max-width:640px"><policies-agreement flow="group" :hotels="hotelsMany" /></div>
      <template #notes>
        <p>Same gap. The policies render above in a card or accordion (<code>:67-103</code>) with no <code>id</code>, and the single group checkbox (<code>:107</code>) has no <code>aria-describedby</code>. Its label names "the Hotel and HoCo Book Reservation Policies" but doesn't say which hotels or what they contain.</p>
        <p>With several hotels, the policies after the first are collapsed (<code>v-show</code>), so it's even easier to check the box without meeting them.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.scroll">
    <ada-before status="resolved" source="presto-2026 Storybook › Group Block / Review Reservation › Group Hold" :href="PRESTO.story('checkout-experience-components-group-block-review-reservation--group-hold')">
      <div style="max-width:640px"><step-review-reservation flow="group" contact-summary="3 teams · Coach Lee" :hotels="hotelsOne" /></div>
      <template #notes><p>No scroll container here either. <code>.pol__card</code> (<code>PoliciesAgreement.vue:119</code>) has no fixed height, so the policy sections flow in the page. The multi-hotel accordion expands inline with a real <code>&lt;button aria-expanded&gt;</code>.</p></template>
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
    setup: () => ({ ID, I: ITEMS, agreedA: ref(false), agreedB: ref(false) }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Items 1 and 2 need no change. Item 1b is the one fix: tab to each demo checkbox to hear what it's describedby.">

  <ada-item v-bind="I.label">
    <ada-option letter="A" title="No change needed" recommended lang="html"
      code='<!-- policies.plush.html:15-17 — keep as is -->
<input type="checkbox" id="AcceptedPolicies" name="AcceptedPolicies">
<label for="AcceptedPolicies">…</label>'>
      <p class="ada-note">Linear confirmed the <code>id="AcceptedPolicies"</code> / <code>&lt;label for="AcceptedPolicies"&gt;</code> pair. Keep it.</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.describe">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-describedby from the checkbox to the policy content" recommended lang="html"
        code='<!-- hotel_policies.plush.html -->
<section id="hotel-policies" aria-labelledby="hotel-policies-title">
  <h2 id="hotel-policies-title">Hotel Policies</h2>
  <%= for (p) in policies { %>
    <h3><%= p.Title %></h3>
    <p><%= p.Body %></p>
  <% } %>
</section>

<!-- policies.plush.html:15-17 -->
<input type="checkbox" id="AcceptedPolicies" name="AcceptedPolicies"
       aria-describedby="hotel-policies">
<label for="AcceptedPolicies">I have read and agree to …</label>'>
        <div class="ada-stack ada-focus-demo">
          <section id="grp03a-policies" aria-labelledby="grp03a-title" class="ada-mini-frame">
            <h4 id="grp03a-title" style="margin:0 0 6px;font-size:16px">Hotel Policies</h4>
            <p style="margin:0 0 4px"><strong>Group cancellation.</strong> Held rooms can be released free of charge until the release date.</p>
            <p style="margin:0"><strong>Deposit.</strong> No deposit is charged to the organizer.</p>
          </section>
          <div class="ada-row" style="align-items:center;gap:8px">
            <input id="grp03a-agree" v-model="agreedA" type="checkbox" aria-describedby="grp03a-policies" style="width:20px;height:20px" />
            <label for="grp03a-agree">I have read and agree to the Group Agreement and Hotel Policies</label>
          </div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="cognitive-accessibility" title="Describe the checkbox with a plain-language summary, not the whole legal text" lang="html"
        code='<p id="policies-summary">
  You can release held rooms for free until
  <%= block.ReleaseDate %>. No deposit is charged to you.
  Full policies are listed above under "Hotel Policies".
</p>
<input type="checkbox" id="AcceptedPolicies" name="AcceptedPolicies"
       aria-describedby="policies-summary">
<label for="AcceptedPolicies">I have read and agree to …</label>'>
        <div class="ada-stack ada-focus-demo">
          <p id="grp03b-summary" class="ada-mini-frame" style="margin:0">You can release held rooms for free until Thu, 06/18/2026. No deposit is charged to you. Full policies are listed above under "Hotel Policies".</p>
          <div class="ada-row" style="align-items:center;gap:8px">
            <input id="grp03b-agree" v-model="agreedB" type="checkbox" aria-describedby="grp03b-summary" style="width:20px;height:20px" />
            <label for="grp03b-agree">I have read and agree to the Group Agreement and Hotel Policies</label>
          </div>
        </div>
        <template #why><p>A description is read as one flat string every time the checkbox is focused, so a long legal block is hard to follow. A short summary says what matters. The full, headed policies section stays just above for anyone who wants detail. This still meets Linear's criterion, because the checkbox is linked to the terms content.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.scroll">
    <ada-option letter="A" title="No change needed" recommended lang="css"
      code="/* _landing.scss:32-44 — policies flow normally; no fixed height.
   If a scroll box is ever added, give it:
   tabindex=&quot;0&quot; role=&quot;region&quot; aria-label=&quot;Hotel policies&quot; */">
      <p class="ada-note">Linear: there's no scrollable terms container to fix. Re-verify only if one is added later.</p>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
