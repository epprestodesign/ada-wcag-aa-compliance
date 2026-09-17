// ENG-2929 · ADA-FUSE-07 — Reservation Confirmation Page: heading structure,
// confirmation code semantics, descriptive action names.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2929.linear.md?raw'
import ConfirmationPage from '../../presto/components/confirmation/ConfirmationPage.vue'
import { THREE_FEES, THREE_FEES_TOTAL } from '../../presto/stories/secondaryFeesFixture.js'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-07 – Reservation Confirmation Page',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2929'),
}

const ID = 'ENG-2929'

const ITEMS = {
  headings: { n: 1, title: 'No real headings anywhere on the confirmation page', wcag: ['1.3.1', '2.4.6'], element: 'Headings · page title + sections', where: 'ConfirmationView.vue:64-66, :73-75, :77-79, :93, :100, :162' },
  pipeId: { n: 2, title: 'Reservation Pipe ID isn’t identified as the confirmation code', wcag: ['1.3.1', '4.1.3'], element: 'Confirmation code · [data-test-id="pipeID"]', where: 'fuse/src/modules/reservation/views/ConfirmationView.vue ([data-test-id="pipeID"])' },
  actions: { n: 3, title: '“Print” and “Book Another Room” lack descriptive names', wcag: ['2.4.6', '4.1.2'], element: 'Buttons · page actions', where: 'fuse/src/modules/reservation/views/ConfirmationView.vue' },
}

// Single-stay sample — copied from ConfirmationPage.stories.js `reserveData`
// (that constant isn't exported), trimmed to two policies.
const reserveData = {
  contactName: 'Alex Smith',
  confirmationId: '72055771948934',
  reservedOn: 'Mon, 06/14/2027 02:14 PM EST',
  guest: 'Alex Smith — (555) 018-2245',
  email: 'youraccount@eventpipe.com',
  hotels: [{
    name: 'Days Inn by Wyndham Carson City',
    stars: 3, address: '4100 N Carson St, Carson City, NV, US, 89706', seed: 1,
    checkIn: 'Mon, 07/01/2027 03:00 PM', checkOut: 'Wed, 07/03/2027 11:00 AM',
    rooms: [{ type: 'Room, 1 Queen Bed, Non Smoking', note: '1 Queen Bed · Sleeps 2 · Breakfast included', nights: [
      { date: 'Mon, 07/01/2027', qty: 1, price: 128 },
      { date: 'Tue, 07/02/2027', qty: 1, price: 128 },
    ] }],
    totals: { taxes: 0, rooms: 1, secondaryFees: THREE_FEES, roomCost: 256, amountPaid: THREE_FEES_TOTAL, balanceDue: 256 },
  }],
  policies: [{ hotel: 'Days Inn by Wyndham Carson City', items: [
    { title: 'Cancellation Policy', body: 'A cancellation fee will not be charged if you cancel before Thu, 06/24/2027 at 4:00 PM. If you cancel after that, you agree to be charged a fee of $128.00.' },
    { title: 'Deposit', body: 'The full stay is charged to the card on file at booking. No additional deposit is collected at check-in.' },
  ] }],
}

