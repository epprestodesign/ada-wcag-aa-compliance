// ENG-2945 · ADA-PLAT-MGMT-01 — End-user Reservations Dashboard / List:
// <h3> page title, (refuted) cutoff banner, generic "Manage Reservation" links,
// dead href="#" hotel-name anchor.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2945.linear.md?raw'
import ManageBooking from '../../presto/components/managebooking/ManageBooking.vue'
import GlobalNav from '../../presto/components/GlobalNav.vue'

export default {
  title: 'Epic 5 – platform Order Management/ADA-PLAT-MGMT-01 – Reservations Dashboard List',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2945'),
}

const ID = 'ENG-2945'
const FILE = 'platform/app/templates/enduser/order_management/index.plush.html'

const ITEMS = {
  title: { n: 1, title: 'List starts at <h3> with no <h1> or <h2> before it', wcag: ['1.3.1', '2.4.6'], element: 'Heading · page title', where: `${FILE}:5` },
  banner: { n: 2, state: 'refuted', title: 'Cutoff restriction banner lacks role="alert"', wcag: ['4.1.3'], element: 'Warning banner', where: `${FILE}:38` },
  links: { n: 3, state: 'corrected', title: 'Every card’s link just says "Manage Reservation"', wcag: ['2.4.4'], element: 'Links · reservation cards', where: `${FILE}:80-82, :122-124` },
  dead: { n: '3b', state: 'new', title: 'Dead href="#" anchor around the hotel name (mobile)', wcag: ['2.4.4'], element: 'Link · hotel name', where: `${FILE}:99` },
}

// Sample reservations — hotel names/IDs follow presto-2026's confirmation story data.
const reservations = [
  { hotel: 'Days Inn by Wyndham Carson City', pipeId: '72055771948934', dates: 'Jul 1 – Jul 3, 2027', status: 'Confirmed' },
  { hotel: 'Embassy Suites Chicago Downtown', pipeId: '72055771950112', dates: 'Jun 16 – Jun 19, 2027', status: 'Confirmed' },
]
const user = { name: 'Justin Girard', email: 'youraccount@eventpipe.com' }

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The signed-in guest's list of reservations. Linear's corrected pass confirms the heading issue, refutes the banner finding, and changes the link text to 'Manage Reservation'. It also adds a new dead link.">

  <ada-item v-bind="I.title">
    <p>The page title "Your Reservations ( X )" is an <code>&lt;h3&gt;</code>, and no <code>&lt;h1&gt;</code> or <code>&lt;h2&gt;</code> comes before it. Screen-reader heading navigation starts at level 3, so users may think they've missed content.</p>
    <ada-code tone="bad" caption="Production pattern — index.plush.html:5" code='<h3>Your Reservations ( <%= len(orders) %> )</h3>' />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Exactly one H1 per page; never skip heading levels.">
      <p>Agrees. Once the title is <code>&lt;h1&gt;</code>, any per-card headings below it must be <code>&lt;h2&gt;</code>, not stay at h4/h5, or the fix just moves the skipped level lower down.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.banner">
    <p><strong>Refuted in Linear.</strong> The cutoff restriction banner at line 38 already has <code>role="alert"</code>. No fix is needed.</p>
    <ada-code tone="good" caption="Production — index.plush.html:38 (already correct)" code='<div class="alert alert-warning" role="alert">…cutoff restriction…</div>' />
    <agent-check agent="live-region-controller" verdict="refines" rule="Alerts that are present in the DOM when the page loads are NOT announced; reserve role=alert for changes.">
      <p>Agrees no change is required. Note that on a server-rendered page, <code>role="alert"</code> doesn't make the banner speak on load. It's still readable in order, and harmless, so leave it.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.links">
    <p>Each reservation card has a link reading "Manage Reservation" (desktop, lines 80-82, and mobile, lines 122-124). In a screen reader's links list, a guest with three bookings hears the same phrase three times with no way to tell them apart. <em>Corrected:</em> the draft said "View Details".</p>
    <ada-code tone="bad" caption="Production pattern — index.plush.html:80-82" code='<%= for (o) in orders { %>
  …
  <a href="<%= orderPath({order_id: o.ID}) %>" class="btn btn-primary">
    Manage Reservation
  </a>
