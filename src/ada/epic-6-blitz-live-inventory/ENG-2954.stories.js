// ENG-2954 · ADA-BLITZ-RES-05 — Live-inventory price breakdown, hotel
// policies and footer: info-icon buttons, subtext contrast, section headings,
// v-html sanitization (security, not WCAG), external link + logo alt.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2954.linear.md?raw'
import CartReview from '../../presto/components/CartReview.vue'
import PoliciesSection from '../../presto/components/details/PoliciesSection.vue'
import PageFrame from '../../presto/components/PageFrame.vue'
import { ONE_FEE } from '../../presto/stories/secondaryFeesFixture.js'
import epLogo from '../../presto/assets/eventpipe logos/eventpipe-logo.svg'

export default {
  title: 'Epic 6 – blitz Live Inventory/ADA-BLITZ-RES-05 – Price Breakdown, Policies & Footer',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2954'),
}

const ID = 'ENG-2954'
const DIR = 'blitz/src/modules/reservation/components'

const ITEMS = {
  price: { n: 1, title: 'Price details: info icons, subtext contrast, section titles', wcag: ['2.1.1', '1.4.13', '1.4.3', '1.3.1', '2.4.6'], element: 'Tooltip triggers · subtext color · headings', where: `${DIR}/PriceDetails.vue:30, :43-47, :68-72, :115, :142, :183-186` },
  policies: { n: 2, title: 'Hotel policy section headers are divs', wcag: ['1.3.1', '2.4.6'], element: 'Section headings', where: `${DIR}/HotelPolicies.vue:38, 57, 60, 68, 73, 79, 91, 99, 114, 122, 129` },
  vhtml: { n: '2b', title: 'v-html injects supplier/CMS text without sanitization', wcag: [], state: 'new', element: 'Security · v-html', where: `${DIR}/HotelPolicies.vue:94, :102, :117, :125` },
  footer: { n: 3, title: 'Footer: new-tab privacy link and inaccurate logo alt', wcag: ['2.4.4', '1.1.1'], element: 'Footer · link + logo', where: `${DIR}/PrestoFooter.vue:11, :15` },
}

// Reservation summary — the presto-2026 Reservation Summary story's cart (one fee).
const cart = {
  hotelName: 'Quality Suites Hotel', imageCategories: ['suites', 'rooms'], seed: 3,
  roomType: 'Two Queen Beds — Accessible, Non Smoking', bedConfig: '2 Queen Beds', sleeps: 4,
  checkIn: { date: '05/31/2027', time: '3:00pm' }, checkOut: { date: '06/04/2027', time: '11:00am' }, nights: 4,
  priceDetails: {
    nights: 4, rooms: 1, rate: 100, subtotal: 420,
    lines: [
      { label: 'Check In', value: 'Mon, 5/31/2027', text: true },
      { label: 'Check Out', value: 'Fri, 6/4/2027', text: true },
      { label: 'Mon, 5/31/2027', value: 100 }, { label: 'Tue, 6/1/2027', value: 100 },
      { label: 'Wed, 6/2/2027', value: 100 }, { label: 'Thu, 6/3/2027', value: 100 },
      { label: 'Taxes', value: 0 },
    ],
    secondaryFees: ONE_FEE,
    subtotals: [{ label: 'Room Cost', value: 420 }, { label: 'Due Today', value: ONE_FEE[0].total }],
    balanceDue: 420,
  },
}

// Policies — from the presto-2026 Policies & Property story.
const policies = [
  { title: 'Check-in', body: 'Check-in from 3 PM – 2:00 AM' },
  { title: 'Check-out', body: 'Check-out before noon' },
  { title: 'Pets', body: 'Pets are not allowed, with the exception of service animals.' },
]

