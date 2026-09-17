// ENG-2941 · ADA-PLAT-GRP-04 — Group Block held confirmation and submittal:
// success heading level, Copy Booking Link, new-tab links.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2941.linear.md?raw'
import ConfirmationPage from '../../presto/components/confirmation/ConfirmationPage.vue'
import { holdData } from '../../presto/stories/confirmation/ConfirmationPage.stories.js'

export default {
  title: 'Epic 3 – platform Group Block Flow/ADA-PLAT-GRP-04 – Held Confirmation and Submittal',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2941'),
}

const ID = 'ENG-2941'

const ITEMS = {
  heading: { n: 1, title: 'Success title is an <h6>', wcag: ['1.3.1', '2.4.6'], element: 'Page heading', where: 'platform/app/templates/enduser/group_blocks/show.plush.html:13' },
  copy: { n: 2, title: '"Copy Booking Link" is a dead href="#" anchor with no copy confirmation', wcag: ['4.1.2'], element: 'Action link · status message', where: 'group_blocks/show.plush.html:46-53' },
  newtab: { n: 3, title: '"Book in Block" and "Print" open a new tab without warning', wcag: ['4.1.2'], element: 'Links · target="_blank"', where: 'group_blocks/show.plush.html:44, :54 · printable.plush.html' },
}

const BOOK_URL = 'https://book.example.com/g/G-00584977'
const crop = 'max-height:360px;overflow:hidden;border-bottom:1px dashed var(--ds-color-border)'

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The page an organizer lands on after holding a block. Its title is buried in the outline, its copy action isn't a button, and two links open new tabs without saying so.">

  <ada-item v-bind="I.heading">
    <p>The success message is the page's main heading, but it's marked up as <code>&lt;h6&gt;</code>. Screen-reader users who jump to the first heading, or list headings, don't find the page title where they expect it.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:13 (reconstructed from Linear)" code='<h6 class="text-success">Success! Your Group Block is being held.</h6>' />
    <sr-output before="Heading level 6, Success! Your Group Block is being held." after="Heading level 1, Success! Your Group Block is being held." />
    <agent-check agent="alt-text-headings" verdict="refines" rule="Exactly one H1 per page; never pick a heading level for its visual size — use CSS.">
      <p>Agrees. Keep the current look with a class (<code>class="h6"</code>) instead of changing the design. Check the Buffalo layout doesn't already emit an <code>&lt;h1&gt;</code>, or the page will have two.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.copy">
    <p>"Copy Booking Link" is an <code>&lt;a href="#"&gt;</code> wired to a click handler. It's announced as a link, it adds <code>#</code> to the URL if the script fails, and nothing tells a screen-reader user the copy worked.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:46-53" code='<a href="#" class="btn btn-link copy-link"
   data-url="<%= bookingUrl %>">
  <i class="fa fa-copy"></i> Copy Booking Link
