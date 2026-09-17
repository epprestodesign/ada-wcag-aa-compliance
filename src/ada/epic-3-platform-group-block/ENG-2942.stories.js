// ENG-2942 · ADA-PLAT-GRP-05 — Group management organizer dashboard: heading
// outline, deadline badge contrast, roster semantics.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2942.linear.md?raw'

export default {
  title: 'Epic 3 – platform Group Block Flow/ADA-PLAT-GRP-05 – Organizer Dashboard',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2942'),
}

const ID = 'ENG-2942'

const ITEMS = {
  heading: { n: 1, title: 'Group Block list starts at <h3> with no <h1> or <h2>', wcag: ['1.3.1', '2.4.6'], element: 'Page heading outline', where: 'platform/app/templates/enduser/group_management/index.plush.html:5' },
  badge: { n: 2, title: 'Deadline badges (#F86969) fail contrast at 2.91:1', wcag: ['1.4.3'], element: 'Color · deadline badge', where: 'group_management/index.plush.html:46,81 · show.plush.html:46' },
  roster: { n: 3, title: 'Roster is <div class="card"> rows with no table or list semantics', wcag: ['1.3.1'], state: 'corrected', element: 'Reservation roster', where: 'platform/app/templates/enduser/group_management/reservations.plush.html' },
}

// Fictional roster rows for the demos.
const ROSTER = [
  { guest: 'Jordan Ellis', team: 'Eagles SC U12 Boys', hotel: 'Embassy Suites Chicago Downtown', dates: 'Jun 16 – 19', rooms: 1, status: 'Confirmed' },
  { guest: 'Priya Nair', team: 'Eagles SC U14 Girls', hotel: 'Embassy Suites Chicago Downtown', dates: 'Jun 16 – 18', rooms: 2, status: 'Confirmed' },
  { guest: 'Marcus Webb', team: 'Eagles SC U12 Boys', hotel: 'The Concord Hotel', dates: 'Jun 17 – 19', rooms: 1, status: 'Cancelled' },
]

const OLD = '#F86969'
const NEW = '#B04545'
const TOKEN = '#B91C1C'

const cardStyle = 'border:1px solid var(--ds-color-border);border-radius:8px;padding:10px 12px;background:#fff'
const cell = 'padding:6px 10px;border-bottom:1px solid var(--ds-color-border);text-align:left;vertical-align:top'

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, OLD, NEW, TOKEN }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Where organizers track their held blocks and the guests booked into them. The page has no top heading, its deadline warnings are too faint, and the roster has no structure for a screen reader.">

  <ada-item v-bind="I.heading">
    <p>The first heading on the page is an <code>&lt;h3&gt;</code>. With no <code>&lt;h1&gt;</code> or <code>&lt;h2&gt;</code> above it, screen-reader users can't find the page title or tell how the page is organized.</p>
    <ada-code tone="bad" caption="Production pattern — group_management/index.plush.html:5 (reconstructed from Linear)" code='<div class="container">
  <h3>Group Blocks</h3>
  <%= for (b) in blocks { %> … <% } %>
