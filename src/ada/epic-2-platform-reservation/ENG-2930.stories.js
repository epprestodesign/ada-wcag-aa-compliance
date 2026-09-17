// ENG-2930 · ADA-PLAT-RES-00 — Global layout, master navigation & CSS palette
// (platform, Go/Plush server-rendered): page language, skip link + <main>,
// failing palette tokens, "Contact Us" dropdown toggle, global focus ring.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2930.linear.md?raw'
import GlobalNav from '../../presto/components/GlobalNav.vue'
import PageFrame from '../../presto/components/PageFrame.vue'
import HotelCardReserve from '../../presto/components/browse/HotelCardReserve.vue'
import { sampleRooms } from '../../presto/stories/browse/_rooms-sample.js'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-00 – Global Layout, Navigation & Palette',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2930'),
}

const ID = 'ENG-2930'

const ITEMS = {
  lang: { n: 1, title: 'Root <html> has no lang attribute', wcag: ['3.1.1'], element: 'Document · <html>', where: 'platform/app/templates/enduser/layout.plush.html:2' },
  skip: { n: 2, title: 'No skip link and no <main> landmark', wcag: ['2.4.1'], element: 'Layout shell · landmarks', where: 'platform/app/templates/enduser/layout.plush.html:2 (no <main> anywhere)' },
  palette: { n: 3, title: 'Three palette tokens fail contrast (3.12, 2.04, 2.91:1)', wcag: ['1.4.3'], element: 'Color tokens · SCSS variables', where: 'platform/app/assets/css/base/_variables.scss' },
  contact: { n: 4, title: '"Contact Us" dropdown toggle is an <a> with no href or button role', wcag: ['4.1.2'], element: 'Header nav · dropdown toggle', where: 'platform/app/templates/enduser/partials/navigation.plush.html:23' },
  focus: { n: 5, title: 'No global :focus-visible rule anywhere in platform CSS', wcag: ['2.4.7'], element: 'Global CSS · all interactive controls', where: 'platform CSS — no custom.scss; needs a new partial in the end_user.scss import chain' },
}

const C = {
  langBad: `<!-- layout.plush.html:1-2 -->
<!DOCTYPE html>
<html class="h-100">`,
  langGood: `<!DOCTYPE html>
<html class="h-100" lang="en">`,
  skipBad: `<body class="d-flex flex-column h-100">
  <%= partial("partials/navigation.html") %>
  <%= yield %>              <!-- no <main>, no skip link -->
  <%= partial("partials/footer.html") %>
</body>`,
  skipGood: `<body class="d-flex flex-column h-100">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <%= partial("partials/navigation.html") %>
  <main id="main-content" tabindex="-1">
    <%= yield %>
  </main>
  <%= partial("partials/footer.html") %>
</body>

// base/_a11y.scss
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 1rem; top: 1rem; z-index: 1080; }`,
  paletteBad: `// base/_variables.scss (values per Linear)
--secondary-text-color: #8C92A0;  // 3.12:1 on white
--yellow-color:         #FFA000;  // 2.04:1 on white
--text-color-danger:    #F86969;  // 2.91:1 on white`,
  paletteGood: `// base/_variables.scss
--secondary-text-color: #596070;  // 6.30:1
--yellow-color:         #8F5200;  // 6.22:1
--text-color-danger:    #C81E1E;  // 5.74:1`,
  paletteTokens: `// base/_variables.scss — aligned to Presto DS palette
--secondary-text-color: #475569;  // slate-600  7.58:1  (= --ds-color-text-subtle)
--yellow-color:         #92400E;  // amber-800  7.09:1
--text-color-danger:    #B91C1C;  // red-700    6.47:1

// If --yellow-color is also used as a FILL behind dark text,
// keep #FFA000 there (#212529 on #FFA000 = 7.55:1) and split
// the token: --warning-fill vs --warning-text.`,
  contactBad: `<!-- partials/navigation.plush.html:23 -->
<a data-toggle="dropdown" class="btn btn-link ...">Contact Us</a>`,
  contactGood: `<button type="button" class="btn btn-link dropdown-toggle"
        data-toggle="dropdown"
        aria-haspopup="true" aria-expanded="false">
  Contact Us
</button>
<div class="dropdown-menu dropdown-menu-right">…</div>`,
  contactDisclosure: `<button type="button" class="btn btn-link"
        aria-expanded="false" aria-controls="contact-panel"
        data-toggle="collapse" data-target="#contact-panel">
  Contact Us
</button>
<div id="contact-panel" class="collapse contact-panel">
  <h2 class="h6">EventPipe Travel</h2>
  <p>Mon–Fri, 8:30am–5:30pm ET</p>
  <a href="tel:8886406400">(888) 640-6400</a>
</div>`,
  focusGood: `// app/assets/css/base/_focus.scss  (new)
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

// end_user.scss
@import "base/variables";
@import "base/focus";   // add to the import chain`,
}