</a>' />
    <sr-output before="Copy Booking Link, link" after="Copy Booking Link, button … Link copied" />
    <agent-check agent="link-checker" verdict="agrees" rule="Links go somewhere; buttons perform an action. href=&quot;#&quot; used for an action should be a &lt;button&gt;.">
      <p>Confirmed: copying is an action, so <code>&lt;button type="button"&gt;</code>.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="refines" rule="The live region must exist on page load before its text changes; clear it after a short delay so a repeat copy is announced again.">
      <p>Agrees on <code>aria-live="polite"</code>. Render the empty region in the template, not with the message. Also handle a clipboard failure: announce it and show the link so it can be copied by hand (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.newtab">
    <p>Both links use <code>target="_blank"</code>. Users who can't see the tab strip lose their place and the Back button stops working, with no warning.</p>
    <ada-code tone="bad" caption="Production pattern — show.plush.html:44 and :54" code='<a href="<%= bookingUrl %>" target="_blank" class="btn btn-primary">Book in Block</a>
…
<a href="<%= printPath %>" target="_blank" class="btn btn-link">Print</a>' />
    <sr-output before="Book in Block, link" after="Book in Block (opens in new tab), link" />
    <agent-check agent="link-checker" verdict="refines" rule="Flag links that open a new window/tab without warning; warn with visible text, an aria-label, or visually hidden text.">
      <p>Agrees. If you use <code>aria-label</code>, it replaces the visible text, so it must start with the exact visible words ("Book in Block (opens in new tab)") to meet 2.5.3 Label in Name. A visually hidden span avoids that risk (Option B). Add <code>rel="noopener"</code> while you're there.</p>
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
    setup: () => ({ ID, I: ITEMS, PRESTO, holdData, crop }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="presto-2026's Group Block confirmation (ConfirmationPage, mode=&quot;hold&quot;). Frames are cropped to the success banner and summary header.">

  <ada-item v-bind="I.heading">
    <ada-before status="applies" source="presto-2026 Storybook › Confirmation / Group Block" :href="PRESTO.story('confirmation-group-block--page')">
      <div :style="crop"><confirmation-page mode="hold" :data="holdData" /></div>
      <template #notes>
        <p>Still wrong, in a different way. The success title is a <code>&lt;p class="conf__banner-title"&gt;</code> (<code>ConfirmationPage.vue:108</code>), not a heading at all, and the page has no <code>&lt;h1&gt;</code>. The first heading is the <code>&lt;h2&gt;</code> "Group Block Summary" (<code>:115</code>). <code>PageFrame</code> doesn't add one either.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.copy">
    <ada-before status="partial" source="presto-2026 Storybook › Confirmation / Group Block" :href="PRESTO.story('confirmation-group-block--page')">
      <div :style="crop"><confirmation-page mode="hold" :data="holdData" /></div>
      <template #notes>
        <p><strong>Already right:</strong> Copy Booking Link is a real <code>&lt;button type="button"&gt;</code> (<code>ConfirmationPage.vue:127</code>).</p>
        <p><strong>Still missing:</strong> it has no click handler yet (presentational), and the page has no live region, so there's no "Link copied" confirmation to announce.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.newtab">
    <ada-before status="partial" source="presto-2026 Storybook › Confirmation / Group Block" :href="PRESTO.story('confirmation-group-block--page')">
      <div :style="crop"><confirmation-page mode="hold" :data="holdData" /></div>
      <template #notes>
        <p><strong>Print is resolved:</strong> it's a button that calls <code>window.print()</code> (<code>:128</code>, <code>:81</code>), so no new tab.</p>
        <p><strong>Book in Block is open:</strong> it's a <code>&lt;button&gt;</code> with an <code>open_in_new</code> icon (<code>:126</code>). The icon promises a new tab, but it has no destination yet and no text warning. When it's wired up it should be a link that carries the warning from Option A.</p>
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
      const msgA = ref('')
      const msgB = ref('')
      const showUrl = ref(false)
      let tA, tB
      const say = (target, text, timer) => {
        target.value = text
        clearTimeout(timer)
        return setTimeout(() => { target.value = '' }, 4000)
      }
      const copyA = async () => {
        try { await navigator.clipboard.writeText(BOOK_URL); tA = say(msgA, 'Link copied', tA) }
        catch { tA = say(msgA, 'Link copied', tA) } // demo: announce either way
      }
      const copyB = async () => {
        try { await navigator.clipboard.writeText(BOOK_URL); showUrl.value = false; tB = say(msgB, 'Link copied', tB) }
        catch { showUrl.value = true; tB = say(msgB, 'Couldn\'t copy automatically. The link is shown below; select it to copy.', tB) }
      }
      return { ID, I: ITEMS, BOOK_URL, msgA, msgB, showUrl, copyA, copyB }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Press the copy buttons and watch the status text: that's what a screen reader announces.">

  <ada-item v-bind="I.heading">
    <ada-option letter="A" title="Change the success heading to <h1> (keep its look with a class)" recommended lang="html"
      code='<!-- show.plush.html:13 -->
<h1 class="h6 text-success">Success! Your Group Block is being held.</h1>'>
      <div class="ada-mini-frame">
        <h4 style="margin:0;font-size:18px;font-weight:800;color:var(--ds-palette-green-800)">Success! Your Group Block is being held.</h4>
        <p class="ada-note">In production this is the page's only <code>&lt;h1&gt;</code>. The demo uses a lower level to fit this page's outline.</p>
      </div>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.copy">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Real button + aria-live=&quot;polite&quot; &quot;Link copied&quot;" recommended lang="html"
        code='<button type="button" class="btn btn-link copy-link"
        data-url="<%= bookingUrl %>">
  <i class="fa fa-copy" aria-hidden="true"></i> Copy Booking Link
</button>
<span id="copy-status" class="sr-only" aria-live="polite"></span>

<script>
document.querySelector(".copy-link").addEventListener("click", async (e) => {
  await navigator.clipboard.writeText(e.currentTarget.dataset.url)
  const s = document.getElementById("copy-status")
  s.textContent = "Link copied"
  setTimeout(() => { s.textContent = "" }, 4000)
})
</script>'>
        <div class="ada-stack ada-focus-demo">
          <div class="ada-row" style="align-items:center">
            <q-btn outline color="primary" no-caps icon="content_copy" label="Copy Booking Link" @click="copyA" />
            <span aria-live="polite" style="font-weight:700;color:var(--ds-palette-green-800)">{{ msgA }}</span>
          </div>
          <p class="ada-note">The status is visible here so you can see it. In production it can be visually hidden.</p>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="live-region-controller" title="Handle clipboard failure: announce it and show the link" lang="html"
        code='try {
  await navigator.clipboard.writeText(url)
  status.textContent = "Link copied"
} catch {
  status.textContent =
    "Couldn&apos;t copy automatically. The link is shown below; select it to copy."
  fallback.hidden = false            // <input readonly value="…">
  fallback.querySelector("input").select()
}'>
        <div class="ada-stack ada-focus-demo">
          <q-btn outline color="primary" no-caps icon="content_copy" label="Copy Booking Link" style="justify-self:start" @click="copyB" />
          <p aria-live="polite" style="margin:0;min-height:20px;font-weight:700;color:var(--ds-palette-slate-800)">{{ msgB }}</p>
          <div v-if="showUrl" class="ada-stack" style="gap:4px">
            <label for="grp04-url" style="font-weight:600">Booking link</label>
            <input id="grp04-url" readonly :value="BOOK_URL" style="height:36px;border:1px solid var(--ds-palette-slate-500);border-radius:6px;padding:0 8px;font:inherit" />
          </div>
        </div>
        <template #why><p>The Clipboard API is blocked in some browsers, in embedded views and on plain http. Without a fallback the button silently does nothing. The same polite region reports the failure, and a labelled read-only field lets the organizer copy the link by hand.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.newtab">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label=&quot;… (opens in new tab)&quot; on every target=&quot;_blank&quot; link" recommended lang="html"
        code='<a href="<%= bookingUrl %>" target="_blank" rel="noopener"
   class="btn btn-primary"
   aria-label="Book in Block (opens in new tab)">Book in Block</a>

<a href="<%= printPath %>" target="_blank" rel="noopener"
   class="btn btn-link"
   aria-label="Print (opens in new tab)">Print</a>'>
        <div class="ada-row ada-focus-demo">
          <q-btn unelevated color="primary" no-caps href="#book-in-block" target="_blank" rel="noopener" label="Book in Block" aria-label="Book in Block (opens in new tab)" @click.prevent />
          <q-btn flat color="primary" no-caps href="#print" target="_blank" rel="noopener" label="Print" aria-label="Print (opens in new tab)" @click.prevent />
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="link-checker" title="Visible icon + visually hidden text instead of aria-label" lang="html"
        code='<a href="<%= bookingUrl %>" target="_blank" rel="noopener" class="btn btn-primary">
  Book in Block
  <i class="fa fa-external-link" aria-hidden="true"></i>
  <span class="sr-only">(opens in new tab)</span>
</a>'>
        <div class="ada-row ada-focus-demo">
          <a href="#book-in-block-b" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;font-weight:700" @click.prevent>
            Book in Block <q-icon name="open_in_new" size="16px" aria-hidden="true" /><span class="ada-sr-only">(opens in new tab)</span>
          </a>
        </div>
        <template #why><p>The name is built from the visible text, so it can't drift from the label (2.5.3), and sighted users get the icon cue too. For Print, presto-2026's <code>window.print()</code> button avoids the new tab altogether.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
