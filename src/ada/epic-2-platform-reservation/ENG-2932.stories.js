// ENG-2932 · ADA-PLAT-RES-02 — Hotel search results & filter form
// (platform, Go/Plush): heading outline starts at <h5>, unlabeled filter
// inputs, vague "Choose Room" links and generic thumbnail alt text.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2932.linear.md?raw'
import FilterRail from '../../presto/components/browse/FilterRail.vue'
import PropertyNameField from '../../presto/components/browse/filter-rail/PropertyNameField.vue'
import StarRatingField from '../../presto/components/browse/filter-rail/StarRatingField.vue'
import ExactMatchesField from '../../presto/components/browse/filter-rail/ExactMatchesField.vue'
import SearchRadiusField from '../../presto/components/browse/filter-rail/SearchRadiusField.vue'
import HotelCardReserve from '../../presto/components/browse/HotelCardReserve.vue'
import { sampleRooms } from '../../presto/stories/browse/_rooms-sample.js'
import thumb from '../../presto/assets/hotel/lobby.jpg'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-02 – Hotel Search Results & Filter Form',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2932'),
}

const ID = 'ENG-2932'

const ITEMS = {
  headings: { n: 1, title: 'Filter form headings start at <h5>, skipping h1–h4', wcag: ['1.3.1', '2.4.6'], element: 'Headings · page outline', where: 'platform/app/templates/enduser/booking/filter_form.plush.html · booking/results.plush.html' },
  labels: { n: 2, title: 'Filter inputs have no <label for>', wcag: ['1.3.1', '4.1.2'], element: 'Form fields · checkboxes, selects', where: 'platform/app/templates/enduser/booking/filter_form.plush.html' },
  cards: { n: 3, title: 'Vague "Choose Room" links and alt="hotel image" on result cards', wcag: ['2.4.6', '2.4.4', '1.1.1'], element: 'Result card · link, thumbnail', where: 'platform/app/templates/enduser/partials/hotel_results.plush.html:39' },
}

const C = {
  headBad: `<!-- booking/results.plush.html — no <h1> -->
<div class="search-results">
  <%= partial("booking/filter_form.html") %>
  …
<!-- booking/filter_form.plush.html (pattern per Linear) -->
<h5>Filter Results</h5>
<h5>Star Rating</h5>
<h5>Amenities</h5>`,
  headGood: `<!-- booking/results.plush.html -->
<h1>Available Hotels for <%= event.Name %></h1>
<%= partial("booking/filter_form.html") %>`,
  headOutline: `<!-- results.plush.html -->
<h1>Available Hotels for <%= event.Name %></h1>

<!-- filter_form.plush.html -->
<aside aria-labelledby="filters-h">
  <h2 id="filters-h" class="h5">Filter results</h2>
  <fieldset> <legend class="h6">Star rating</legend> … </fieldset>
</aside>

<!-- results list -->
<h2 class="sr-only">Results</h2>
<article> <h3><%= hotel.Name %></h3> … </article>`,
  labelBad: `<!-- booking/filter_form.plush.html (pattern per Linear) -->
<input type="checkbox" name="stars" value="5"> 5 stars
<input type="checkbox" name="amenities" value="pool"> Pool
<select name="sort"> … </select>`,
  labelGood: `<input type="checkbox" id="stars-5" name="stars" value="5">
<label for="stars-5">5 stars</label>

<label for="sort">Sort by</label>
<select id="sort" name="sort"> … </select>`,
  fieldset: `<fieldset>
  <legend>Star rating</legend>
  <%= for (n) in [5, 4, 3] { %>
    <div class="form-check">
      <input class="form-check-input" type="checkbox"
             id="stars-<%= n %>" name="stars" value="<%= n %>">
      <label class="form-check-label" for="stars-<%= n %>"><%= n %> stars</label>
    </div>
  <% } %>
</fieldset>`,
  cardBad: `<!-- partials/hotel_results.plush.html:39 (pattern per Linear) -->
<img src="<%= hotel.ThumbnailURL %>" alt="hotel image">
…
<a href="<%= hotelPath({hotel_id: hotel.ID}) %>" class="btn btn-primary">Choose Room</a>`,
  cardGood: `<img src="<%= hotel.ThumbnailURL %>" alt="<%= hotel.Name %>">
…
<a href="<%= hotelPath({hotel_id: hotel.ID}) %>" class="btn btn-primary">
  Choose Room at <%= hotel.Name %>
</a>`,
  cardSr: `<h3 id="hotel-<%= hotel.ID %>"><%= hotel.Name %></h3>
<img src="<%= hotel.ThumbnailURL %>" alt="">   <!-- name is right beside it -->
…
<a href="<%= hotelPath({hotel_id: hotel.ID}) %>" class="btn btn-primary">
  Choose Room<span class="sr-only"> at <%= hotel.Name %></span>
</a>`,
}

