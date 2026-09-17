// ENG-2946 · ADA-PLAT-MGMT-02 — Reservation details, status & printable
// receipt: heading misuse, label/value pairs as headings, generic thumbnail
// alt, #FFA000 star rating, silent deposit-alert banners.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2946.linear.md?raw'
import ConfirmationPage from '../../presto/components/confirmation/ConfirmationPage.vue'
import HotelSummaryHeader from '../../presto/components/details/HotelSummaryHeader.vue'
import { popularAmenities } from '../../presto/lib/amenities.js'

export default {
  title: 'Epic 5 – platform Order Management/ADA-PLAT-MGMT-02 – Reservation Details & Receipt',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2946'),
}

const ID = 'ENG-2946'
const SHOW = 'order_management/show.plush.html'

const ITEMS = {
  headings: { n: 1, title: 'No <h1>; hotel name is <h6>, room type is <h4>', wcag: ['1.3.1', '2.4.6'], element: 'Headings · hotel name / room type', where: `${SHOW}:108 (mobile), :127 (desktop), :149` },
  pairs: { n: 2, title: 'Label/value pairs and dates marked up as headings', wcag: ['1.3.1'], element: 'Details · label/value pairs', where: `${SHOW}:175 · :116-117 (<h6> check-in/out times) · :225-230 (<h4> dates)` },
  alt: { n: 3, title: 'Thumbnails use a generic alt="hotel image"', wcag: ['1.1.1'], element: 'Image · hotel thumbnail', where: `${SHOW}:102, :121 · partials/hotel_results.plush.html:39` },
  stars: { n: 4, title: 'Star rating #FFA000 is 2.04:1 on white', wcag: ['1.4.3'], element: 'Icon · star rating', where: `${SHOW}:111, :128` },
  deposit: { n: 5, state: 'new', title: 'Five deposit-alert banners, none with role="alert"', wcag: ['4.1.3'], element: 'Warning banners · deposit alert', where: 'platform/app/templates/partials/deposit_alert.plush.html:5, :12, :16, :21, :26 (invoked from show.plush.html:82)' },
}

// Mirrors presto-2026's ConfirmationPage "Single Reservation" story data
// (src/presto/stories/confirmation/ConfirmationPage.stories.js · reserveData).
const reservation = {
  contactName: 'Alex Smith',
  confirmationId: '72055771948934',
  reservedOn: 'Mon, 06/14/2027 02:14 PM EST',
  guest: 'Alex Smith — (555) 018-2245',
  email: 'youraccount@eventpipe.com',
  hotels: [{
    name: 'Days Inn by Wyndham Carson City', stars: 3, address: '4100 N Carson St, Carson City, NV, US, 89706', seed: 1,
    checkIn: 'Mon, 07/01/2027 03:00 PM', checkOut: 'Wed, 07/03/2027 11:00 AM',
    rooms: [{ type: 'Room, 1 Queen Bed, Non Smoking', note: '1 Queen Bed · Sleeps 2 · Breakfast included', nights: [
      { date: 'Mon, 07/01/2027', qty: 1, price: 128 },
      { date: 'Tue, 07/02/2027', qty: 1, price: 128 },
    ] }],
    totals: { taxes: 0, roomCost: 256, amountPaid: 0, balanceDue: 256 },
  }],
}

// HotelSummaryHeader "Default" story props (map off to keep the frame static).
const header = {
  name: 'Hilton Orlando Lake Buena Vista', stars: 4, address: 'Lake Buena Vista, Orlando, FL', distance: '2.4 mi from venue',
  score: 4.5, reviews: 1284, ratingLabel: 'Excellent', amenities: popularAmenities().slice(0, 4), showMap: false,
  checkInTime: '3:00 PM', checkOutTime: '11:00 AM',
}

