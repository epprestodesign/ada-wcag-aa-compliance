// ENG-2939 · ADA-PLAT-GRP-02 — Group Block step 1: organization and primary
// contact intake. Label association and error-state semantics.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { reactive, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2939.linear.md?raw'
import GroupTeamsBlock from '../../presto/components/checkout/GroupTeamsBlock.vue'

export default {
  title: 'Epic 3 – platform Group Block Flow/ADA-PLAT-GRP-02 – Organization and Primary Contact Intake',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2939'),
}

const ID = 'ENG-2939'

const ITEMS = {
  labels: { n: 1, title: 'Seven organization and contact fields have <label> without for', wcag: ['1.3.1', '3.3.2', '4.1.2'], element: 'Form fields · labels', where: 'platform/app/templates/enduser/group_blocks/contact.plush.html:25,30-31,37-38,54-55,58-59,65-76,79-80,87-96,109-110,113-114' },
  errors: { n: 2, title: 'Error state is a .has-error class only (no aria-invalid or aria-describedby)', wcag: ['1.3.1', '4.1.2', '3.3.2'], element: 'Form fields · error state', where: 'group_blocks/contact.plush.html (wrapper divs at :36, :78)' },
}

const FIELDS = [
  { id: 'grp02-org', label: 'Organization Name', auto: 'organization' },
  { id: 'grp02-block', label: 'Group Block Name', hint: 'Shown to guests when they book.' },
  { id: 'grp02-country', label: 'Country', auto: 'country-name', select: ['United States', 'Canada', 'Other'] },
  { id: 'grp02-address', label: 'Address', auto: 'street-address' },
  { id: 'grp02-city', label: 'City', auto: 'address-level2' },
  { id: 'grp02-postal', label: 'Postal Code', auto: 'postal-code' },
  { id: 'grp02-phone', label: 'Phone Number', auto: 'tel', type: 'tel' },
]

const inputStyle = 'height:40px;border:1px solid var(--ds-palette-slate-500);border-radius:6px;padding:0 10px;font:inherit;width:100%'
const errStyle = 'margin:0;color:var(--ds-palette-red-800);font-size:13px;font-weight:600'

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The first wizard step collects the organization and primary contact. Its labels aren't tied to their fields, and its errors are only red styling.">

  <ada-item v-bind="I.labels">
    <p>Organization Name, Group Block Name, Country, Address, City, Postal Code and Phone Number each have a <code>&lt;label&gt;</code> next to the control, but no <code>for</code>. The label isn't the field's accessible name, so a screen reader announces only "edit text". Clicking the label also doesn't focus the field.</p>
    <ada-code tone="bad" caption="Production pattern — contact.plush.html:30-31 (reconstructed from Linear)" code='<div class="form-group">
  <label>Organization Name</label>
  <input type="text" name="OrganizationName" class="form-control"
         value="<%= group.OrganizationName %>">