const hotel = {
  name: 'The Minuteman Inn', city: 'Acton', stars: 2.5, distance: '3.48 miles from Acton Boxborough',
  preferred: true, refundable: true, fromNightly: 100, total: 400, rooms: sampleRooms,
  imageCategories: ['lobby', 'exterior', 'rooms'], seed: 1, availability: 'available',
}

const S = {
  btn: 'display:inline-block;font-weight:700;color:#fff;background:#01113E;border-radius:4px;padding:9px 16px;text-decoration:none',
  select: 'font:inherit;padding:6px 8px;border:1px solid #64748B;border-radius:4px;min-width:180px',
  legend: 'font-weight:700;font-size:15px;padding:0 4px',
  fieldset: 'border:1px solid #CBD5E1;border-radius:4px;padding:8px 12px;margin:0',
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The results page has no page heading, its filter form can't be understood without seeing it, and every result card has the same link and image text. Linear also corrected the file paths: the card partial is partials/hotel_results.plush.html.">

  <ada-item v-bind="I.headings">
    <p>The page has no <code>&lt;h1&gt;</code>, and the filter sections are <code>&lt;h5&gt;</code>. Screen-reader users who move by headings think they missed four levels of content.</p>
    <ada-code tone="bad" caption="Production — results.plush.html / filter_form.plush.html" :code="C.headBad" />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Exactly one H1 per page; never skip levels (H1 → H3 is a violation).">
      <p>Adding the <code>&lt;h1&gt;</code> is right, but on its own it still leaves an h1 → h5 jump. The acceptance criteria should also re-level the filter headings to <code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code> (or turn the group titles into <code>&lt;legend&gt;</code>s, see item 2). The <code>.h5</code> class can keep the current look (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.labels">
    <p>Without <code>&lt;label for&gt;</code>, screen readers announce "checkbox, not checked" with no name, and clicking the text doesn't toggle the box.</p>
    <ada-code tone="bad" caption="Production pattern — filter_form.plush.html" :code="C.labelBad" />
    <sr-output before="checkbox, not checked" after="Star rating, group. 5 stars, checkbox, not checked" />
    <agent-check agent="forms-specialist" verdict="refines" rule="Every input needs a programmatic label; checkbox and radio groups need <fieldset>/<legend>; placeholder is never a label.">
      <p>Agrees. A <code>&lt;label for&gt;</code> on each box gives "5 stars", but users also need to hear the group name ("Star rating"). The <code>&lt;h5&gt;</code> above the group doesn't provide that. Wrap each group in <code>&lt;fieldset&gt;&lt;legend&gt;</code> (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.cards">
    <p>In a screen reader's links list, every card shows up as "Choose Room", with no way to tell which hotel it opens. The thumbnail's <code>alt="hotel image"</code> is read on every card and adds nothing.</p>
    <ada-code tone="bad" caption="Production — partials/hotel_results.plush.html:39" :code="C.cardBad" />
    <sr-output before="hotel image, image … Choose Room, link" after="The Minuteman Inn, image … Choose Room at The Minuteman Inn, link" />
    <agent-check agent="link-checker" verdict="refines" rule="WCAG 2.4.4 Link Purpose: repeated identical link text to different destinations must be disambiguated.">
      <p>Agrees with the fix. The criterion that actually applies is <strong>2.4.4 Link Purpose</strong> (and <strong>1.1.1</strong> for the alt text), not 2.4.6 as the ticket lists. If the design needs the short visible label, keep "Choose Room" and add the hotel name as visually hidden text. The visible text still starts the accessible name, which satisfies 2.5.3 (Option B).</p>
    </agent-check>
    <agent-check agent="alt-text-headings" verdict="refines" rule="Context decides the alt: don't repeat adjacent text; describe what's shown if it adds information.">
      <p>The hotel name already appears in the card heading next to the image, so <code>alt="&lt;%= hotel.Name %&gt;"</code> makes screen readers say it twice. Use <code>alt=""</code>, or describe the photo ("Lobby of The Minuteman Inn") if it carries information.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, FilterRail, PropertyNameField, StarRatingField, ExactMatchesField, SearchRadiusField, HotelCardReserve },
    setup: () => ({ ID, I: ITEMS, PRESTO, hotel, q: ref(''), stars: ref(0), exact: ref(false), radius: ref(5) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The presto-2026 Browse Hotels filter rail and result card. Press Tab through the filters and listen to what each control is called.">

  <ada-item v-bind="I.headings">
    <ada-before status="applies" source="presto-2026 Storybook › Browse Hotels / Filter Rail" :href="PRESTO.story('browse-hotels-components-left-rail-filter-rail--default')">
      <div style="max-width:280px"><filter-rail /></div>
      <template #notes>
        <p>Each filter section title is an <code>&lt;h3 class="fr__title"&gt;</code>, and each result card name is an <code>&lt;h3&gt;</code>. <code>HotelListPage.vue</code> has no <code>&lt;h1&gt;</code> or <code>&lt;h2&gt;</code>, so the page outline starts at level 3. The skip is smaller than production's (h3 instead of h5), but it's the same problem.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.labels">
    <ada-before status="partial" source="presto-2026 Storybook › Browse Hotels / Filter Rail" :href="PRESTO.story('browse-hotels-components-left-rail-filter-rail--default')">
      <div class="ada-row" style="align-items:flex-start">
        <div class="ada-mini-frame" style="width:260px"><property-name-field v-model="q" /></div>
        <div class="ada-mini-frame" style="width:260px"><star-rating-field v-model="stars" /></div>
        <div class="ada-mini-frame" style="width:260px"><exact-matches-field v-model="exact" /></div>
        <div class="ada-mini-frame" style="width:260px"><search-radius-field v-model="radius" /></div>
      </div>
      <template #notes>
        <p><strong>Already right:</strong> the Parent Brand, Amenities and Room Type checkboxes use <code>q-checkbox :label</code>, so each box has a name.</p>
        <p><strong>Still missing:</strong> the <code>&lt;h3&gt;</code> section titles aren't linked to their controls, and no group uses <code>fieldset</code>/<code>role="group"</code>. "Search by Property Name" and "Your Budget" rely on the placeholder alone. The radius <code>q-slider</code> has no name. The Exact Matches <code>q-toggle</code> has no label (its title is a separate heading). The star buttons are named only "1", "2"… plus the icon's ligature text, with no <code>aria-pressed</code>.</p>
        <p>Axe here flags the unnamed slider and toggle (this item). It also flags the dense <code>q-checkbox</code> hit areas as <code>target-size</code>, which is outside this ticket's scope.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.cards">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Listing Card / Book Reservations" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--fully-available')">
      <div style="max-width:1040px"><hotel-card-reserve v-bind="hotel" /></div>
      <template #notes>
        <p><strong>Still present:</strong> every card's CTA is the same <code>&lt;button&gt;Choose Your Room&lt;/button&gt;</code> (<code>HotelCardReserve.vue</code>, <code>ctaLabel</code>), with no hotel name in its accessible name.</p>
        <p><strong>Better:</strong> photo alt text comes from the imagery manifest (for example "Hotel lobby"), not a fixed "hotel image". It still doesn't name the hotel, though. The carousel arrows are labeled ("Previous photo" / "Next photo"), and the hotel name is a real <code>&lt;h3&gt;</code>.</p>
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
    setup: () => ({ ID, I: ITEMS, C, S, thumb, sort: ref('distance'), picks: ref([]) }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria, written in platform's Plush templates. The demos use native HTML controls, as platform's Bootstrap forms do.">

  <ada-item v-bind="I.headings">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add the page <h1> to results.plush.html" recommended :code="C.headGood">
        <div class="ada-mini-frame">
          <p class="ada-note" style="margin-bottom:4px">Rendered page title (level 1):</p>
          <p style="margin:0;font-size:24px;font-weight:700" aria-hidden="true">Available Hotels for Virginia International Youth Soccer Cup 2026</p>
          <p class="ada-sr-only">Demo only: shown as text so this story keeps a single h1.</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Also re-level the filter and result headings" :code="C.headOutline">
        <ol class="ada-mini-frame" style="margin:0;padding-left:28px;line-height:1.7">
          <li><strong>h1</strong> Available Hotels for …</li>
          <li><strong>h2</strong> Filter results <span class="ada-note">(groups use legend)</span></li>
          <li><strong>h2</strong> Results <span class="ada-note">(visually hidden)</span></li>
          <li><strong>h3</strong> The Minuteman Inn · <strong>h3</strong> Hotel 2 …</li>
        </ol>
        <template #why><p>With only the <code>&lt;h1&gt;</code>, the outline still jumps from 1 to 5. Re-leveling makes it h1 → h2 → h3, and the <code>.h5</code>/<code>.h6</code> utility classes keep the current look.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.labels">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="<label for> on every checkbox and select" recommended :code="C.labelGood">
        <div class="ada-stack ada-focus-demo">
          <div><input type="checkbox" id="ada-2932-a5" value="5" v-model="picks" /> <label for="ada-2932-a5">5 stars</label></div>
          <div><input type="checkbox" id="ada-2932-apool" value="pool" v-model="picks" /> <label for="ada-2932-apool">Pool</label></div>
          <div><label for="ada-2932-sort" style="display:block;font-weight:700;margin-bottom:4px">Sort by</label>
            <select id="ada-2932-sort" v-model="sort" :style="S.select"><option value="distance">Distance</option><option value="price">Price</option></select></div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Group each filter set in <fieldset> with a <legend>" :code="C.fieldset">
        <fieldset :style="S.fieldset" class="ada-focus-demo">
          <legend :style="S.legend">Star rating</legend>
          <div><input type="checkbox" id="ada-2932-b5" value="b5" v-model="picks" /> <label for="ada-2932-b5">5 stars</label></div>
          <div><input type="checkbox" id="ada-2932-b4" value="b4" v-model="picks" /> <label for="ada-2932-b4">4 stars</label></div>
          <div><input type="checkbox" id="ada-2932-b3" value="b3" v-model="picks" /> <label for="ada-2932-b3">3 stars</label></div>
        </fieldset>
        <template #why><p>The legend is announced when focus enters the group ("Star rating, group"), so "5 stars" makes sense on its own. It can also replace the <code>&lt;h5&gt;</code> group titles from item 1.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.cards">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="&quot;Choose Room at <hotel>&quot; and a real alt" recommended :code="C.cardGood">
        <article class="ada-mini-frame ada-focus-demo" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <img :src="thumb" alt="The Minuteman Inn" style="width:120px;height:80px;object-fit:cover;border-radius:4px" />
          <div>
            <h3 style="margin:0 0 6px;font-size:16px">The Minuteman Inn</h3>
            <a href="#choose-a" @click.prevent :style="S.btn">Choose Room at The Minuteman Inn</a>
          </div>
        </article>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="link-checker" title="Short visible label, hotel name as hidden text, decorative alt" :code="C.cardSr">
        <article class="ada-mini-frame ada-focus-demo" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <img :src="thumb" alt="" style="width:120px;height:80px;object-fit:cover;border-radius:4px" />
          <div>
            <h3 style="margin:0 0 6px;font-size:16px">The Minuteman Inn</h3>
            <a href="#choose-b" @click.prevent :style="S.btn">Choose Room<span class="ada-sr-only"> at The Minuteman Inn</span></a>
          </div>
        </article>
        <template #why><p>This keeps the compact button and still gives a unique link name ("Choose Room at The Minuteman Inn"). The visible words come first, so voice users can still say "click Choose Room". The empty alt avoids reading the name a second time next to the heading.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
