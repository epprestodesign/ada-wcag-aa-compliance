// ENG-2931 · ADA-PLAT-RES-01 — Event landing page & availability banners
// (platform, Go/Plush): decorative cover image alt, missing <h1>, event status
// cards ("Ended", "Available Soon") that don't expose their state.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2931.linear.md?raw'
import LandingPage from '../../presto/components/LandingPage.vue'
import coverImg from '../../background-img/defaultBackgroundImage.png'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-01 – Event Landing & Availability Banners',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2931'),
}

const ID = 'ENG-2931'

const ITEMS = {
  cover: { n: 1, title: 'Decorative cover image uses alt="background"', wcag: ['1.1.1'], element: 'Image · hero background', where: 'platform/app/templates/enduser/booking/index.plush.html:7' },
  title: { n: 2, title: 'Event title is an <h2> with no <h1> before it', wcag: ['1.3.1', '2.4.6'], element: 'Heading · event title', where: 'platform/app/templates/enduser/booking/index.plush.html' },
  status: { n: 3, title: 'Event status cards ("Ended", "Available Soon") don\'t expose their state', wcag: ['1.3.1', '2.4.6'], element: 'Status card · pill badge', where: 'platform/app/templates/enduser/booking/event_error_card.plush.html' },
}

const C = {
  coverBad: `<!-- booking/index.plush.html:7 (pattern per Linear) -->
<img src="<%= coverImageURL %>" alt="background" class="cover-image">`,
  coverGood: `<img src="<%= coverImageURL %>" alt="" role="presentation" class="cover-image">`,
  coverCss: `<!-- booking/index.plush.html — no <img> at all -->
<section class="event-hero"
         style="background-image: url('<%= coverImageURL %>')">
  <h1 class="event-hero__title"><%= event.Name %></h1>
</section>

.event-hero { background-size: cover; background-position: center; }`,
  titleBad: `<!-- booking/index.plush.html (pattern per Linear) -->
<h2 class="event-title"><%= event.Name %></h2>   <!-- first heading on the page -->`,
  titleGood: `<h1 class="event-title h2"><%= event.Name %></h1>
<!-- keep the visual size with Bootstrap's .h2 utility -->`,
  statusBad: `<!-- booking/event_error_card.plush.html (pattern per Linear) -->
<div class="card event-error-card">
  <span class="badge badge-pill badge-secondary">Ended</span>
  <p>Booking for this event is no longer available.</p>
</div>`,
  statusGood: `<div class="card event-error-card" role="alert">
  <h2 class="h5">
    <span class="badge badge-pill badge-secondary">Ended</span>
    Booking for this event has ended
  </h2>
  <p>Contact the organizer if you still need a room.</p>
</div>`,
  statusStatic: `<!-- Rendered by the server on page load: no live region needed -->
<section class="card event-status-card" aria-labelledby="event-status">
  <h2 id="event-status" class="h5">
    <span class="badge badge-pill badge-dark">Available soon</span>
    Booking opens Mon, Jun 1 at 9:00am ET
  </h2>
  <p>Come back then to reserve a room.</p>
</section>

<!-- Only if the state changes AFTER load (e.g. a countdown hits 0):
     <div role="status">Booking is now open.</div> -->`,
}