</div>' />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Exactly one H1 per page; never skip heading levels.">
      <p>Agrees on the <code>&lt;h1&gt;</code>. But adding an <code>&lt;h1&gt;</code> above the existing <code>&lt;h3&gt;</code> still skips a level (h1 → h3). Promote that heading, and any per-block headings under it, one level each (h2, then h3).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.badge">
    <div class="ada-contrast-grid">
      <contrast-pair :fg="OLD" bg="#FFFFFF" label="Deadline text on white (production)" />
      <contrast-pair fg="#FFFFFF" :bg="OLD" label="White on deadline fill (if used as a solid badge)" pill />
    </div>
    <p>Linear's recomputed <strong>2.91:1</strong> matches our check (the original 2.92:1 estimate is within rounding). The ratio is the same whichever way round the colors go, so it fails as text color and as a solid badge with white text.</p>
    <agent-check agent="contrast-master" verdict="refines" rule="Normal text needs 4.5:1 against its background; never convey information through color alone.">
      <p>Agrees it fails. Linear asks for "≥4.5:1" but doesn't name a color. <code>#B04545</code> keeps the same red hue at <strong>5.55:1</strong> on white (5.07:1 on a <code>#FEF2F2</code> tint). Also keep the words "Deadline" or "Due" in the badge so urgency isn't shown by red alone.</p>
    </agent-check>
    <agent-check agent="design-system-auditor" verdict="refines" rule="Validate every token pair a color is used in (text on each background it sits on), not just against white.">
      <p>If platform maps to the Presto palette, note that <code>--ds-color-text-danger</code> (red-600, <code>#DC2626</code>) passes on white at 4.83:1 but <strong>fails</strong> on a red-50 badge fill at 4.41:1. <code>--ds-palette-red-700</code> (<code>#B91C1C</code>) passes on both (6.47:1 / 5.91:1). See Option B.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.roster">
    <p>An earlier draft said the roster table was missing <code>&lt;th scope&gt;</code>. Linear corrected that: there is no table at all. Each reservation is a <code>&lt;div class="card"&gt;</code>, so a screen reader reads one long run of text with no row count, no column names and no way to move between reservations.</p>
    <ada-code tone="bad" caption="Production pattern — group_management/reservations.plush.html" code='<%= for (r) in reservations { %>
  <div class="card">
    <div class="card-body">
      <div><%= r.GuestName %></div>
      <div><%= r.HotelName %></div>
      <div><%= r.CheckIn %> – <%= r.CheckOut %></div>
      <div><%= r.Status %></div>
    </div>
  </div>
<% } %>' />
    <sr-output before="Jordan Ellis Embassy Suites Chicago Downtown Jun 16 – 19 Confirmed Priya Nair …" after="Group block reservations, table, 3 rows, 6 columns. Row 1, Guest, Jordan Ellis. Hotel, Embassy Suites…" />
    <agent-check agent="tables-data-specialist" verdict="refines" rule="Tabular data (the same fields repeated per record) belongs in a &lt;table&gt; with &lt;caption&gt; and th scope; stacked cards are a responsive presentation of a table, not a replacement.">
      <p>Agrees with both of Linear's options, but prefers the table. Every card repeats the same fields (guest, team, hotel, dates, rooms, status), and organizers compare across rows. Use the list only if each card is really a self-contained summary.</p>
    </agent-check>
    <agent-check agent="aria-specialist" verdict="refines" rule="First rule of ARIA: use native HTML before ARIA. Prefer names from visible text over aria-label.">
      <p>If the card layout stays, use a native <code>&lt;ul&gt;</code>/<code>&lt;li&gt;</code> instead of <code>role="list"</code> on divs. Name each card with a visible heading (the guest's name) instead of <code>aria-label</code>, which many screen readers don't announce on list items (Option C).</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no organizer dashboard yet. Manage Booking is a guest account page (profile, communications, payments, security, help), with no group blocks, deadlines or roster.">

  <ada-item v-bind="I.heading">
    <ada-before status="no-equivalent" source="presto-2026 Storybook › Manage Booking / Account" :href="PRESTO.story('manage-booking-account--default')">
      <template #notes>
        <p>Checked <code>managebooking/ManageBooking.vue</code>: its sections are Profile, Communications, Payment methods, Security and settings, and Help (<code>:35-41</code>). There's no group block list.</p>
        <p>Worth noting for when the dashboard is built: Manage Booking itself has no <code>&lt;h1&gt;</code> either. Its top heading is the <code>&lt;h2 class="mb__h2"&gt;</code> section title (<code>:132</code>).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.badge">
    <ada-before status="no-equivalent" source="presto-2026 Storybook › Confirmation / Group Block" :href="PRESTO.story('confirmation-group-block--page')">
      <template #notes>
        <p>No deadline badge exists in presto-2026. The nearest element is the "Group Block Release Date" on the confirmation page (<code>ConfirmationPage.vue:130-132</code>), which is plain body text, not a red badge.</p>
        <p>If a badge is added, the DS danger text token is <code>--ds-color-text-danger</code> → red-600 <code>#DC2626</code>: 4.83:1 on white, but 4.41:1 on a red-50 fill (fails).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.roster">
    <ada-before status="no-equivalent" source="presto-2026 Storybook › Manage Booking / Account" :href="PRESTO.story('manage-booking-account--default')">
      <template #notes><p>No roster of guests booked into a block exists in presto-2026 (Storybook or <code>prototype/src/screens</code>). The closest structured data is the confirmation page's per-night list, which already uses <code>&lt;ul&gt;</code> (<code>ConfirmationPage.vue:168</code>) and a <code>&lt;dl&gt;</code> meta grid (<code>:139</code>).</p></template>
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
    setup: () => ({ ID, I: ITEMS, ROSTER, NEW, TOKEN, cardStyle, cell }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Item 3 shows both of Linear's roster options side by side, plus the agent's native-list version.">

  <ada-item v-bind="I.heading">
    <ada-option letter="A" title="Primary <h1>Manage Your Group Blocks</h1>, then h2 for the list" recommended lang="html"
      code='<!-- group_management/index.plush.html -->
<h1>Manage Your Group Blocks</h1>
<h2>Group Blocks</h2>          <!-- was <h3> at :5 -->
<%= for (b) in blocks { %>
  <h3><%= b.Name %></h3>
  …
<% } %>'>
      <div class="ada-mini-frame">
        <p class="ada-note" style="margin-bottom:6px">Heading outline after the fix:</p>
        <ol style="margin:0;padding-left:20px;line-height:1.7">
          <li>h1 · Manage Your Group Blocks</li>
          <li>h2 · Group Blocks</li>
          <li>h3 · Spring Cup — Eagles SC (one per block)</li>
        </ol>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.badge">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken deadline text to #B04545 (same hue, 5.55:1)" recommended lang="css"
        code=".deadline-badge {
  color: #B04545;            /* was #F86969 (2.91:1) → 5.55:1 on white */
  background: #FEF2F2;       /* optional tint: 5.07:1 */
  border: 1px solid currentColor;
}">
        <div class="ada-stack">
          <contrast-pair :fg="NEW" bg="#FFFFFF" label="Proposed deadline text on white" />
          <contrast-pair :fg="NEW" bg="#FEF2F2" label="Proposed deadline text on red-50 tint" />
          <p style="margin:0"><span :style="{ color: NEW, background: '#FEF2F2', border: '1px solid ' + NEW, borderRadius: '999px', padding: '2px 10px', fontWeight: 700, fontSize: '13px' }">Deadline: Jun 18</span></p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Map to the Presto token --ds-palette-red-700 (#B91C1C)" lang="css"
        code=".deadline-badge {
  color: var(--ds-palette-red-700);      /* #B91C1C · 6.47:1 on white */
  background: var(--ds-palette-red-50);  /* #FEF2F2 · 5.91:1 */
}
/* Don't use --ds-color-text-danger (red-600) on the red-50 fill: 4.41:1 */">
        <div class="ada-stack">
          <contrast-pair :fg="TOKEN" bg="#FFFFFF" label="red-700 on white" />
          <contrast-pair :fg="TOKEN" bg="#FEF2F2" label="red-700 on red-50" />
          <p style="margin:0"><span style="color:var(--ds-palette-red-700);background:var(--ds-palette-red-50);border:1px solid var(--ds-palette-red-700);border-radius:999px;padding:2px 10px;font-weight:700;font-size:13px">Deadline: Jun 18</span></p>
        </div>
        <template #why><p>Uses a color that already exists in the Presto palette (the kit's own error pills use red-800 on red-50), so the dashboard matches the redesign when it's ported. It also has more headroom than a one-off hex.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.roster">
    <div class="ada-stack">
      <ada-option letter="A" title="Convert the roster to a real <table>" recommended lang="html"
        code='<div class="table-wrap" role="region" aria-labelledby="roster-cap" tabindex="0">
<table class="table">
  <caption id="roster-cap">Reservations in <%= block.Name %></caption>
  <thead><tr>
    <th scope="col">Guest</th><th scope="col">Team</th>
    <th scope="col">Hotel</th><th scope="col">Dates</th>
    <th scope="col">Rooms</th><th scope="col">Status</th>
  </tr></thead>
  <tbody>
  <%= for (r) in reservations { %>
    <tr>
      <th scope="row"><%= r.GuestName %></th>
      <td><%= r.TeamName %></td><td><%= r.HotelName %></td>
      <td><%= r.CheckIn %> – <%= r.CheckOut %></td>
      <td><%= r.Rooms %></td><td><%= r.Status %></td>
    </tr>
  <% } %>
  </tbody>
</table>
</div>'>
        <div role="region" aria-labelledby="grp05-cap" tabindex="0" class="ada-focus-demo" style="overflow-x:auto">
          <table style="border-collapse:collapse;width:100%;font-size:14px;background:#fff">
            <caption id="grp05-cap" style="text-align:left;font-weight:700;padding-bottom:6px">Reservations in Spring Cup — Eagles SC</caption>
            <thead><tr>
              <th scope="col" :style="cell">Guest</th><th scope="col" :style="cell">Team</th><th scope="col" :style="cell">Hotel</th>
              <th scope="col" :style="cell">Dates</th><th scope="col" :style="cell">Rooms</th><th scope="col" :style="cell">Status</th>
            </tr></thead>
            <tbody>
              <tr v-for="r in ROSTER" :key="r.guest">
                <th scope="row" :style="cell">{{ r.guest }}</th><td :style="cell">{{ r.team }}</td><td :style="cell">{{ r.hotel }}</td>
                <td :style="cell">{{ r.dates }}</td><td :style="cell">{{ r.rooms }}</td><td :style="cell">{{ r.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="ada-note" style="margin-top:8px">Recommended by tables-data-specialist: the rows share the same fields. On phones, keep the table and scroll it, or stack cells with visible <code>data-label</code>s.</p>
      </ada-option>

      <div class="ada-options ada-options--2">
      <ada-option letter="B" title="Keep the cards: role=&quot;list&quot; / &quot;listitem&quot; + per-card aria-label" lang="html"
        code='<div class="roster" role="list" aria-label="Reservations">
<%= for (r) in reservations { %>
  <div class="card" role="listitem"
       aria-label="<%= r.GuestName %>, <%= r.HotelName %>, <%= r.Status %>">
    …
  </div>
<% } %>
</div>'>
        <div role="list" aria-label="Reservations (list demo)" class="ada-stack" style="gap:8px">
          <div v-for="r in ROSTER" :key="r.guest" role="listitem" :aria-label="r.guest + ', ' + r.hotel + ', ' + r.status" :style="cardStyle">
            <strong>{{ r.guest }}</strong> · {{ r.team }}<br />{{ r.hotel }} · {{ r.dates }} · {{ r.rooms }} room(s) · {{ r.status }}
          </div>
        </div>
        <p class="ada-note" style="margin-top:8px">Linear's alternative, for when the card layout is intentional.</p>
      </ada-option>

      <ada-option letter="C" origin="agent" agent="aria-specialist" title="Cards as a native <ul>, each named by a visible heading" lang="html"
        code='<h2 id="roster-title">Reservations</h2>
<ul class="roster" aria-labelledby="roster-title">
<%= for (r) in reservations { %>
  <li class="card">
    <h3><%= r.GuestName %></h3>
    <dl>
      <dt>Team</dt><dd><%= r.TeamName %></dd>
      <dt>Hotel</dt><dd><%= r.HotelName %></dd>
      <dt>Dates</dt><dd><%= r.CheckIn %> – <%= r.CheckOut %></dd>
      <dt>Status</dt><dd><%= r.Status %></dd>
    </dl>
  </li>
<% } %>
</ul>'>
        <p id="grp05c-title" style="margin:0 0 6px;font-weight:700">Reservations</p>
        <ul aria-labelledby="grp05c-title" style="list-style:none;margin:0;padding:0;display:grid;gap:8px">
          <li v-for="r in ROSTER" :key="r.guest" :style="cardStyle">
            <h4 style="margin:0 0 4px;font-size:15px;font-weight:700">{{ r.guest }}</h4>
            <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:14px">
              <dt style="font-weight:600">Team</dt><dd style="margin:0">{{ r.team }}</dd>
              <dt style="font-weight:600">Hotel</dt><dd style="margin:0">{{ r.hotel }}</dd>
              <dt style="font-weight:600">Status</dt><dd style="margin:0">{{ r.status }}</dd>
            </dl>
          </li>
        </ul>
        <template #why><p>Native list semantics work without ARIA. The per-card heading lets users jump between reservations with <kbd>H</kbd>, and the <code>&lt;dl&gt;</code> keeps field names with their values, which <code>aria-label</code> on a list item doesn't do reliably.</p></template>
      </ada-option>
      </div>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
