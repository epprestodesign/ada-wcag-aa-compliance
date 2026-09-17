// ENG-2944 · ADA-PLAT-MGMT-00 — Order Management master layout: missing
// <html lang>, no skip link / <main>, untitled GTM noscript iframe.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2944.linear.md?raw'
import PageFrame from '../../presto/components/PageFrame.vue'

export default {
  title: 'Epic 5 – platform Order Management/ADA-PLAT-MGMT-00 – Master Layout & Document Standards',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2944'),
}

const ID = 'ENG-2944'
const FILE = 'platform/app/templates/enduser/order_management_layout.plush.html'

const ITEMS = {
  lang: { n: 1, title: 'Root <html> has no lang attribute', wcag: ['3.1.1'], element: 'Document · <html>', where: `${FILE}:2` },
  skip: { n: 2, title: 'No skip-to-content link (and no <main> to target)', wcag: ['2.4.1'], element: 'Layout · header / body', where: FILE },
  gtm: { n: 3, title: 'GTM <noscript> iframe has no title', wcag: ['4.1.2'], element: 'Iframe · Google Tag Manager', where: `${FILE}:23` },
}

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Every Order Management page (reservations list, details, modification forms) renders inside this one Plush layout. Fixing these three document-level issues here fixes them on all of those pages.">

  <ada-item v-bind="I.lang">
    <p>With no <code>lang</code> on <code>&lt;html&gt;</code>, screen readers guess the language from the user's settings. A French-default reader will mispronounce the whole page, and browser translation and hyphenation can't rely on it either.</p>
    <ada-code tone="bad" caption="Production pattern — order_management_layout.plush.html:1-2" code='<!DOCTYPE html>
<html>          <!-- L2: no lang -->
  <head>…' />
    <agent-check agent="alt-text-headings" verdict="refines" rule="lang on <html> is mandatory (WCAG 3.1.1); use a correct BCP 47 code.">
      <p>Agrees. If platform ever serves a non-English locale, render the value from the request locale (e.g. <code>lang="&lt;%= locale %&gt;"</code>) instead of hard-coding <code>en</code>, or it becomes wrong for those pages.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.skip">
    <p>Keyboard users must tab through the whole header and nav on every Order Management page before reaching their reservation. There's no <code>&lt;main&gt;</code> landmark, so screen-reader users can't jump there either.</p>
    <ada-code tone="bad" caption="Production pattern — order_management_layout.plush.html (body)" code='<body>
  <%= partial("partials/gtm_noscript.html") %>
  <nav class="navbar">…</nav>
  <div class="container">
    <%= yield %>
  </div>
</body>' />
    <agent-check agent="keyboard-navigator" verdict="refines" rule="The skip link must be the first focusable element and target <main> with tabindex=&quot;-1&quot;.">
      <p>Agrees with the Linear fix. Also add <code>tabindex="-1"</code> to <code>&lt;main id="main-content"&gt;</code>, or some browsers scroll to it without moving keyboard focus. The skip link must come <em>before</em> the GTM noscript and the nav in source order.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.gtm">
    <p>The Google Tag Manager fallback iframe has no <code>title</code>, so automated checkers (axe <code>frame-title</code>) fail every page, and any AT that does expose it reads just "frame".</p>
    <ada-code tone="bad" caption="Production pattern — order_management_layout.plush.html:23" code='<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' />
    <agent-check agent="aria-specialist" verdict="refines" rule="Every frame needs an accessible name; hidden content (display:none) is already removed from the accessibility tree.">
      <p>Agrees with adding <code>title="Google Tag Manager"</code>. The real user impact is low, though: the iframe only renders with JavaScript off and is <code>display:none</code>, so AT never reaches it. The main win is a clean automated audit. Treat this as the smallest of the three.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, PageFrame },
    setup: () => ({ ID, I: ITEMS, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026's page shell is PageFrame (Global Nav + body slot + footer), plus the prototype's index.html. Press Tab in the frame below to see what a keyboard user reaches first.">

  <ada-item v-bind="I.lang">
    <ada-before status="resolved" source="presto-2026 prototype › index.html" :href="PRESTO.prototype">
      <ada-code tone="good" caption="presto-2026/prototype/index.html:2 (also prototype-mobile)" code='<html lang="en">' />
      <template #notes><p>Both prototype entry points declare <code>lang="en"</code>. Carry this into the platform layout.</p></template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.skip">
    <ada-before status="applies" source="presto-2026 Storybook › App Shell / Page Frame" :href="PRESTO.story('app-shell-page-frame--book-reservation')">
      <page-frame brand="Soccer League">
        <div style="padding:32px 24px;min-height:120px">
          <p style="margin:0;font-size:18px;font-weight:700">Your reservations</p>
          <p style="margin:6px 0 0;color:var(--ds-color-text-subtle)">Page body renders here.</p>
        </div>
      </page-frame>
      <template #notes>
        <p>PageFrame.vue:23-32 wraps the body slot in a plain <code>&lt;div class="pf__body"&gt;</code>, not <code>&lt;main&gt;</code>, and has no skip link. The first Tab stop is the Global Nav brand link (GlobalNav.vue:63). The prototype's <code>App.vue</code> doesn't add either one.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.gtm">
    <ada-before status="no-equivalent" source="presto-2026 prototype › index.html">
      <template #empty>presto-2026 loads no Google Tag Manager or other third-party iframe, so there's nothing to compare. When analytics are added, the noscript iframe needs a title (see Proposal).</template>
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
    setup: () => ({ ID, I: ITEMS }),
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in each item is the fix from Linear's acceptance criteria. All three are one-line edits to order_management_layout.plush.html.">

  <ada-item v-bind="I.lang">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add lang=&quot;en&quot; to <html> (L2)" recommended
        code='<!DOCTYPE html>
<html lang="en">' />
      <ada-option letter="B" origin="agent" agent="alt-text-headings" title="Render lang from the request locale"
        code='<html lang="<%= locale %>">   <!-- falls back to "en" in the action -->'>
        <template #why><p>Keeps 3.1.1 correct if Order Management is ever translated. With a single locale today, Option A is enough.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.skip">
    <ada-option letter="A" title="Skip link as the first child of <body>; wrap yield in <main id=&quot;main-content&quot;>" recommended lang="html"
      code='<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <%= partial("partials/gtm_noscript.html") %>
  <nav class="navbar">…</nav>
  <main id="main-content" tabindex="-1" class="container">
    <%= yield %>
  </main>
</body>

.skip-link { position:absolute; left:-9999px; }
.skip-link:focus { left:16px; top:16px; z-index:9999; }'>
      <div class="ada-mini-frame ada-focus-demo" style="position:relative;min-height:120px;padding-top:48px">
        <a href="#ada-2944-main" class="ada-skip-demo">Skip to main content</a>
        <p class="ada-note">Click here, then press <kbd>Tab</kbd>: the skip link appears first.</p>
        <nav aria-label="Demo order management header" class="ada-row" style="margin:8px 0">
          <a href="#ada-2944-n1" @click.prevent>EventPipe</a><a href="#ada-2944-n2" @click.prevent>My Reservations</a><a href="#ada-2944-n3" @click.prevent>Sign out</a>
        </nav>
        <main id="ada-2944-main" tabindex="-1" style="padding:8px;border:1px dashed #94A3B8">Your reservations (main content)</main>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.gtm">
    <ada-option letter="A" title="Add title=&quot;Google Tag Manager&quot; to the noscript iframe (L23)" recommended
      code='<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
  title="Google Tag Manager"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' />
  </ada-item>
</ada-issue>`,
  }),
}