// Inline demo button styles (Bootstrap-like btn / btn-outline in Presto navy).
const S = {
  toggle: 'font:inherit;font-weight:700;color:#01113E;background:#fff;border:1px solid #01113E;border-radius:4px;padding:8px 14px;cursor:pointer',
  btn: 'font:inherit;font-weight:700;color:#fff;background:#01113E;border:0;border-radius:4px;padding:9px 16px;cursor:pointer',
}

const hotel = {
  name: 'The Minuteman Inn', city: 'Acton', stars: 2.5, distance: '3.48 miles from Acton Boxborough',
  preferred: true, refundable: true, fromNightly: 100, total: 400, rooms: sampleRooms,
  imageCategories: ['exterior', 'lobby', 'rooms'], seed: 1, availability: 'unmatched',
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Five layout-level problems in platform's end-user layout and stylesheet. Every Reservation Flow page inherits them, so fixing them here fixes them everywhere.">

  <ada-item v-bind="I.lang">
    <p>With no <code>lang</code>, screen readers guess the page language from user settings. A French or Spanish voice may read the English page with the wrong pronunciation.</p>
    <ada-code tone="bad" caption="Production — layout.plush.html:2" :code="C.langBad" />
    <sr-output before="(voice picked from the user's default language)" after="(English voice, correct pronunciation)" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Landmarks and page language: the root <html> must carry a valid BCP 47 lang value.">
      <p>Confirmed. <code>lang="en"</code> is enough today. If platform ever localizes, set it from the request locale instead of hard-coding it.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.skip">
    <p>Keyboard users must Tab through the whole header on every page. There's also no <code>&lt;main&gt;</code> for a skip link to target, so both have to be added together.</p>
    <ada-code tone="bad" caption="Production pattern — layout.plush.html body (per Linear)" lang="html" :code="C.skipBad" />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="Skip link must be the first focusable element and link to <main> with tabindex=&quot;-1&quot;.">
      <p>Agrees. Add <code>tabindex="-1"</code> to <code>&lt;main id="main-content"&gt;</code>. Without it, some browsers scroll to the target but leave focus in the header.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.palette">
    <div class="ada-contrast-grid">
      <contrast-pair fg="#8C92A0" label="--secondary-text-color on white" />
      <contrast-pair fg="#FFA000" label="--yellow-color on white" />
      <contrast-pair fg="#F86969" label="--text-color-danger on white" />
    </div>
    <ada-code tone="bad" caption="Production — base/_variables.scss" lang="scss" :code="C.paletteBad" />
    <agent-check agent="contrast-master" verdict="agrees" rule="Normal text needs 4.5:1; recompute every pair.">
      <p>Recomputed: 3.12, 2.04 and 2.91:1, which matches Linear. All three proposed colors pass: <code>#596070</code> 6.30:1, <code>#8F5200</code> 6.22:1, <code>#C81E1E</code> 5.74:1.</p>
    </agent-check>
    <agent-check agent="design-system-auditor" verdict="refines" rule="Validate contrast at the token source, and check every role a token plays (text vs fill).">
      <p>Check where <code>--yellow-color</code> is used before darkening it. As a <em>fill</em> behind dark text, <code>#FFA000</code> already passes (7.55:1 with <code>#212529</code>), and <code>#8F5200</code> would fail there with dark text. Split it into a text token and a fill token. Also, each proposal is close to an existing Presto palette step (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.contact">
    <p>An <code>&lt;a&gt;</code> without <code>href</code> can't get keyboard focus and has no role, so keyboard and screen-reader users can't find or open the contact menu.</p>
    <ada-code tone="bad" caption="Production — navigation.plush.html:23" :code="C.contactBad" />
    <sr-output before="(skipped — not focusable, no role)" after="Contact Us, button, collapsed" />
    <agent-check agent="aria-specialist" verdict="agrees" rule="First rule of ARIA: use a native <button> before adding roles.">
      <p>Confirmed. Bootstrap 4's dropdown plugin updates <code>aria-expanded</code> on the toggle by itself, so the markup only needs a correct starting value.</p>
    </agent-check>
    <agent-check agent="aria-specialist" verdict="refines" rule="Incorrect ARIA is worse than no ARIA; aria-haspopup=&quot;true&quot; announces a menu.">
      <p><code>aria-haspopup="true"</code> means "opens a menu". If the dropdown holds contact details (hours, phone, email) rather than menu items, use a disclosure (<code>aria-expanded</code> + <code>aria-controls</code>, no <code>aria-haspopup</code>). Otherwise screen readers announce a menu and users expect arrow-key navigation that isn't there. See Option B.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.focus">
    <p>Nothing in platform's CSS defines a focus style, and there's no <code>custom.scss</code> to put one in. The fix is a new partial added to <code>end_user.scss</code>'s import chain.</p>
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Every focusable element needs a visible focus indicator.">
      <p>Confirmed.</p>
    </agent-check>
    <agent-check agent="design-system-auditor" verdict="refines" rule="Focus indicators need 3:1 against adjacent colors (WCAG 2.4.11 / 2.4.13).">
      <p>A <code>var(--primary-color)</code> ring only passes while the primary color is dark. Check the ring against the header and button fills. Also make sure Bootstrap's <code>.btn:focus { box-shadow }</code> doesn't hide the new outline.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, GlobalNav, PageFrame, HotelCardReserve },
    setup: () => ({ ID, I: ITEMS, PRESTO, hotel }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same layout foundations in the presto-2026 redesign. Press Tab through each frame to see what keyboard users see.">

  <ada-item v-bind="I.lang">
    <ada-before status="resolved" source="presto-2026 prototype › index.html" :href="PRESTO.prototype">
      <ada-code tone="good" caption="presto-2026/prototype/index.html:2" code='<html lang="en">' />
      <template #notes><p>The redesign's HTML shell already declares <code>lang="en"</code>. Carry this over when platform adopts it.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.skip">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Page Frame" :href="PRESTO.story('app-shell-page-frame--book-reservation')">
      <page-frame brand="Soccer League">
        <div style="padding:24px"><p class="ada-note">Page content renders here, inside &lt;div class="pf__body"&gt;.</p></div>
      </page-frame>
      <template #notes>
        <p><code>PageFrame.vue</code> wraps content in <code>&lt;div class="pf__body"&gt;</code>, not <code>&lt;main&gt;</code>. There's no skip link in <code>GlobalNav.vue</code>, <code>PageFrame.vue</code>, or <code>prototype/src/App.vue</code>, so the first Tab stop is the brand link.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.palette">
    <ada-before status="partial" source="presto-2026 Storybook › Hotel Listing Card (Doesn't Match Filters)" :href="PRESTO.story('browse-hotels-components-results-hotel-listing-card-horizontal-book-reservations--doesnt-match-filters')">
      <div class="ada-contrast-grid">
        <contrast-pair fg="#475569" label="--ds-color-text-subtle (slate-600)" />
        <contrast-pair fg="#DC2626" label="--ds-color-text-danger (red-600)" />
        <contrast-pair fg="#A16207" label="--ds-color-text-warning (yellow-700)" />
        <contrast-pair fg="#EA580C" label="--ds-palette-orange-600 used as warning text" />
      </div>
      <div style="max-width:1040px;margin-top:12px"><hotel-card-reserve v-bind="hotel" /></div>
      <template #notes>
        <p><strong>Resolved at the token level:</strong> presto's semantic text tokens for secondary text, danger and warning all pass (7.58, 4.83 and 4.92:1).</p>
        <p><strong>Still present:</strong> components skip the warning token and use the raw palette color <code>--ds-palette-orange-600</code> (3.56:1). You can see it in the card's "Adjust your search parameters" status (<code>HotelCardReserve.vue:155</code>) and in the "only N left" room counts (<code>RoomCardReserve.vue:90</code>).</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.contact">
    <ada-before status="partial" source="presto-2026 Storybook › App Shell / Global Nav" :href="PRESTO.story('app-shell-global-nav-cart-book-reservation--reserve-cart')">
      <global-nav brand="Soccer League" />
      <template #notes>
        <p>"Contact Us" is <code>&lt;a class="gnav__contact" href="#"&gt;</code> with a <code>q-menu</code> inside (<code>GlobalNav.vue</code>). Because it has an <code>href</code>, it can be focused and opened with Enter. Quasar also adds <code>aria-expanded</code> to it at runtime.</p>
        <p>It's still announced as a <em>link</em> that goes to <code>#</code>, has no <code>aria-controls</code>, and Space doesn't open it. The mobile hamburger is already a real <code>&lt;button aria-label="Menu"&gt;</code>.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Global Nav" :href="PRESTO.story('app-shell-global-nav-cart-book-reservation--reserve-cart')">
      <global-nav brand="Soccer League" />
      <template #notes>
        <p>There's no <code>:focus-visible</code> rule anywhere in <code>src/css/*</code>, the same gap ENG-2922 item 1 found. Native buttons like <strong>Manage Booking</strong> still get the browser's default ring. Quasar controls (inputs, checkboxes, <code>q-btn</code>) only show the faint <code>.q-focus-helper</code> tint.</p>
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
      const menuOpen = ref(false)
      const panelOpen = ref(false)
      return { ID, I: ITEMS, C, S, menuOpen, panelOpen }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria, written in platform's Plush and SCSS. Press Tab through the demos to check them.">

  <ada-item v-bind="I.lang">
    <ada-option letter="A" title="Add lang=&quot;en&quot; to the root element" recommended lang="html" :code="C.langGood" />
  </ada-item>

  <ada-item v-bind="I.skip">
    <ada-option letter="A" title="Skip link plus <main id=&quot;main-content&quot;> around yield" recommended lang="html" :code="C.skipGood">
      <div class="ada-mini-frame ada-focus-demo" style="position:relative;min-height:120px;padding-top:48px">
        <a href="#ada-2930-main" class="ada-skip-demo">Skip to main content</a>
        <p class="ada-note">Click here, then press <kbd>Tab</kbd>: the skip link appears first.</p>
        <nav aria-label="Demo header" class="ada-row" style="margin:8px 0"><a href="#brand" @click.prevent>Event home</a><a href="#manage" @click.prevent>Manage Booking</a></nav>
        <main id="ada-2930-main" tabindex="-1" style="padding:8px;border:1px dashed #94A3B8">Main content (the output of <code>&lt;%= yield %&gt;</code>)</main>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.palette">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Darken the three tokens to Linear's values" recommended lang="scss" :code="C.paletteGood">
        <div class="ada-stack">
          <contrast-pair fg="#596070" label="--secondary-text-color" />
          <contrast-pair fg="#8F5200" label="--yellow-color" />
          <contrast-pair fg="#C81E1E" label="--text-color-danger" />
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="design-system-auditor" title="Map to the nearest Presto palette steps, and split text vs fill" lang="scss" :code="C.paletteTokens">
        <div class="ada-stack">
          <contrast-pair fg="#475569" label="slate-600 (Presto text-subtle)" />
          <contrast-pair fg="#92400E" label="amber-800" />
          <contrast-pair fg="#B91C1C" label="red-700" />
        </div>
        <template #why><p>These are the closest Presto steps, so platform and presto-2026 share one palette, and each has more margin than Linear's values. Keeping a separate fill token stops the darker yellow from breaking any badge or banner that puts dark text on it.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.contact">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Real <button> with aria-haspopup and aria-expanded" recommended lang="html" :code="C.contactGood">
        <div class="ada-focus-demo" style="position:relative">
          <button type="button" :style="S.toggle" aria-haspopup="true" :aria-expanded="String(menuOpen)" @click="menuOpen = !menuOpen">Contact Us ▾</button>
          <div v-show="menuOpen" class="ada-mini-frame" style="margin-top:6px;max-width:280px">
            <p style="margin:0 0 4px"><strong>EventPipe Travel</strong></p>
            <p class="ada-note">Mon–Fri, 8:30am–5:30pm ET</p>
            <a href="#contact-phone" @click.prevent>(888) 640-6400</a>
          </div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Disclosure pattern (no aria-haspopup) for a contact-info panel" lang="html" :code="C.contactDisclosure">
        <div class="ada-focus-demo">
          <button type="button" :style="S.toggle" aria-controls="ada-2930-contact" :aria-expanded="String(panelOpen)" @click="panelOpen = !panelOpen">Contact Us ▾</button>
          <div id="ada-2930-contact" v-show="panelOpen" class="ada-mini-frame" style="margin-top:6px;max-width:280px">
            <p style="margin:0 0 4px"><strong>EventPipe Travel</strong></p>
            <p class="ada-note">Mon–Fri, 8:30am–5:30pm ET</p>
            <a href="#contact-phone-b" @click.prevent>(888) 640-6400</a>
          </div>
        </div>
        <template #why><p>The panel holds text and links, not menu items. A disclosure is announced as "Contact Us, button, collapsed", and Tab moves straight into the panel. There's no promise of arrow-key menu navigation the panel can't keep.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.focus">
    <ada-option letter="A" title="New base/_focus.scss imported by end_user.scss" recommended lang="scss" :code="C.focusGood">
      <div class="ada-row ada-focus-demo">
        <button type="button" :style="S.btn">Search hotels</button>
        <button type="button" :style="S.toggle">Manage Booking</button>
        <a href="#privacy" @click.prevent>Privacy policy</a>
      </div>
    </ada-option>
  </ada-item>
</ada-issue>
`,
  }),
}