// Offline placeholder thumbnail for Proposal demos.
const THUMB = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="92" height="72"><rect width="92" height="72" fill="#CBD5E1"/><path d="M10 60 L34 30 L52 50 L64 38 L84 60 Z" fill="#64748B"/></svg>')

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The reservation details page, which doubles as the printable receipt. Linear matched every cited line and adds one nuance (two separate heading-misuse spots) plus a new finding: the deposit-alert partial.">

  <ada-item v-bind="I.headings">
    <p>No <code>&lt;h1&gt;</code> exists. The hotel name, the page's real subject, is an <code>&lt;h6&gt;</code> (twice, for mobile and desktop), and the room type below it is an <code>&lt;h4&gt;</code>. The outline runs backwards: h6, then h4.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:127, :149" code='<h6 class="hotel-name"><%= order.HotelName %></h6>      <!-- L127 (L108 mobile) -->
…
<h4 class="room-type"><%= order.RoomType %></h4>         <!-- L149 -->' />
    <sr-output before="heading level 6, Days Inn… · heading level 4, Room, 1 Queen Bed…" after="heading level 1, Days Inn… · heading level 2, Room, 1 Queen Bed…" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Exactly one H1 per page; heading levels communicate structure, not size.">
      <p>Confirmed. The mobile and desktop copies (L108/L127) must not both be exposed as <code>&lt;h1&gt;</code>. The hidden copy is <code>display:none</code> through Bootstrap's responsive classes, so only one is in the accessibility tree. Verify that neither copy uses a visually-hidden class instead.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.pairs">
    <p>"Primary Guest:" and its value are an <code>&lt;h4&gt;</code> (L175). The hotel's standard check-in/out times are <code>&lt;h6&gt;</code> (L116-117), and this reservation's own Check In/Check Out dates are <code>&lt;h4&gt;</code> again (L225-230). The heading list fills with data values, and the label-value link is lost.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:116-117, :175, :225-230" code='<h6>Check-in: 3:00 PM  Check-out: 11:00 AM</h6>     <!-- L116-117 -->
<h4>Primary Guest: <%= order.GuestName %></h4>        <!-- L175 -->
<h4>Check In</h4>  <h4><%= order.CheckIn %></h4>       <!-- L225-230 -->
<h4>Check Out</h4> <h4><%= order.CheckOut %></h4>' />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Headings mark sections, not data; never use a heading level for visual weight.">
      <p>Agrees with the <code>&lt;dl&gt;</code> fix. Keep one real heading above each group (e.g. <code>&lt;h2&gt;Stay details&lt;/h2&gt;</code>) so the page is still navigable by heading after the fake headings are removed.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.alt">
    <p>Every thumbnail says "hotel image", which gives no information. The same bug is in the search results partial.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:102, :121" code='<img src="<%= order.HotelImage %>" alt="hotel image" class="thumb">' />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Context determines category: an image next to text that already names it is decorative (alt=&quot;&quot;); decorative images must not carry descriptive alt.">
      <p>Agrees it's wrong. The thumbnail sits right beside the hotel-name heading, though, so <code>alt="Days Inn…"</code> would read the name twice. <code>alt=""</code> is the cleaner fix here. Use the hotel name as alt only where the image appears without the name (e.g. if it's a link on its own).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.stars">
    <contrast-pair fg="#FFA000" bg="#FFFFFF" size="ui" sample="★★★★☆" label="Production star rating #FFA000 on white" />
    <ada-code tone="bad" caption="Production pattern — show.plush.html:111, :128" code='<span class="stars" style="color:#FFA000">
  <%= for (i) in range(1, order.HotelStars) { %><i class="fa fa-star"></i><% } %>