</div>' />
    <sr-output before="edit text, blank" after="Organization Name, edit text, required" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Every input needs a programmatic label; explicit for/id is preferred over implicit wrapping. Collect personal data with autocomplete tokens (WCAG 1.3.5).">
      <p>Agrees with the id/for fix. These are organization and contact fields, so adding <code>autocomplete</code> tokens (<code>organization</code>, <code>street-address</code>, <code>tel</code>…) in the same pass also meets 1.3.5 (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.errors">
    <p>When validation fails, the template adds <code>.has-error</code> to the wrapper <code>&lt;div&gt;</code> and shows red text. The input itself isn't marked invalid, and the message isn't linked to it, so a screen-reader user tabbing through the form hears nothing wrong.</p>
    <ada-code tone="bad" caption="Production pattern — contact.plush.html:36 and :78" code='<div class="form-group <%= if (errors.Get("OrganizationName")) { %>has-error<% } %>">
  <label>Organization Name</label>
  <input type="text" name="OrganizationName" class="form-control">
  <span class="help-block"><%= errors.Get("OrganizationName") %></span>
</div>' />
    <sr-output before="edit text, blank" after="Organization Name, edit text, invalid entry, required. Organization Name is required." />
    <agent-check agent="forms-specialist" verdict="refines" rule="aria-invalid=&quot;true&quot; goes on the field with the error, the message is linked with aria-describedby, and aria-invalid is removed once corrected. A red border alone is not sufficient.">
      <p>Agrees. Note that Linear cites the <em>wrapper</em> divs (:36, :78). <code>aria-invalid</code> and <code>aria-describedby</code> belong on the <code>&lt;input&gt;</code>/<code>&lt;select&gt;</code>, not on the div that carries <code>.has-error</code>. The message element needs a stable <code>id</code>.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, GroupTeamsBlock },
    setup: () => ({ ID, I: ITEMS, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="In presto-2026 the organization and primary-contact fields are part of GroupTeamsBlock, the Contact and group information step.">

  <ada-item v-bind="I.labels">
    <ada-before status="partial" source="presto-2026 Storybook › Group Block / Contact Info" :href="PRESTO.story('checkout-experience-components-group-block-contact-info--group-block')">
      <div style="max-width:640px"><group-teams-block :show-teams="false" /></div>
      <template #notes>
        <p><strong>Mostly handled:</strong> <code>GroupTeamsBlock.vue:115-188</code> wraps each input or select inside its <code>&lt;label&gt;</code>, so Group Block Name, Organization name, Country, Address, City, Postal Code and State all get a name (implicit association).</p>
        <p><strong>Still broken:</strong> Phone number (<code>:153-157</code>) is a <code>&lt;div&gt;</code> + <code>&lt;span&gt;</code>. The <code>&lt;input type="tel"&gt;</code> inside <code>PhoneField.vue:33</code> has only a placeholder. axe accepts that as a name, but the screen reader announces the sample number "(617) 470-7879" and the hint disappears on typing (forms-specialist: never use a placeholder as the only label). The country-code button is named only "+1". The redesign also uses no <code>id</code>/<code>for</code> or <code>autocomplete</code> anywhere.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.errors">
    <ada-before status="applies" source="presto-2026 Storybook › Teams Block › Validation Errors" :href="PRESTO.story('checkout-experience-components-group-block-contact-info-teams-block--validation-errors')">
      <div style="max-width:640px"><group-teams-block :show-teams="false" show-errors /></div>
      <template #notes>
        <p>Same defect: <code>cErr()</code> only toggles an <code>.is-error</code> border class (<code>GroupTeamsBlock.vue:127,160,170…</code>). No field gets <code>aria-invalid</code> or <code>aria-describedby</code>.</p>
        <p>Because the <code>&lt;small&gt;Required&lt;/small&gt;</code> sits <em>inside</em> the <code>&lt;label&gt;</code>, it's folded into the name ("Organization name * Required"), not exposed as an error. The Group Block Name hint is folded in the same way. Phone number's error isn't connected to anything.</p>
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
      const val = reactive(Object.fromEntries(FIELDS.map((f) => [f.id, f.select ? f.select[0] : ''])))
      const err = reactive({})
      const validate = () => {
        FIELDS.forEach((f) => { err[f.id] = val[f.id].trim() ? '' : `${f.label} is required.` })
        const first = FIELDS.find((f) => err[f.id])
        if (first) nextTick(() => document.getElementById(first.id)?.focus())
      }
      const clear = (f) => { if (err[f.id] && val[f.id].trim()) err[f.id] = '' }
      const describedBy = (f) => [f.hint && `${f.id}-hint`, err[f.id] && `${f.id}-error`].filter(Boolean).join(' ') || null
      return { ID, I: ITEMS, FIELDS, val, err, validate, clear, describedBy, inputStyle, errStyle }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Submit the empty form in item 2 to see the error state; focus moves to the first invalid field.">

  <ada-item v-bind="I.labels">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Matching id/for on every control" recommended lang="html"
        code='<div class="form-group">
  <label for="OrganizationName">Organization Name</label>
  <input type="text" id="OrganizationName" name="OrganizationName"
         class="form-control" required
         value="<%= group.OrganizationName %>">
</div>
<!-- same for GroupBlockName, Country, Address, City,
     PostalCode, PhoneNumber -->'>
        <div class="ada-stack ada-focus-demo" style="max-width:360px">
          <div class="ada-stack" style="gap:4px">
            <label for="grp02a-org" style="font-weight:600">Organization Name</label>
            <input id="grp02a-org" type="text" required :style="inputStyle" />
          </div>
          <div class="ada-stack" style="gap:4px">
            <label for="grp02a-country" style="font-weight:600">Country</label>
            <select id="grp02a-country" :style="inputStyle"><option>United States</option><option>Canada</option><option>Other</option></select>
          </div>
          <p class="ada-note">Click a label: focus moves into its field.</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Same pass: add autocomplete tokens (WCAG 1.3.5)" lang="html"
        code='<input id="OrganizationName" autocomplete="organization" …>
<select id="Country" autocomplete="country-name" …>
<input id="Address" autocomplete="street-address" …>
<input id="City" autocomplete="address-level2" …>
<input id="PostalCode" autocomplete="postal-code" …>
<input id="PhoneNumber" type="tel" autocomplete="tel" …>'>
        <template #why><p>The markup is already being edited field by field. Adding <code>autocomplete</code> lets browsers and password managers fill the organizer's details, which helps users with motor or memory impairments. It costs one attribute per field.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.errors">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-invalid + aria-describedby on the control when an error exists" recommended lang="html"
        code='<% let e = errors.Get("OrganizationName") %>
<div class="form-group <%= if (e) { %>has-error<% } %>">
  <label for="OrganizationName">Organization Name</label>
  <input id="OrganizationName" name="OrganizationName" required
    <%= if (e) { %>aria-invalid="true"
    aria-describedby="OrganizationName-error"<% } %>>
  <%= if (e) { %>
    <p id="OrganizationName-error" class="help-block"><%= e %></p>
  <% } %>
</div>'>
        <form class="ada-stack ada-focus-demo" style="max-width:420px" novalidate @submit.prevent="validate">
          <div v-for="f in FIELDS" :key="f.id" class="ada-stack" style="gap:4px">
            <label :for="f.id" style="font-weight:600">{{ f.label }} <span aria-hidden="true">*</span></label>
            <select v-if="f.select" :id="f.id" v-model="val[f.id]" required :autocomplete="f.auto" :style="inputStyle">
              <option v-for="o in f.select" :key="o">{{ o }}</option>
            </select>
            <input v-else :id="f.id" v-model="val[f.id]" :type="f.type || 'text'" required :autocomplete="f.auto || null"
              :aria-invalid="err[f.id] ? 'true' : null" :aria-describedby="describedBy(f)"
              :style="inputStyle + (err[f.id] ? ';border:2px solid var(--ds-palette-red-700)' : '')" @blur="clear(f)" />
            <p v-if="f.hint" :id="f.id + '-hint'" class="ada-note" style="font-size:13px">{{ f.hint }}</p>
            <p v-if="err[f.id]" :id="f.id + '-error'" :style="errStyle"><span aria-hidden="true">⚠ </span>{{ err[f.id] }}</p>
          </div>
          <q-btn type="submit" unelevated color="primary" no-caps label="Continue" style="justify-self:start" />
        </form>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="One field partial that merges hint and error ids" lang="html"
        code='<!-- partials/field.plush.html -->
<% let e = errors.Get(name) %>
<% let ids = [] %>
<%= if (hint) { ids = append(ids, name + "-hint") } %>
<%= if (e) { ids = append(ids, name + "-error") } %>
<div class="form-group <%= if (e) { %>has-error<% } %>">
  <label for="<%= name %>"><%= label %></label>
  <input id="<%= name %>" name="<%= name %>" autocomplete="<%= auto %>"
    <%= if (e) { %>aria-invalid="true"<% } %>
    <%= if (len(ids) > 0) { %>aria-describedby="<%= join(ids, " ") %>"<% } %>>
  <%= if (hint) { %><p id="<%= name %>-hint"><%= hint %></p><% } %>
  <%= if (e) { %><p id="<%= name %>-error" class="help-block"><%= e %></p><% } %>
</div>'>
        <template #why><p>contact.plush.html repeats the same block for about a dozen fields. With one partial, id/for, aria-invalid and aria-describedby are written once and can't drift. Space-separated ids keep a hint (like Group Block Name's) announced alongside the error. The helper names are illustrative: use whatever <code>append</code>/<code>join</code> helpers platform registers.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