const CODE = {
  priceBad: `<!-- ${DIR}/PriceDetails.vue -->
<div class="section-title">Price Details</div>          <!-- :30 (also :115, :142) -->
<q-icon name="info">                                    <!-- :43-47, :68-72 -->
  <q-tooltip>Taxes and fees include…</q-tooltip>        <!-- not focusable -->
</q-icon>
.subtext { color: #8C92A0; }                            /* :183-186 → 3.12:1 */`,
  policiesBad: `<!-- ${DIR}/HotelPolicies.vue:38 (and 57, 60, 68, 73, 79, 91, 99, 114, 122, 129) -->
<div class="policy-header">Cancellation Policy</div>`,
  vhtmlBad: `<!-- ${DIR}/HotelPolicies.vue:94 (also :102, :117, :125) -->
<div v-html="policy.description" />   <!-- supplier / CMS text, not sanitized here -->`,
  footerBad: `<!-- ${DIR}/PrestoFooter.vue -->
<img :src="logo" alt="Housing Company logo" />                 <!-- :11 -->
<a :href="privacyUrl" target="_blank">Privacy Policy</a>        <!-- :15 -->`,
  priceA: `<h2 class="section-title">Price details</h2>
<span>Taxes &amp; fees
  <q-btn flat round dense size="sm" icon="info"
         aria-label="About taxes and fees">
    <q-tooltip>Taxes and fees include…</q-tooltip>
  </q-btn>
</span>
.subtext { color: #59606E; }   /* 6.32:1, same value as ENG-2949's secondary */`,
  priceB: `<q-btn flat round dense size="sm" icon="info" aria-label="About taxes and fees">
  <q-menu anchor="top middle" self="bottom middle">
    <div class="q-pa-sm" style="max-width:280px">Taxes and fees include…</div>
  </q-menu>
</q-btn>`,
  policiesA: `<h3 class="policy-header">Cancellation Policy</h3>
<div class="policy-body" v-html="safe(policy.description)" />`,
  vhtmlA: `// npm i dompurify
import DOMPurify from 'dompurify'

const ALLOWED = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h3', 'h4'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
}
const safe = (html) => DOMPurify.sanitize(html ?? '', ALLOWED)

<!-- HotelPolicies.vue:94, :102, :117, :125 -->
<div v-html="safe(policy.description)" />

// Or: document where upstream (API / CMS) already sanitizes this field,
// and add a test that a <script> or onerror payload is stripped.`,
  widgetBad: `const highlight = (text) => {
  …
  return text.replace(new RegExp(\`(\${esc})\`, 'gi'), '<strong>$1</strong>')
}

<span v-html="highlight(t)" />   <!-- t = team name, not escaped first -->`,
  footerA: `<img :src="company.logo" :alt="company.name" />
<a :href="privacyUrl" target="_blank" rel="noopener noreferrer">
  Privacy Policy
  <q-icon name="open_in_new" aria-hidden="true" />
  <span class="sr-only">(opens in a new tab)</span>
</a>`,
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd, CODE }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The price breakdown, hotel policies and footer on blitz's live-inventory reservation screens. Item 2b is a security finding that Linear raised alongside the accessibility work. It isn't a WCAG issue.">

  <ada-item v-bind="I.price">
    <p>Three problems in <code>PriceDetails.vue</code>. The ⓘ icons show their tooltip only on mouse hover, because a <code>&lt;q-icon&gt;</code> can't receive focus. The <code>.subtext</code> gray is too light. And the section titles look like headings but aren't.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.priceBad" />
    <contrast-pair fg="#8C92A0" bg="#FFFFFF" label=".subtext on white" sample="Includes taxes and fees" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Anything that reveals content must be reachable and operable by keyboard.">
      <p>Confirmed. Wrap each icon in a real button with an accessible name.</p>
    </agent-check>
    <agent-check agent="contrast-master" verdict="refines" rule="1.4.3: 4.5:1 for normal text; 1.4.13: hover or focus content must be dismissible, hoverable and persistent.">
      <p>3.12:1 is confirmed. Linear says to fix <code>.subtext</code> but doesn't give a color. <code>#59606E</code> (ENG-2949's secondary, 6.32:1) keeps both apps on one value. For 1.4.13: <code>QTooltip</code> in Quasar 2.19.3 (presto-2026's version) opens on mouse hover only and sets no <code>aria-describedby</code>; newer Quasar 2.x releases also open it on keyboard focus. Check blitz's Quasar version. If it's hover-only, give the button an <code>aria-describedby</code> hint or use a click-to-open note (Option B).</p>
    </agent-check>
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Visual section titles must be real headings.">
      <p>Confirmed for lines 30, 115 and 142.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.policies">
    <p>Every policy section header in <code>HotelPolicies.vue</code> is a styled <code>&lt;div&gt;</code>, so screen-reader users can't skim the policies by heading.</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.policiesBad" />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Heading levels follow the page outline without skipping.">
      <p>Agrees. Choose the level from where the component sits: under a "Policies" <code>&lt;h2&gt;</code>, each policy is an <code>&lt;h3&gt;</code>. If the injected HTML (item 2b) contains its own headings, they have to fit that outline too.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.vhtml">
    <p><strong>This is a security finding, not a WCAG one.</strong> Linear flags it here: "<code>v-html</code> blocks (94, 102, 117, 125) inject supplier/CMS text with no visible sanitization — a stored-XSS risk beyond the structure/contrast concern, if that content is ever attacker-influenced."</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.vhtmlBad" />
    <agent-check agent="accessibility-lead" verdict="agrees" rule="Findings outside accessibility scope are routed to their owning review.">
      <p>This is out of scope for the accessibility agents, so send it to security review. The accessibility link: the sanitizer allowlist must keep structural tags (<code>p</code>, <code>ul</code>/<code>li</code>, <code>strong</code>, <code>h3</code>/<code>h4</code>, <code>a</code>), or the fix will flatten the policy text and undo item 2.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.footer">
    <p>The privacy link opens a new tab with no warning and no <code>rel</code>. The logo's alt text is a placeholder that doesn't name the real company. The same alt bug is in <code>BookingsLookupView.vue:140</code> (ENG-2950 item 6).</p>
    <ada-code tone="bad" caption="Production" lang="vue" :code="CODE.footerBad" />
    <agent-check agent="link-checker" verdict="refines" rule="Links that open a new window or tab must say so.">
      <p>Agrees. <code>rel="noopener noreferrer"</code> is a security and performance fix, not an accessibility one. The WCAG part is the notice. Add a visible icon as well as the screen-reader text.</p>
    </agent-check>
    <agent-check agent="alt-text-headings" verdict="refines" rule="Logo alt text names the organization, without the word &quot;logo&quot;.">
      <p>Use the company's real name, for example <code>alt="EventPipe"</code>.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, CartReview, PoliciesSection, PageFrame },
    setup: () => ({ ID, I: ITEMS, PRESTO, cart, policies, CODE }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026 has the matching pieces: the reservation summary (price breakdown with ⓘ fee buttons), the property policies block and the shared footer.">

  <ada-item v-bind="I.price">
    <ada-before status="partial" source="presto-2026 Storybook › Reservation Summary › One Fee" :href="PRESTO.story('checkout-experience-components-reservation-summary--one-fee')">
      <div style="max-width:420px"><cart-review mode="reserve" :cart="cart" readonly cards :show-requests="false" /></div>
      <template #notes>
        <p><strong>Handled:</strong> in <code>CartReview.vue</code>, each ⓘ is a <code>&lt;button aria-label="About …"&gt;</code> wrapping the <code>q-tooltip</code> (lines 222, 244, 249), "Price details" is an <code>&lt;h4&gt;</code> (line 235).</p>
        <p><strong>Still present:</strong> the small "Rates are quoted in USD ($)." note, presto's equivalent of <code>.subtext</code>, uses <code>--ds-color-text-subtlest</code> (Slate 400, <code>CartReview.vue:457</code>) at <strong>2.56:1</strong>. Axe flags it in this frame. Separately, the checkout rail's <code>OrderSummary.vue:44</code> renders "Price details" as <code>&lt;div class="os__priceh"&gt;</code>, not a heading.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.policies">
    <ada-before status="partial" source="presto-2026 Storybook › Policies & Property › Policies" :href="PRESTO.story('hotel-details-components-policies-property--policies')">
      <div style="max-width:760px"><policies-section :policies="policies" /></div>
      <template #notes>
        <p><strong>Handled:</strong> each policy is a <code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code> pair (<code>PoliciesSection.vue:18-23</code>), so the title and body are linked.</p>
        <p><strong>Still present:</strong> the block's "Property Policies" title comes from <code>DsSectionHeader</code>, which renders <code>&lt;div class="text-h6"&gt;</code> (<code>DsSectionHeader.vue:11</code>), not a heading.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.vhtml">
    <ada-before status="partial" source="presto-2026 › PoliciesSection.vue / BookingWidget.vue">
      <ada-code tone="good" caption="presto-2026 — PoliciesSection.vue:21 (text interpolation is escaped)" lang="vue" code='<dd class="pol__body">{{ p.body }}</dd>' />
      <ada-code tone="bad" caption="presto-2026 — BookingWidget.vue:64-69, :179, :187" lang="vue" :code="CODE.widgetBad" />
      <template #notes>
        <p><strong>Handled:</strong> presto renders policy text with Vue text interpolation, which escapes HTML, so the policy block has no injection risk.</p>
        <p><strong>Related risk:</strong> <code>BookingWidget.vue</code> passes team names through <code>v-html</code> to highlight search matches, without escaping them first. If organizers can enter team names, that's the same stored-XSS pattern. (<code>DsUnsplashImage.vue:45</code> also uses <code>v-html</code>, but for attribution HTML built by <code>lib/unsplash.js</code>.)</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.footer">
    <ada-before status="resolved" source="presto-2026 Storybook › App Shell / Page Frame" :href="PRESTO.story('app-shell-page-frame--book-reservation')">
      <page-frame brand="Presto"><div style="padding:16px"><p style="margin:0">Page body</p></div></page-frame>
      <template #notes><p>The shared footer's logo is <code>alt="EventPipe"</code> (<code>PageFrame.vue:28</code>), which is accurate. "Terms · Privacy · Contact" is still plain text (line 29), not links, so the new-tab warning will be needed once those become links.</p></template>
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
    setup: () => ({ ID, I: ITEMS, CODE, epLogo, notice: ref('') }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Tab to the ⓘ buttons: Option A's button carries its hint through aria-describedby (presto's Quasar 2.19.3 tooltip opens on hover only), and Option B's note opens with Enter.">

  <ada-item v-bind="I.price">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Info icons in real buttons, darker subtext, real headings" recommended lang="vue" :code="CODE.priceA">
        <section class="ada-mini-frame ada-focus-demo" aria-labelledby="ada-2954-price-a" style="max-width:360px">
          <h2 id="ada-2954-price-a" style="margin:0 0 8px;font-size:18px;font-weight:700;line-height:1.3">Price details</h2>
          <div style="display:flex;justify-content:space-between;align-items:center"><span>4 nights × $100.00</span><span>$400.00</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="display:inline-flex;align-items:center;gap:2px">Taxes &amp; fees
              <q-btn flat round dense size="sm" icon="info" aria-label="About taxes and fees" aria-describedby="ada-2954-tax-hint">
                <q-tooltip anchor="top middle" self="bottom middle" max-width="260px">Taxes and fees are set by the hotel and collected at booking.</q-tooltip>
              </q-btn>
              <span id="ada-2954-tax-hint" class="ada-sr-only">Taxes and fees are set by the hotel and collected at booking.</span>
            </span>
            <span>$20.00</span>
          </div>
          <p style="margin:6px 0 0;color:#59606E;font-size:13px">Rates shown in USD. Includes all taxes and fees.</p>
        </section>
        <contrast-pair fg="#59606E" bg="#FFFFFF" label="Proposed .subtext" sample="Includes all taxes and fees" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Toggletip: open the note on click, not just hover" lang="vue" :code="CODE.priceB">
        <div class="ada-mini-frame ada-focus-demo" style="max-width:360px">
          <span style="display:inline-flex;align-items:center;gap:2px">Resort fee
            <q-btn flat round dense size="sm" icon="info" aria-label="About the resort fee">
              <q-menu anchor="top middle" self="bottom middle">
                <div style="max-width:260px;padding:8px 12px">$5 per room night, charged at booking.</div>
              </q-menu>
            </q-btn>
          </span>
        </div>
        <template #why><p>Hover tooltips don't work on touch screens, and they vanish when the pointer moves. A click-to-open note works for touch, mouse and keyboard, and stays open until the guest closes it (Esc or click outside).</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.policies">
    <ada-option letter="A" title="Policy section headers as real headings" recommended lang="vue" :code="CODE.policiesA">
      <section class="ada-mini-frame" aria-labelledby="ada-2954-pol" style="max-width:560px">
        <h2 id="ada-2954-pol" style="margin:0 0 8px;font-size:18px;font-weight:700;line-height:1.3">Hotel policies</h2>
        <h3 style="margin:8px 0 2px;font-size:15px;font-weight:700;line-height:1.3">Check-in</h3>
        <p style="margin:0">Check-in from 3 PM – 2:00 AM</p>
        <h3 style="margin:8px 0 2px;font-size:15px;font-weight:700;line-height:1.3">Cancellation Policy</h3>
        <p style="margin:0">Free cancellation up to 72 hours before arrival.</p>
      </section>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.vhtml">
    <ada-option letter="A" title="Sanitize v-html with DOMPurify, or confirm upstream sanitization" recommended lang="js" :code="CODE.vhtmlA">
      <p class="ada-note">Security fix, not WCAG. There's no live demo because DOMPurify isn't installed in this repo. The allowlist keeps the structural tags the policy text needs (see item 2).</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.footer">
    <ada-option letter="A" title="New-tab notice plus rel on the privacy link, and a real logo alt" recommended lang="vue" :code="CODE.footerA">
      <div class="ada-mini-frame ada-focus-demo ada-row" style="align-items:center;justify-content:space-between">
        <img :src="epLogo" alt="EventPipe" style="height:24px;display:block" />
        <a href="#privacy" style="display:inline-flex;align-items:center;gap:4px" @click.prevent="notice = 'Would open the privacy policy in a new tab.'">Privacy Policy <q-icon name="open_in_new" size="16px" aria-hidden="true" /><span class="ada-sr-only">(opens in a new tab)</span></a>
      </div>
      <p class="ada-note" role="status">{{ notice }}</p>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
