// ENG-2937 · ADA-PLAT-RES-07 — platform order confirmation & printable summary:
// h6 page message with no h1, span "heading", unhidden status icon, h4 data rows.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2937.linear.md?raw'
import ConfirmationPage from '../../presto/components/confirmation/ConfirmationPage.vue'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-07 – Order Confirmation View & Printable Summary',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2937'),
}

const ID = 'ENG-2937'
const FILE = 'platform/app/templates/enduser/orders/summary.plush.html'

const ITEMS = {
  h1: { n: 1, title: 'Confirmation message is an h6 and the page has no h1', wcag: ['1.3.1', '2.4.6'], element: 'Page heading · confirmation', where: `${FILE}:13` },
  summary: { n: 2, title: '"Reservation Summary" is a styled span, not a heading', wcag: ['1.3.1', '2.4.6'], element: 'Section heading', where: `${FILE}:60` },
  icon: { n: 3, title: 'Checkmark icon is not hidden from screen readers', wcag: ['1.1.1', '4.1.3'], element: 'Status icon', where: `${FILE} (status icon beside L13)` },
  coaches: { n: 4, title: '"Coach Names" and each coach row use h4 for plain data', wcag: ['1.3.1'], state: 'new', element: 'Headings · coach list', where: `${FILE}:173, 178-179` },
}

// Production snippets are reconstructed from the patterns and line numbers Linear
// cites (the platform repo isn't checked out here).
const C = {
  h1Bad: `<!-- summary.plush.html:13 — the page's primary message; no <h1> anywhere -->
<div class="alert alert-success d-flex align-items-center">
  <i class="fa fa-check-circle fa-2x me-3"></i>
  <h6 class="mb-0">Success! Your reservation is confirmed.</h6>
</div>`,
  summaryBad: `<!-- summary.plush.html:60 -->
<span class="font-20 font-weight-bold">Reservation Summary</span>`,
  iconBad: `<i class="fa fa-check-circle fa-2x"></i>
<!-- Font Awesome glyph via ::before — no aria-hidden, no text alternative -->`,
  coachesBad: `<!-- summary.plush.html:173-179 -->
<h4 class="font-16">Coach Names</h4>
<%= for (coach) in order.Coaches { %>
  <h4 class="font-14"><%= coach.FirstName %></h4>
  <h4 class="font-14"><%= coach.LastName %></h4>
<% } %>`,
  prestoBanner: `<!-- presto-2026 ConfirmationPage.vue:108-115 -->
<section class="conf__banner">
  <span class="conf__banner-check"><q-icon name="check_circle" /></span>   <!-- aria-hidden via QIcon -->
  <div class="conf__banner-text">
    <p class="conf__banner-title">{{ bannerTitle }}</p>                 <!-- not a heading -->
    <p class="conf__banner-sub">A confirmation email is on its way.</p>
  </div>
</section>
<!-- PageFrame.vue: no <h1> either -->`,
  prestoSummary: `<!-- presto-2026 ConfirmationPage.vue:118 -->
<h2 class="conf__sectionlabel">{{ summaryLabel }}</h2>
…
<h3 class="conf__hotelname">{{ h.name }}</h3>          <!-- :146 -->`,
  prestoIcon: `// Quasar QIcon render (2.19.3, QIcon.js:185-189)
const data = { class: classes.value, style: sizeStyle.value, 'aria-hidden': 'true' }`,
  prestoCoaches: `<!-- presto-2026 ConfirmationPage.vue:131-136 — group contact as definition list -->
<dl class="conf__metagrid">
  <div class="conf__metarow"><dt>Group Contact:</dt><dd>Coach Lee — (518) 796-3050</dd></div>
</dl>`,
  h1Fix: `<div class="alert alert-success d-flex align-items-center">
  <i class="fa fa-check-circle fa-2x me-3" aria-hidden="true"></i>
  <h1 class="h6 mb-0">Success! Your reservation is confirmed.</h1>
</div>`,
  h1Focus: `<title>Reservation confirmed – <%= order.ConfirmationNumber %> – <%= event.Name %></title>
…
<h1 id="page-title" tabindex="-1" class="h6 mb-0">Success! Your reservation is confirmed.</h1>

// only when the confirmation is swapped in without a full page load:
document.getElementById('page-title').focus()`,
  summaryFix: `<h2 class="font-20 font-weight-bold">Reservation Summary</h2>`,
  iconFix: `<i class="fa fa-check-circle fa-2x" aria-hidden="true"></i>
<!-- the adjacent <h1> text carries the meaning -->`,
  coachesFix: `<h3 class="font-16">Coach Names</h3>
<ul class="list-unstyled">
  <%= for (coach) in order.Coaches { %>
    <li class="font-14"><%= coach.FirstName %> <%= coach.LastName %></li>
  <% } %>
</ul>`,
  coachesDl: `<dl class="row">
  <dt class="col-sm-4">Coaches</dt>
  <dd class="col-sm-8">
    <%= for (coach) in order.Coaches { %><%= coach.FirstName %> <%= coach.LastName %><br><% } %>
  </dd>
</dl>`,
}