const CODE = {
  headingsBad: `<div class="my-title">Your reservation is confirmed</div>   <!-- L64-66 -->
<div class="my-subtitle">Summary</div>                       <!-- L73-75 -->
<div class="hotel-name">{{ hotel.name }}</div>             <!-- L77-79 -->
<p class="bold-text">Booked rooms</p>                         <!-- L93 -->
<p class="bold-text">{{ room.name }}</p>                     <!-- L100 -->
…
<div class="my-subtitle">Support</div>                       <!-- L162 -->`,
  pipeBad: `<div data-test-id="pipeID">{{ reservation.pipeId }}</div>`,
  actionsBad: `<q-btn icon="print" label="Print" @click="print" />
<q-btn label="Book Another Room" :to="searchRoute" />`,
  prestoPipe: `<!-- presto-2026 ConfirmationPage.vue:108, :122 -->
<p class="conf__banner-title">{{ bannerTitle }}</p>          <!-- no h1, no status -->
…
<div class="conf__bookingid">{{ idLabel }} {{ bookingId }}</div>
<!-- "Confirmation # 72055771948934" — label and value in one div -->`,
  prestoActions: `<!-- presto-2026 ConfirmationPage.vue:111, :127-128 -->
<button class="conf__banner-cta">{{ bannerCta }}</button>     <!-- "Book Another Reservation" -->
<button class="conf__action"><q-icon name="content_copy" /> Copy Booking Link</button>
<button class="conf__action" @click="print"><q-icon name="print" /> Print</button>`,
  headingsFix: `<h1 class="my-title">Your reservation is confirmed</h1>
<h2 class="my-subtitle">Summary</h2>
  <h3 class="hotel-name">{{ hotel.name }}</h3>
    <h4 class="bold-text">Booked rooms</h4>
      <h5 class="bold-text">{{ room.name }}</h5>
<h2 class="my-subtitle">Support</h2>`,
  headingsList: `<h3>{{ hotel.name }}</h3>
<h4 id="booked-h">Booked rooms</h4>
<ul aria-labelledby="booked-h">
  <li v-for="room in rooms"><strong>{{ room.name }}</strong> · {{ room.dates }}</li>
</ul>`,
  pipeFix: `<div data-test-id="pipeID"
  aria-label="Your reservation confirmation code is 72055771948934">
  72055771948934
</div>`,
  pipeDl: `<h1 ref="title" tabindex="-1">Your reservation is confirmed</h1>
<dl class="booking-id">
  <dt>Confirmation code</dt>
  <dd data-test-id="pipeID">{{ reservation.pipeId }}</dd>
</dl>

onMounted(() => title.value.focus())  // SPA route change: announce the H1`,
  actionsFix: `<q-btn icon="print" label="Print"
  aria-label="Print reservation confirmation" @click="print" />
<q-btn label="Book Another Room"
  aria-label="Book another room for this event" :to="searchRoute" />`,
  actionsCopy: `<q-btn icon="content_copy" label="Copy Booking Link" @click="copy" />
<p role="status" class="sr-only">{{ copied ? 'Booking link copied' : '' }}</p>`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The last page of the booking flow. It's styled like a structured document, but screen-reader users get one flat run of text: no headings, no labeled confirmation code, and generic action buttons.">

  <ada-item v-bind="I.headings">
    <p>The page title, the "Summary" and "Support" section titles, the hotel name, "Booked rooms" and each room name are all styled <code>&lt;div&gt;</code>/<code>&lt;p&gt;</code>s. The view has no <code>&lt;h1&gt;</code>–<code>&lt;h3&gt;</code>, so heading navigation finds nothing. The "Support" subtitle at L162 is a second instance that the audit hadn't flagged before.</p>
    <ada-code tone="bad" caption="Production pattern — ConfirmationView.vue (copy text paraphrased)" :code="CODE.headingsBad" />
    <sr-output before="Headings list: empty" after="Headings: Your reservation is confirmed (1) · Summary (2) · Days Inn… (3) · Booked rooms (4) · Support (2)" />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Exactly one H1 per page; never skip levels; choose levels by structure, not appearance.">
      <p>Agrees. Linear leaves the hotel name as "<code>&lt;h2&gt;</code>/<code>&lt;h3&gt;</code> as appropriate" and "Booked rooms"/room names as "real headings". Nested under Summary (h2), that gives hotel = <strong>h3</strong>, Booked rooms = <strong>h4</strong>, room = <strong>h5</strong>. Five levels is deep for short labels. The per-room names can be list items under an h4 instead (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.pipeId">
    <p>The Pipe ID is the one thing the guest must keep. It's rendered in a plain <code>&lt;div&gt;</code>, and nothing in the markup marks it as the confirmation code, so screen-reader users hear a long number with no clear meaning.</p>
    <ada-code tone="bad" caption="Production — [data-test-id=&quot;pipeID&quot;]" :code="CODE.pipeBad" />
    <sr-output before="72055771948934" after="Confirmation code: 72055771948934" />
    <agent-check agent="aria-specialist" verdict="disagrees" rule="Do not use aria-label on headings, paragraphs or other content containers; prefer visible text (APG naming rules).">
      <p>ARIA 1.2 doesn't allow <code>aria-label</code> on a generic <code>&lt;div&gt;</code> (axe: <code>aria-prohibited-attr</code>). Many screen readers ignore it there, so Linear's fix may announce nothing new. Give the number a <strong>visible</strong> label in the markup, for example a <code>&lt;dl&gt;</code> "Confirmation code / 7205…". Sighted users benefit too.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="refines" rule="Live regions present at page load are not announced; for SPA route changes, move focus to the H1.">
      <p>The ticket lists 4.1.3, but a status region rendered with the page won't be read. Since this is a route change inside the SPA, focus the new <code>&lt;h1&gt;</code> (<code>tabindex="-1"</code>). The success message is then announced, and the labeled code is the next thing a screen reader reads.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.actions">
    <p>"Print" doesn't say what gets printed. Listed out of context (a screen reader's buttons list), it's ambiguous.</p>
    <ada-code tone="bad" caption="Production pattern — ConfirmationView.vue" :code="CODE.actionsBad" />
    <agent-check agent="aria-specialist" verdict="refines" rule="aria-label replaces the visible text; the name should include the visible label (WCAG 2.5.3 Label in Name).">
      <p>Agrees for "Print". Any <code>aria-label</code> must <em>start with</em> the visible words ("Print reservation confirmation", "Book another room…") so speech-control users can still say "click Print". "Book Another Room" is already fairly clear, so its label only needs extra context if there are several such buttons.</p>
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
    setup: () => ({ ID, I: ITEMS, PRESTO, CODE, reserveData }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026's confirmation screen already uses real h2/h3/h4 headings. It still has no h1, the room type isn't a heading, and its Print button is just as generic.">

  <ada-item v-bind="I.headings">
    <ada-before status="partial" source="presto-2026 Storybook › Confirmation / Single Reservation" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <div style="max-width:1040px"><confirmation-page mode="reserve" :data="reserveData" /></div>
      <template #notes>
        <p><strong>Right:</strong> "Reservation Summary" is an <code>&lt;h2&gt;</code> (<code>ConfirmationPage.vue:115</code>), the hotel name is an <code>&lt;h3&gt;</code> (<code>:153</code>), and the policies use <code>&lt;h3&gt;</code>/<code>&lt;h4&gt;</code>.</p>
        <p><strong>Still wrong:</strong> the page title "Success! Your reservation is confirmed." is a <code>&lt;p class="conf__banner-title"&gt;</code> (<code>:108</code>), so the page has <strong>no h1</strong> and the outline starts at h2. The room type (<code>:160</code>) is a styled <code>&lt;div&gt;</code>. presto has no "Booked rooms" or "Support" section.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.pipeId">
    <ada-before status="partial" source="presto-2026 › ConfirmationPage.vue (frame above)" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <ada-code tone="bad" :code="CODE.prestoPipe" />
      <template #notes>
        <p><strong>Better than production:</strong> the ID has visible label text ("Confirmation # 72055771948934"), so a screen reader does hear what it is.</p>
        <p><strong>Still missing:</strong> label and value share one <code>&lt;div&gt;</code> rather than a term/value pair. The success banner isn't a heading or a status, and nothing moves focus to it on arrival. Some screen readers read "#" as "number sign".</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.actions">
    <ada-before status="partial" source="presto-2026 › ConfirmationPage.vue (frame above)" :href="PRESTO.story('confirmation-book-reservation--single-reservation')">
      <ada-code tone="bad" :code="CODE.prestoActions" />
      <template #notes>
        <p><strong>Still generic:</strong> "Print" is named only "Print" (<code>:128</code>).</p>
        <p><strong>Already descriptive:</strong> "Book Another Reservation" and "Copy Booking Link" say what they do.</p>
        <p><strong>Related (4.1.3):</strong> "Copy Booking Link" gives no confirmation that anything was copied.</p>
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
    setup: () => {
      const titleEl = ref(null)
      const focusTitle = async () => { await nextTick(); titleEl.value?.focus() }
      const copied = ref('')
      const copy = () => { copied.value = ''; setTimeout(() => { copied.value = 'Booking link copied' }, 50) }
      return { ID, I: ITEMS, CODE, titleEl, focusTitle, copied, copy }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Heading levels inside the demos start at h2 or lower, because this Storybook page already has its own h1.">

  <ada-item v-bind="I.headings">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="h1 title, h2 Summary + Support, real headings for hotel, Booked rooms and rooms" recommended lang="vue" :code="CODE.headingsFix">
        <div class="ada-mini-frame">
          <p class="ada-note" style="margin-bottom:8px">Outline (levels shown as they'd be on the real page):</p>
          <ul style="margin:0;padding-left:0;list-style:none;line-height:1.7">
            <li><strong>h1</strong> Your reservation is confirmed</li>
            <li style="padding-left:16px"><strong>h2</strong> Summary</li>
            <li style="padding-left:32px"><strong>h3</strong> Days Inn by Wyndham Carson City</li>
            <li style="padding-left:48px"><strong>h4</strong> Booked rooms</li>
            <li style="padding-left:64px"><strong>h5</strong> Room, 1 Queen Bed, Non Smoking</li>
            <li style="padding-left:16px"><strong>h2</strong> Support</li>
          </ul>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Stop at h4: rooms as a labeled list" lang="vue" :code="CODE.headingsList">
        <section class="ada-mini-frame" aria-labelledby="eng2929-sum">
          <h2 id="eng2929-sum" style="margin:0 0 6px;font-size:18px">Summary</h2>
          <h3 style="margin:0 0 4px;font-size:16px">Days Inn by Wyndham Carson City</h3>
          <h4 id="eng2929-booked" style="margin:8px 0 4px;font-size:14px">Booked rooms</h4>
          <ul aria-labelledby="eng2929-booked" style="margin:0;padding-left:20px">
            <li><strong>Room, 1 Queen Bed, Non Smoking</strong> · Jul 1–3, 2027</li>
            <li><strong>Two-Room Suite King</strong> · Jul 1–2, 2027</li>
          </ul>
        </section>
        <template #why><p>Room names are short labels inside one section. A list announces how many rooms were booked ("list, 2 items") and keeps the heading outline shallow and easy to skim.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.pipeId">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label=&quot;Your reservation confirmation code is [ID]&quot; on the pipe-ID element" lang="vue" :code="CODE.pipeFix">
        <p class="ada-note">No live demo. On a plain <code>&lt;div&gt;</code> this <code>aria-label</code> is prohibited by ARIA 1.2 (axe <code>aria-prohibited-attr</code>) and ignored by many screen readers. It would need a role that allows a name, which the agent advises against. See Option B.</p>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" recommended title="Visible “Confirmation code” label in a <dl>, and focus the h1 on arrival" lang="vue" :code="CODE.pipeDl">
        <div class="ada-mini-frame ada-focus-demo">
          <h2 ref="titleEl" tabindex="-1" style="margin:0 0 8px;font-size:20px;color:#15803D">Your reservation is confirmed</h2>
          <dl style="margin:0;display:flex;gap:8px;align-items:baseline">
            <dt style="font-weight:600">Confirmation code</dt>
            <dd data-test-id="pipeID" style="margin:0;font-weight:800;font-size:18px;letter-spacing:.04em">72055771948934</dd>
          </dl>
          <q-btn flat dense no-caps color="primary" label="Simulate arrival (focus title)" style="margin-top:8px" @click="focusTitle" />
        </div>
        <sr-output after="Your reservation is confirmed, heading · Confirmation code: 72055771948934" />
        <template #why><p>Everyone sees and hears the same label, so there's no hidden string to keep in sync. Moving focus to the title on arrival covers 4.1.3: the success message is read first, and the code is next.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.actions">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Descriptive aria-labels on Print and Book Another Room" recommended lang="vue" :code="CODE.actionsFix">
        <div class="ada-row ada-focus-demo">
          <q-btn outline color="primary" no-caps icon="print" label="Print" aria-label="Print reservation confirmation" />
          <q-btn unelevated color="primary" no-caps label="Book Another Room" aria-label="Book another room for this event" />
        </div>
        <sr-output after="Print reservation confirmation, button · Book another room for this event, button" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="Confirm “Copy Booking Link” with a polite status" lang="vue" :code="CODE.actionsCopy">
        <div class="ada-row ada-focus-demo" style="align-items:center">
          <q-btn outline color="primary" no-caps icon="content_copy" label="Copy Booking Link" @click="copy" />
          <p role="status" style="margin:0;color:#15803D;font-weight:600">{{ copied }}</p>
        </div>
        <template #why><p>presto-2026 already has this button. Without a status message, a screen-reader user can't tell the copy worked. A short polite message fixes that without moving focus.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