<% } %>' />
    <sr-output before="link, Manage Reservation · link, Manage Reservation" after="link, Manage reservation at Days Inn by Wyndham Carson City, Pipe ID 72055771948934" />
    <agent-check agent="link-checker" verdict="agrees" rule="Repeated identical link text to different destinations is ambiguous; an aria-label must contain the visible text (WCAG 2.5.3).">
      <p>Confirmed. Linear's label starts with "Manage reservation", so speech-input users can still say the visible text. Label-in-name is satisfied.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.dead">
    <p><strong>New finding.</strong> The mobile layout wraps the hotel name in <code>&lt;a href="#"&gt;</code>. It's announced as a link and is in the Tab order, but activating it only jumps to the top of the page.</p>
    <ada-code tone="bad" caption="Production pattern — index.plush.html:99" code='<a href="#"><h5><%= o.HotelName %></h5></a>' />
    <agent-check agent="link-checker" verdict="agrees" rule="Flag dead href=&quot;#&quot; links: a link must go somewhere; otherwise use plain text or a button.">
      <p>Confirmed. Either point it at the reservation details, or drop the anchor and keep the name as text.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ManageBooking, GlobalNav },
    setup: () => ({ ID, I: ITEMS, PRESTO, user }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no reservations list yet. 'Manage Booking' opens an account page with profile, communications, payments, security and help. Each item is checked against that page and the Global Nav.">

  <ada-item v-bind="I.title">
    <ada-before status="applies" source="presto-2026 Storybook › Manage Booking / Account" :href="PRESTO.story('manage-booking-account--default')">
      <manage-booking :user="user" default-section="help" />
      <template #notes>
        <p>The page that would hold the reservations list has no <code>&lt;h1&gt;</code>. It starts at the panel's <code>&lt;h2&gt;</code> (ManageBooking.vue:132), and the member name is a <code>&lt;strong&gt;</code> (:106). A "Reservations" section added here would repeat the defect.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.banner">
    <ada-before status="no-equivalent" source="presto-2026 › ManageBooking.vue">
      <template #empty>presto-2026 has no cutoff-restriction banner. Nothing to compare, and Linear needs no change here.</template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.links">
    <ada-before status="no-equivalent" source="presto-2026 › ManageBooking.vue">
      <template #empty>presto-2026 has no list of reservation cards with per-card "Manage Reservation" links. The Proposal shows the pattern to use when one is designed.</template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.dead">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Global Nav" :href="PRESTO.story('app-shell-global-nav-cart-book-reservation--reserve-cart')">
      <global-nav brand="Soccer League" />
      <template #notes>
        <p>The redesign has the same pattern in its nav: the brand is <code>&lt;a href="#" @click.prevent&gt;</code> (GlobalNav.vue:63), and "Contact Us" is an <code>&lt;a href="#"&gt;</code> that opens a menu (:66). Point the brand at a real home URL, and make Contact Us a <code>&lt;button&gt;</code> (see ENG-2930).</p>
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
    setup: () => ({ ID, I: ITEMS, reservations }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in each item is the fix from Linear's acceptance criteria. The demo list in item 3 shows all the fixes together; press Tab through it.">

  <ada-item v-bind="I.title">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Promote the page title (L5) to <h1>" recommended
        code='<h1 class="h3">Your Reservations (<%= len(orders) %>)</h1>' />
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Give each reservation card an <h2> hotel name"
        code='<h1 class="h3">Your Reservations (<%= len(orders) %>)</h1>
<%= for (o) in orders { %>
  <article class="card">
    <h2 class="h5"><%= o.HotelName %></h2>
    …
  </article>
<% } %>'>
        <template #why><p>Screen-reader users can then press <kbd>H</kbd> to move card by card. The item 3 demo uses this structure (levels shifted for this page).</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.banner">
    <ada-option letter="A" title="No change needed" recommended
      code='<!-- index.plush.html:38 — keep as is -->
<div class="alert alert-warning" role="alert">…</div>'>
      <p class="ada-note">Linear confirms the cutoff banner already carries <code>role="alert"</code>. Keep it.</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.links">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label=&quot;Manage reservation at [hotel], Pipe ID [id]&quot;" recommended
        code='<a href="<%= orderPath({order_id: o.ID}) %>" class="btn btn-primary"
   aria-label="Manage reservation at <%= o.HotelName %>, Pipe ID <%= o.PipeID %>">
  Manage Reservation
</a>'>
        <ul class="ada-stack ada-focus-demo" style="list-style:none;margin:0;padding:0" aria-label="Your reservations (demo)">
          <li v-for="r in reservations" :key="r.pipeId" class="ada-mini-frame">
            <h4 style="margin:0;font-size:16px">{{ r.hotel }}</h4>
            <p class="ada-note">{{ r.dates }} · Pipe ID {{ r.pipeId }} · {{ r.status }}</p>
            <q-btn unelevated color="primary" no-caps size="md" style="margin-top:8px" :href="'#res-' + r.pipeId" @click.prevent
              label="Manage Reservation" :aria-label="'Manage reservation at ' + r.hotel + ', Pipe ID ' + r.pipeId" />
          </li>
        </ul>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="link-checker" title="Visually hidden text instead of aria-label"
        code='<a href="<%= orderPath({order_id: o.ID}) %>" class="btn btn-primary">
  Manage Reservation<span class="sr-only"> at <%= o.HotelName %>,
  Pipe ID <%= o.PipeID %></span>
</a>'>
        <template #why><p>This gives the same announcement, but the extra words are real text. Browser translation picks them up (translators often skip <code>aria-label</code>), and there's no risk of the label drifting from the visible text.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.dead">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Point the hotel-name link at the reservation details" recommended
        code='<h2 class="h5">
  <a href="<%= orderPath({order_id: o.ID}) %>"><%= o.HotelName %></a>
</h2>'>
        <div class="ada-mini-frame ada-focus-demo">
          <p style="margin:0;font-size:16px;font-weight:700"><a href="#res-72055771948934" @click.prevent>Days Inn by Wyndham Carson City</a></p>
          <p class="ada-note">The link goes to the same details page as "Manage Reservation".</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="link-checker" title="Or drop the anchor: plain heading text"
        code='<h2 class="h5"><%= o.HotelName %></h2>'>
        <template #why><p>If the card already has a clearly labelled "Manage Reservation" link, a second link to the same place adds a Tab stop. Plain text removes the dead link without adding a duplicate.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