const pill = 'display:inline-block;line-height:20px;padding:2px 10px;border-radius:999px;font-size:13px;font-weight:700;vertical-align:middle;margin-right:8px'

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The event landing page is the first page guests see. Its cover image is announced as noise, it has no page title heading, and its 'booking closed' states aren't clear to assistive technology.">

  <ada-item v-bind="I.cover">
    <p>The cover photo is decoration, but <code>alt="background"</code> makes screen readers read out "background, image", which tells the user nothing.</p>
    <ada-code tone="bad" caption="Production — index.plush.html:7" :code="C.coverBad" />
    <sr-output before="background, image" after="(image skipped)" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Decorative images get alt=&quot;&quot;; role=&quot;presentation&quot; is optional reinforcement.">
      <p>Confirmed. <code>alt=""</code> alone is enough. Adding <code>role="presentation"</code> is harmless, and Option B removes the <code>&lt;img&gt;</code> altogether.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.title">
    <p>Screen-reader users often jump to the <code>&lt;h1&gt;</code> first to find out what a page is about. Here there isn't one, and the event name is the first heading, at level 2.</p>
    <ada-code tone="bad" caption="Production — index.plush.html" :code="C.titleBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Exactly one H1 per page, describing its purpose; never skip levels.">
      <p>Confirmed. Once the title is an <code>&lt;h1&gt;</code>, check that the sections below it start at <code>&lt;h2&gt;</code>.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.status">
    <p>The "Ended" and "Available Soon" states appear only as small pill badges. There's no heading, and nothing ties the badge to the message, so screen-reader users may miss that booking is closed.</p>
    <ada-code tone="bad" caption="Production pattern — event_error_card.plush.html" :code="C.statusBad" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Use real headings for content that users navigate by.">
      <p>A heading that includes the state ("Booking for this event has ended") makes the card easy to find and understand.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="disagrees" rule="role=&quot;alert&quot; is for error conditions; alerts already in the DOM at page load are NOT announced.">
      <p>This card is rendered by the server with the page, so <code>role="alert"</code> won't be announced on load. On a slow or partial render it could also interrupt the page announcement. The heading does the real work. Use <code>role="status"</code> only if the state changes after load (Option B).</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, LandingPage },
    setup: () => ({ ID, I: ITEMS, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The presto-2026 event landing page already handles the hero image and title correctly. It doesn't have event status states yet.">

  <ada-item v-bind="I.cover">
    <ada-before status="resolved" source="presto-2026 Storybook › Landing Page / Book Reservation" :href="PRESTO.story('landing-page-book-reservation--core-booking-widget')">
      <landing-page mode="reservations" :show-teams="false" :ads="0" />
      <template #notes>
        <p><code>LandingPage.vue</code> draws the cover photo as a CSS <code>background-image</code> (with a dark scrim), so there's no <code>&lt;img&gt;</code> to label. The only hero image is the EventPipe logo, which correctly has <code>alt="EventPipe"</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.title">
    <ada-before status="resolved" source="presto-2026 Storybook › Landing Page / Book Reservation" :href="PRESTO.story('landing-page-book-reservation--core-booking-widget')">
      <ada-code tone="good" caption="presto-2026 LandingPage.vue — hero" code='<h1 class="lp__event text-h5">{{ eventName }}</h1>
…
<h2 class="lp__section-title">{{ attendingTitle }}</h2>
<h3 class="lp__attend-title">{{ a.title }}</h3>' />
      <template #notes><p>The event name is the page's only <code>&lt;h1&gt;</code>, and the sections below go h2, then h3, with no skipped levels. You can see it in the frame above (item 1).</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.status">
    <ada-before status="no-equivalent" source="presto-2026 Storybook › Empty States (closest pattern)" :href="PRESTO.story('browse-hotels-components-results-empty-states--sold-out')">
      <template #empty>presto-2026 has no "event ended" or "available soon" state for the landing page yet. Neither <code>LandingPage.vue</code> nor the prototype has one, so there's nothing to show.</template>
      <template #notes>
        <p>The closest pattern, <code>DsEmptyState</code> ("Sold out for these dates"), renders its title as <code>&lt;div class="text-h6"&gt;</code>, not a heading. Don't copy that part when the event status card is designed. Use the Proposal pattern instead.</p>
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
    setup: () => ({ ID, I: ITEMS, C, coverImg, pill }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria, written in platform's Plush templates.">

  <ada-item v-bind="I.cover">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Empty alt plus role=&quot;presentation&quot;" recommended :code="C.coverGood">
        <img :src="coverImg" alt="" role="presentation" style="display:block;width:100%;max-width:420px;height:120px;object-fit:cover;border-radius:4px" />
        <p class="ada-note" style="margin-top:6px">Screen readers skip this image.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Use a CSS background, as presto-2026 does" :code="C.coverCss">
        <div :style="{ backgroundImage: 'linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(' + coverImg + ')', backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', padding: '28px 16px', borderRadius: '4px', textAlign: 'center' }">
          <p style="margin:0;font-size:22px;font-weight:700">Virginia International Youth Soccer Cup 2026</p>
        </div>
        <template #why><p>A purely decorative photo doesn't need to be in the HTML at all. The CSS approach matches the presto-2026 hero, so the two stay consistent. Keep a dark scrim so the title keeps its contrast.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.title">
    <ada-option letter="A" title="Promote the event title to <h1>" recommended :code="C.titleGood">
      <div class="ada-mini-frame">
        <h1 style="margin:0 0 4px;font-size:26px;line-height:1.2">Virginia International Youth Soccer Cup 2026</h1>
        <p class="ada-note">Sat, 7/18/2026 – Sun, 7/19/2026</p>
        <h2 style="margin:12px 0 0;font-size:18px">Who's Attending?</h2>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.status">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="role=&quot;alert&quot; plus a semantic heading" recommended :code="C.statusGood">
        <div class="ada-mini-frame" role="alert">
          <h2 style="margin:0 0 6px;font-size:18px;line-height:1.4"><span :style="pill + ';background:#475569;color:#fff'">Ended</span>Booking for this event has ended</h2>
          <p class="ada-note">Contact the organizer if you still need a room.</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="Static heading card, live region only for changes after load" :code="C.statusStatic">
        <section class="ada-mini-frame" aria-labelledby="ada-2931-status">
          <h2 id="ada-2931-status" style="margin:0 0 6px;font-size:18px;line-height:1.4"><span :style="pill + ';background:#01113E;color:#fff'">Available soon</span>Booking opens Mon, Jun 1 at 9:00am ET</h2>
          <p class="ada-note">Come back then to reserve a room.</p>
        </section>
        <template #why><p>The server renders the card with the page, so a live region adds nothing on load. The heading carries the state in words, not just in the pill's color. Use <code>role="status"</code> only if a script changes the state later.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