const reserveData = {
  contactName: 'Alex Smith',
  confirmationId: '72055771948934',
  reservedOn: 'Mon, 06/14/2027 02:14 PM EST',
  guest: 'Alex Smith — (555) 018-2245',
  email: 'youraccount@eventpipe.com',
  hotels: [{
    name: 'Days Inn by Wyndham Carson City', stars: 3, address: '4100 N Carson St, Carson City, NV, US, 89706', seed: 1,
    checkIn: 'Mon, 07/01/2027 03:00 PM', checkOut: 'Wed, 07/03/2027 11:00 AM',
    rooms: [{ type: 'Room, 1 Queen Bed, Non Smoking', note: '1 Queen Bed · Sleeps 2 · Breakfast included', nights: [
      { date: 'Mon, 07/01/2027', qty: 1, price: 128 }, { date: 'Tue, 07/02/2027', qty: 1, price: 128 },
    ] }],
  }],
}

const holdData = {
  contactName: 'Coach Lee',
  groupId: 'G-00584977',
  reservedOn: 'Thu, 06/11/2026 03:31 PM EST',
  releaseDate: 'Thu, 06/18/2026 11:59 PM PT',
  organizationName: 'Eagles SC',
  groupContact: 'Coach Lee — (518) 796-3050',
  email: 'youraccount@eventpipe.com',
  hotels: [{
    name: 'Embassy Suites Chicago Downtown', stars: 4, address: '511 N Columbus Dr, Chicago, IL, US, 60611', seed: 2,
    checkIn: 'Wed, 06/16/2027 03:00 PM', checkOut: 'Sat, 06/19/2027 11:00 AM',
    rooms: [{ type: 'Two-Room Suite King', note: '1 King Bed · Sleeps 4', nights: [
      { date: 'Wed, 06/16/2027', qty: 4, price: 269 }, { date: 'Thu, 06/17/2027', qty: 4, price: 269 },
    ] }],
  }],
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The order confirmation (also the printable summary) has no usable heading structure. Screen-reader users who navigate by heading can't find the confirmation message or the summary.">

  <ada-item v-bind="I.h1">
    <p>The page's main message, “Success! Your reservation is confirmed”, is an <code>&lt;h6&gt;</code> at line 13, and the document has no <code>&lt;h1&gt;</code>. Pressing <kbd>1</kbd> in a screen reader finds nothing, and the outline starts at the lowest level.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — summary.plush.html:13" :code="C.h1Bad" />
    <sr-output before="heading level 6, Success! Your reservation is confirmed." after="heading level 1, Success! Your reservation is confirmed." />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Exactly one H1 per page — it describes the purpose of the page; never choose a heading level for visual appearance.">
      <p>Confirmed. Keep the current look with a class (<code>class="h6"</code>) instead of the <code>&lt;h6&gt;</code> tag. The <code>&lt;title&gt;</code> should say the same thing (“Reservation confirmed – …”).</p>
    </agent-check>
    <agent-check agent="keyboard-navigator" verdict="refines" rule="After a route/content change, move focus to the H1 (tabindex=&quot;-1&quot;) so the new page is announced.">
      <p>Linear also cites 4.1.3. A full server redirect announces the new <code>&lt;title&gt;</code> anyway. If the confirmation is ever swapped in without a page load (e.g. Turbo), focus the <code>&lt;h1&gt;</code> so the success message is announced (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.summary">
    <p>“Reservation Summary” only looks like a heading. It's a <code>&lt;span class="font-20 font-weight-bold"&gt;</code>, so it's missing from the headings list and there's no landmark or heading to jump to.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — summary.plush.html:60" :code="C.summaryBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Text that visually acts as a section heading must be marked up as a heading at the correct level.">
      <p>Confirmed. With the <code>&lt;h1&gt;</code> from item 1, <code>&lt;h2&gt;</code> is the correct level here.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.icon">
    <p>The success checkmark is a Font Awesome <code>&lt;i&gt;</code> without <code>aria-hidden="true"</code>. Some screen readers announce the private-use glyph as an unpronounceable character, or as “image” with no name.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear)" :code="C.iconBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Icon with visible text: hide the icon (aria-hidden=&quot;true&quot;); the text conveys the message.">
      <p>Confirmed. The heading text already says “Success”, so the icon is decorative.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.coaches">
    <p>New finding: the “Coach Names” label and <em>each</em> coach's first and last name are <code>&lt;h4&gt;</code>s. The headings list fills with names that aren't headings, and each name is split in two.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — summary.plush.html:173-179" :code="C.coachesBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Headings must be descriptive section titles; data values are not headings.">
      <p>Confirmed. “Coach Names” can stay a heading (at <code>&lt;h3&gt;</code>, under the summary's <code>&lt;h2&gt;</code>), with the names as a list below it. A definition list is another option (Option B).</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ConfirmationPage },
    setup: () => ({ ID, I: ITEMS, C, PRESTO, reserveData, holdData }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026's ConfirmationPage already uses real section headings and a definition list. The page-level heading is the one gap left.">

  <ada-item v-bind="I.h1">
    <ada-before status="applies" source="presto-2026 Storybook › Confirmation › Single Reservation" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <div style="max-width:880px"><confirmation-page mode="reserve" :data="reserveData" /></div>
      <template #notes>
        <p><strong>Still present, in a different form.</strong> The success message is a <code>&lt;p class="conf__banner-title"&gt;</code>, not a heading, and neither <code>ConfirmationPage</code> nor <code>PageFrame</code> renders an <code>&lt;h1&gt;</code>. The page outline starts at the <code>&lt;h2&gt;</code> “Reservation Summary”. The prototype's confirmation screen also doesn't move focus or announce anything on arrival.</p>
        <ada-code tone="bad" caption="presto-2026 source" :code="C.prestoBanner" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.summary">
    <ada-before status="resolved" source="presto-2026 › ConfirmationPage.vue:118" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <ada-code tone="good" caption="presto-2026 source (frame in item 1)" :code="C.prestoSummary" />
      <template #notes><p>“Reservation Summary” (and its Group and Multiple variants) is a real <code>&lt;h2&gt;</code>, with hotel names as <code>&lt;h3&gt;</code> and policy titles as <code>&lt;h4&gt;</code>. It's correct once item 1 adds the <code>&lt;h1&gt;</code>.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.icon">
    <ada-before status="resolved" source="presto-2026 › Quasar QIcon (all confirmation icons)" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <ada-code tone="good" caption="Quasar source used by presto-2026" :code="C.prestoIcon" lang="js" />
      <template #notes><p>Every icon in the confirmation (banner check, Copy/Print action icons, stars) is a <code>q-icon</code>, which Quasar always renders with <code>aria-hidden="true"</code>. Each icon sits next to visible text, so hiding it is correct.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.coaches">
    <ada-before status="resolved" source="presto-2026 Storybook › Confirmation › Group Block" :href="PRESTO.story('confirmation-group-block--page')">
      <div style="max-width:880px"><confirmation-page mode="hold" :data="holdData" /></div>
      <template #notes>
        <p>presto-2026 shows the organizer as a <code>&lt;dl&gt;</code> row (“Group Contact: Coach Lee — …”), and room types are plain <code>&lt;div&gt;</code>s. No data is marked up as headings. It doesn't list individual coaches. If that list is added, use the Proposal pattern.</p>
        <ada-code tone="good" caption="presto-2026 source" :code="C.prestoCoaches" />
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
      const shown = ref(false)
      const title = ref(null)
      const trigger = ref(null)
      const show = async () => { shown.value = true; await nextTick(); title.value?.focus() }
      const reset = async () => { shown.value = false; await nextTick(); trigger.value?.focus() }
      const coaches = [['Jamie', 'Lee'], ['Morgan', 'Reyes'], ['Taylor', 'Nguyen']]
      return { ID, I: ITEMS, C, shown, title, trigger, show, reset, coaches }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is Linear's acceptance criterion. The demos keep production's visual sizes and fix only the semantics.">

  <ada-item v-bind="I.h1">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Promote line 13 to h1 (keep the h6 look with a class)" recommended :code="C.h1Fix">
        <div class="ada-mini-frame ada-row" style="align-items:center;background:#F0FDF4;border-color:#BBF7D0">
          <q-icon name="check_circle" size="32px" style="color:#15803D" />
          <h1 style="margin:0;font-size:16px;line-height:1.4;font-weight:700;color:#14532D">Success! Your reservation is confirmed.</h1>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="keyboard-navigator" title="Matching page title, and focus the h1 if the view is swapped in without a reload" :code="C.h1Focus">
        <div class="ada-mini-frame ada-focus-demo ada-stack">
          <div v-if="!shown"><button ref="trigger" type="button" class="q-btn q-btn--unelevated q-btn--rectangle bg-primary text-white q-btn--no-uppercase" style="padding:8px 20px" @click="show">Place Order (demo)</button></div>
          <div v-else class="ada-stack">
            <div class="ada-row" style="align-items:center">
              <q-icon name="check_circle" size="28px" style="color:#15803D" />
              <h2 ref="title" tabindex="-1" style="margin:0;font-size:16px;font-weight:700;color:#14532D">Success! Your reservation is confirmed.</h2>
            </div>
            <div><q-btn flat no-caps color="primary" label="Reset demo" @click="reset" /></div>
          </div>
        </div>
        <template #why><p>Press the button: focus lands on the success heading, so a screen reader reads it right away. (The demo uses an <code>h2</code> so this story page doesn't get a third <code>h1</code> after the kit title and Option A. In production it's the page's <code>h1</code>.)</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.summary">
    <ada-option letter="A" title="Convert line 60 to h2 (same classes)" recommended :code="C.summaryFix">
      <h2 style="margin:0;font-size:20px;font-weight:700">Reservation Summary</h2>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.icon">
    <ada-option letter="A" title="aria-hidden on status icons" recommended :code="C.iconFix">
      <p class="ada-row" style="align-items:center;margin:0;font-weight:700;color:#14532D">
        <q-icon name="check_circle" size="22px" style="color:#15803D" /> Reservation confirmed
      </p>
      <template #why><p>The screen reader hears only “Reservation confirmed”. (<code>q-icon</code> adds <code>aria-hidden="true"</code> automatically. In Plush, add it to each <code>&lt;i class="fa …"&gt;</code>.)</p></template>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.coaches">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Coach names as a list under one heading" recommended :code="C.coachesFix">
        <div class="ada-mini-frame">
          <h3 style="margin:0 0 6px;font-size:16px;font-weight:700">Coach Names</h3>
          <ul style="margin:0;padding:0;list-style:none;font-size:14px;line-height:1.7">
            <li v-for="c in coaches" :key="c[0]">{{ c[0] }} {{ c[1] }}</li>
          </ul>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Definition list, matching presto-2026's meta grid" :code="C.coachesDl">
        <dl class="ada-mini-frame" style="display:grid;grid-template-columns:auto 1fr;gap:4px 16px;margin:0;font-size:14px">
          <dt style="font-weight:700">Organization:</dt><dd style="margin:0">Eagles SC</dd>
          <dt style="font-weight:700">Coaches:</dt><dd style="margin:0"><span v-for="(c, i) in coaches" :key="c[0]">{{ c[0] }} {{ c[1] }}<br v-if="i < coaches.length - 1" /></span></dd>
        </dl>
        <template #why><p>The coaches sit with the other order details as label and value pairs. This matches the redesign's <code>&lt;dl class="conf__metagrid"&gt;</code> and adds no headings to the outline.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