</span>' />
    <agent-check agent="contrast-master" verdict="refines" rule="Icons that convey meaning need 3:1 (WCAG 1.4.11 Non-text Contrast); text needs 4.5:1 (1.4.3).">
      <p><strong>Number check:</strong> 2.04:1 is correct. The applicable bar depends on how the stars render. Icon-font or SVG stars are non-text, so <strong>1.4.11 (3:1)</strong> applies, not 1.4.3. Stars drawn as "★" text characters count as text and need 4.5:1. #FFA000 fails either bar.</p>
      <p>Also, if the stars carry no text equivalent (e.g. "3-star hotel"), that's a <strong>1.1.1</strong> failure, which this ticket lists. Fixing color alone doesn't give screen-reader users the rating.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.deposit">
    <p><strong>New finding.</strong> The deposit-alert partial can render five different warning banners (lines 5, 12, 16, 21, 26). None of them has <code>role="alert"</code>. The partial moved from <code>order_management/partials/</code> (which doesn't exist) to <code>templates/partials/</code>.</p>
    <ada-code tone="bad" caption="Production pattern — partials/deposit_alert.plush.html:5" code='<div class="alert alert-warning">
  A deposit of <%= deposit %> will be charged on <%= date %>.
</div>' />
    <agent-check agent="live-region-controller" verdict="refines" rule="role=alert is implicitly assertive; alerts present at page load are not announced; never use assertive for routine or multiple simultaneous messages.">
      <p>Agrees they need attention, but <code>role="alert"</code> on page-load content won't be spoken, and if several banners render at once, five assertive regions compete. Add the role as Linear asks. Also make sure only one deposit banner renders per state (the partial's branches look mutually exclusive), and add a visible "Deposit" label or icon text so the meaning doesn't rely on the yellow color alone.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ConfirmationPage, HotelSummaryHeader },
    setup: () => ({ ID, I: ITEMS, PRESTO, reservation, header }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has no post-booking 'reservation details' page yet. The closest screens are the Confirmation page (same receipt data) and the Hotel Summary Header (hotel name + star class).">

  <ada-item v-bind="I.headings">
    <ada-before status="applies" source="presto-2026 Storybook › Confirmation / Book Reservation › Single Reservation" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <confirmation-page mode="reserve" :data="reservation" />
      <template #notes>
        <p>No <code>&lt;h1&gt;</code>: the success banner title is a <code>&lt;p&gt;</code> (ConfirmationPage.vue:108), and the page starts at <code>&lt;h2&gt;</code> "Reservation Summary" (:115). The hotel name is an <code>&lt;h3&gt;</code> (:153), which is right, but the room type is a styled <code>&lt;div&gt;</code> (:160), not a heading.</p>
        <p>The Hotel Summary Header (item 4 frame) renders the hotel name as a <code>&lt;span&gt;</code> (HotelSummaryHeader.vue:49-50). It isn't a heading at all.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.pairs">
    <ada-before status="partial" source="presto-2026 › ConfirmationPage.vue (frame above)" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <ada-code tone="good" caption="ConfirmationPage.vue:139-144 — already a <dl>" code='<dl class="conf__metagrid">
  <div v-for="m in metaRows"><dt>{{ m.label }}:</dt><dd>{{ m.value }}</dd></div>
</dl>' />
      <ada-code tone="bad" caption="ConfirmationPage.vue:163-166 — check-in/out are spans" code='<div class="conf__cirow"><span>Check In</span><strong>{{ h.checkIn }}</strong></div>
<div class="conf__cirow"><span>Check Out</span><strong>{{ h.checkOut }}</strong></div>' />
      <template #notes>
        <p>Guest, email, reserved-on and the totals use <code>&lt;dl&gt;</code> (:139, :179), and nothing is a fake heading. The Check In / Check Out rows (the same data as production L225-230) are <code>span</code>/<code>strong</code> pairs, though, so the label-value link is still only visual. HotelSummaryHeader's check-in/out times (:63-66) are spans too.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.alt">
    <ada-before status="resolved" source="presto-2026 › ConfirmationPage.vue:150" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <ada-code tone="good" caption="ConfirmationPage.vue:150 — decorative thumbnail next to the <h3> name" code='<img v-if="thumb(h)" :src="thumb(h)" alt="" class="conf__thumb" />' />
      <template #notes><p>The redesign marks the thumbnail decorative because the hotel name heading sits beside it. That's the agent's recommended variant (Proposal, Option B).</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.stars">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Summary Header" :href="PRESTO.story('hotel-details-components-hotel-summary-header--no-map')">
      <div style="max-width:900px"><hotel-summary-header v-bind="header" /></div>
      <div class="ada-contrast-grid" style="margin-top:12px">
        <contrast-pair fg="#F97316" bg="#FFFFFF" size="ui" sample="★ 3 Stars" label="Confirmation star icon (orange-500)" />
        <contrast-pair fg="#F59E0B" bg="#FFFFFF" size="ui" sample="★ 4.5/5" label="DsRating star icon" />
        <contrast-pair fg="#0F172A" bg="#FFFFFF" size="ui" sample="★★★★☆" label="Hotel Summary Header star class (slate-900)" />
      </div>
      <template #notes>
        <p><strong>Contrast:</strong> the hotel-class stars here are Slate 900 (HotelSummaryHeader.vue:92), so they pass. The Confirmation page star (ConfirmationPage.vue:265, <code>--ds-palette-orange-500</code> #F97316, 2.80:1) and DsRating's star (DsRating.vue:34, #F59E0B, 2.15:1) are below 3:1. Both sit next to text that states the value ("3 Stars", "4.5/5") and Quasar renders the icon <code>aria-hidden</code>, so the information doesn't depend on the icon.</p>
        <p><strong>Text alternative:</strong> the Summary Header's stars are the only cue for the hotel class. Their meaning ("4-star hotel") is only in a <code>title</code> tooltip (:51), which screen readers don't reliably read. That's the 1.1.1 part of this item.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.deposit">
    <ada-before status="no-equivalent" source="presto-2026 › ConfirmationPage.vue">
      <template #empty>presto-2026 shows no deposit-alert banners. Deposit terms appear only as static policy text on the Confirmation page.</template>
      <template #notes><p>Related: the Confirmation success banner (ConfirmationPage.vue:105-112) has no <code>role="status"</code>. In the SPA it appears after a client-side route change, so it's a status message that screen readers won't announce.</p></template>
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
    setup: () => ({ ID, I: ITEMS, THUMB }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in each item is the fix from Linear's acceptance criteria. Demo headings are shifted down (h4/h5) because this story page already has its own h1.">

  <ada-item v-bind="I.headings">
    <ada-option letter="A" title="<h1> for the hotel name, <h2> for the room type" recommended
      code='<h1 class="h6 hotel-name"><%= order.HotelName %></h1>
…
<h2 class="h4 room-type"><%= order.RoomType %></h2>'>
      <div class="ada-mini-frame">
        <h4 style="margin:0;font-size:20px">Days Inn by Wyndham Carson City <span class="ada-note" style="font-size:12px">(h1 in production)</span></h4>
        <h5 style="margin:6px 0 0;font-size:16px">Room, 1 Queen Bed, Non Smoking <span class="ada-note" style="font-size:12px">(h2)</span></h5>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.pairs">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Convert both misuse spots (L175 pairs, L225-230 dates) into a <dl>" recommended
        code='<dl class="row">
  <dt class="col-5">Primary Guest</dt><dd class="col-7"><%= order.GuestName %></dd>
  <dt class="col-5">Check In</dt>     <dd class="col-7"><%= order.CheckIn %></dd>
  <dt class="col-5">Check Out</dt>    <dd class="col-7"><%= order.CheckOut %></dd>
</dl>
<!-- L116-117: hotel standard times -->
<dl class="row small">
  <dt class="col-5">Hotel check-in time</dt> <dd class="col-7">3:00 PM</dd>
  <dt class="col-5">Hotel check-out time</dt><dd class="col-7">11:00 AM</dd>
</dl>'>
        <dl class="ada-mini-frame" style="display:grid;grid-template-columns:auto 1fr;gap:6px 16px;margin:0">
          <dt style="color:#475569">Primary Guest</dt><dd style="margin:0;font-weight:700">Alex Smith</dd>
          <dt style="color:#475569">Check In</dt><dd style="margin:0;font-weight:700">Mon, 07/01/2027 03:00 PM</dd>
          <dt style="color:#475569">Check Out</dt><dd style="margin:0;font-weight:700">Wed, 07/03/2027 11:00 AM</dd>
          <dt style="color:#475569">Hotel check-in time</dt><dd style="margin:0">3:00 PM</dd>
          <dt style="color:#475569">Hotel check-out time</dt><dd style="margin:0">11:00 AM</dd>
        </dl>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Keep one real heading per group above each <dl>"
        code='<h2 class="h5">Stay details</h2>
<dl class="row">…</dl>
<h2 class="h5">Guest</h2>
<dl class="row">…</dl>'>
        <template #why><p>Removing the fake <code>&lt;h4&gt;</code>s also removes the page's heading stops. A short heading per group keeps the details page navigable by heading.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.alt">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Replace alt=&quot;hotel image&quot; with the hotel name (both locations)" recommended
        code='<img src="<%= order.HotelImage %>" alt="<%= order.HotelName %>" class="thumb">
<!-- partials/hotel_results.plush.html:39 -->
<img src="<%= hotel.Image %>" alt="<%= hotel.Name %>">'>
        <div class="ada-row"><img :src="THUMB" alt="Days Inn by Wyndham Carson City" width="92" height="72" style="border-radius:6px" /><p class="ada-note">alt = "Days Inn by Wyndham Carson City"</p></div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="alt=&quot;&quot; where the hotel name is already beside the image"
        code='<img src="<%= order.HotelImage %>" alt="" class="thumb">
<h1 class="h6"><%= order.HotelName %></h1>'>
        <div class="ada-row">
          <img :src="THUMB" alt="" width="92" height="72" style="border-radius:6px" />
          <p style="margin:0;font-weight:700">Days Inn by Wyndham Carson City</p>
        </div>
        <template #why><p>Avoids "Days Inn… image, Days Inn… heading" being read back to back. This matches presto-2026's Confirmation page. Keep Option A for images shown without the name.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.stars">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken the star color to pass (Linear: 'fix star-rating contrast')" recommended lang="html"
        code='<span class="stars" role="img" aria-label="<%= order.HotelStars %>-star hotel"
      style="color:#B45309">      <!-- 5.02:1 — presto amber-700 -->
  <i class="fa fa-star" aria-hidden="true"></i>…
</span>'>
        <contrast-pair fg="#B45309" bg="#FFFFFF" sample="★★★☆☆" label="Proposed star color (presto --ds-palette-amber-700)" />
        <p class="ada-note" style="margin-top:8px">Linear doesn't name a color. #B45309 clears 4.5:1, so it's safe whether the stars are icons or "★" text. The demo also adds the text alternative:</p>
        <p style="margin:4px 0 0"><span role="img" aria-label="3-star hotel" style="color:#B45309;font-size:20px;letter-spacing:2px">★★★<span style="color:#64748B">☆☆</span></span></p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="contrast-master" title="Keep a brighter gold at the 3:1 icon bar + visible text"
        code='<span class="stars">
  <i class="fa fa-star" aria-hidden="true" style="color:#D97706"></i>…  <!-- 3.19:1 -->
  <span class="star-text">3-star hotel</span>
</span>'>
        <contrast-pair fg="#D97706" bg="#FFFFFF" size="ui" sample="★★★" label="Icon-only gold (presto --ds-palette-amber-600)" />
        <p style="margin:8px 0 0;display:flex;align-items:center;gap:6px"><span aria-hidden="true" style="color:#D97706;font-size:20px">★★★</span><strong>3-star hotel</strong></p>
        <template #why><p>Icon-font stars are non-text, so 1.4.11's 3:1 is the requirement, and a warmer gold closer to the brand still works. Showing the class as text (as presto's Confirmation page does) covers 1.1.1 for everyone, not just screen-reader users. This only holds if the stars are icons, not "★" characters.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.deposit">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add role=&quot;alert&quot; to all 5 deposit-alert banners" recommended
        code='<!-- partials/deposit_alert.plush.html:5, 12, 16, 21, 26 -->
<div class="alert alert-warning" role="alert">
  A deposit of <%= deposit %> will be charged on <%= date %>.
</div>'>
        <div role="alert" style="padding:10px 12px;border-radius:4px;background:#FFFBEB;border:1px solid #FCD34D;color:#78350F">
          <strong>Deposit:</strong> A deposit of $128.00 will be charged on Thu, 06/24/2027.
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="One banner, labelled, and focused only when it's news"
        code='<%= if (depositMessage) { %>
<div class="alert alert-warning" role="alert" tabindex="-1" id="depositAlert">
  <strong>Deposit:</strong> <%= depositMessage %>
</div>
<% } %>'>
        <template #why><p>The five branches collapse into a single region, so at most one assertive alert ever renders. The "Deposit:" prefix carries the meaning in text, not just the yellow color. Move focus to it only after an action that changed the deposit (e.g. after a modification), since page-load alerts aren't announced.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
