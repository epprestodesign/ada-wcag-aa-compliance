// ENG-2923 · ADA-FUSE-01 — Event Landing & Search Bar: hero contrast, logo/ad
// alt text, traveler stepper names, search validation, Registered Team popup.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, computed, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2923.linear.md?raw'
import LandingPage from '../../presto/components/LandingPage.vue'
import BookingWidget from '../../presto/components/BookingWidget.vue'
import DisplayAd from '../../presto/components/DisplayAd.vue'
import QuantityStepper from '../../presto/components/QuantityStepper.vue'
import defaultBg from '../../background-img/defaultBackgroundImage.png'

export default {
  title: 'Epic 1 – fuse/ADA-FUSE-01 – Event Landing & Search Bar',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2923'),
}

const ID = 'ENG-2923'

const ITEMS = {
  hero: { n: 1, title: 'Hero title and date have no permanent scrim (white on white)', wcag: ['1.4.3'], element: 'Hero banner · event title and date', where: 'fuse/src/modules/hotel/views/HomeView.vue:270-273' },
  alt: { n: 2, title: 'Generic logo/ad alt text, and ad links that can render without href', wcag: ['1.1.1', '2.4.4'], element: 'Images · event logo, display ads', where: 'fuse/src/modules/hotel/views/HomeView.vue:263-268 (logo alt), :307-313 (ad images)' },
  stepper: { n: 3, title: 'Traveler +/- buttons have no accessible name', wcag: ['4.1.2'], element: 'Icon-only buttons · traveler stepper', where: 'fuse/src/modules/hotel/components/search/TravelerSelect.vue:148-156,158-164,173-181,183-189' },
  validation: { n: 4, title: 'Registered Team error is silent; no aria-invalid or focus on submit', wcag: ['3.3.1', '3.3.3', '4.1.2'], element: 'Form fields · search validation', where: 'SearchBar.vue:97-105 (emitValues()) · RegistrationSelect.vue L304-311, L403-405 · BookingModeSelect.vue:73-84 · LocationSelect.vue:130-147' },
  popup: { n: 5, title: 'Registered Team popup: 200+ ungrouped checkboxes, no selection count', wcag: ['1.3.1', '4.1.3'], state: 'new', element: 'Checkbox list popup', where: 'fuse/src/modules/hotel/components/search/RegistrationSelect.vue (200+ item checkbox popup)' },
}

// Sample teams — the same club/team names the presto-2026 Booking Widget uses.
const CLUBS = [
  { club: 'Arsenal Soccer Club', teams: ['Arsenal U12 Boys Gold', 'Arsenal U12 Girls Gold', 'Arsenal U12 Boys Select', 'Arsenal U14 Boys DPL', 'Arsenal U14 Girls Gold'] },
  { club: 'Bulls Soccer Club', teams: ['Bulls U12 Boys Gold', 'Bulls U12 Girls Gold', 'Bulls U12 Boys Select', 'Bulls U14 Boys DPL'] },
]

// Placeholder ad artwork (inline SVG) so the demo has a real <img>.
const adImg = (text, fill) =>
  'data:image/svg+xml,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="55%" font-family="sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">${text}</text></svg>`)
const ADS = [
  { src: adImg('Sportsplex Parking', '#01113E'), alt: 'Fredericksburg Sportsplex: tournament parking and shuttle info', url: '#ad-parking' },
  { src: adImg('Team Dinner Deals', '#15803D'), alt: 'Team dinner deals at Central Park restaurants', url: '' },
]

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="The event landing page is the first screen of every booking. Its hero can be unreadable, its images and stepper buttons have no useful names, and one of the three search fields fails silently.">

  <ada-item v-bind="I.hero">
    <p>The event title and dates are white text placed straight on the event's background image. With a light or default image they were <strong>observed live</strong> as white on white. Nothing guarantees a dark layer behind the text.</p>
    <contrast-pair fg="#FFFFFF" bg="#FFFFFF" label="Worst case observed live: white text on a white image" size="large" />
    <agent-check agent="contrast-master" verdict="refines" rule="Text over images must meet 4.5:1 (3:1 for large text) against the worst-case background, not the current photo.">
      <p>Agrees. The scrim needs a set strength. A 50% black layer over a pure-white image gives <code>#808080</code>, and white on that is only <strong>3.95:1</strong>. That passes for the large title but fails for the 20px date line. At 60% (<code>#666666</code>) white text measures <strong>5.74:1</strong> on any image.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.alt">
    <p>The logo's alt text is always "Event Logo", whatever the event is. Ads all say "Display Image". Because <code>redirectURL</code> is optional, the ad can render as an <code>&lt;a&gt;</code> with no <code>href</code>. That isn't a link and can't be reached with the keyboard.</p>
    <ada-code tone="bad" caption="Production — HomeView.vue:263-268, :307-313" lang="vue" code='<img :src="event.logo" alt="Event Logo" />
…
<a :href="image.redirectURL">          <!-- redirectURL is optional -->
  <img :src="image.url" alt="Display Image" />
</a>' />
    <sr-output before="Event Logo, image · Display Image, image" after="Virginia International Youth Soccer Cup, image · Fredericksburg Sportsplex: parking info, link" />
    <agent-check agent="alt-text-headings" verdict="agrees" rule="Logo alt identifies the organization (never the word “logo”); a linked image's alt describes the destination.">
      <p>Confirmed. "Event Logo" is both generic and redundant.</p>
    </agent-check>
    <agent-check agent="link-checker" verdict="refines" rule="Every link needs a real destination; an anchor without href is not a link.">
      <p>Agrees. When there's no URL, render a plain <code>&lt;img&gt;</code>, not an empty <code>&lt;a&gt;</code>. The ad record also has no field for alt text today, so the ad data model needs an <code>altText</code> (or advertiser name) field before the alt text can be meaningful.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.stepper">
    <p>All four +/- buttons (adults and children) are icon-only <code>q-btn</code>s. The file has no <code>aria-label</code> anywhere, so each one is announced as just "button".</p>
    <ada-code tone="bad" caption="Production pattern — TravelerSelect.vue (×4)" lang="vue" code='<q-btn round flat icon="remove" @click="adults--" />
<span>{{ adults }}</span>
<q-btn round flat icon="add" @click="adults++" />' />
    <sr-output before="button" after="Decrease adults, button" />
    <agent-check agent="aria-specialist" verdict="refines" rule="Icon-only buttons need an accessible name; value changes that aren't focus-driven should be announced politely.">
      <p>Agrees. The names must say which count they change ("Decrease adults", "Increase children"). Four buttons all called "Decrease" or "Increase" would still be ambiguous. The new count should also be announced through a polite live region, because focus stays on the button.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.validation">
    <p>Booking Type and Location are <code>q-select</code>s, so Quasar renders their error text with <code>role="alert"</code>. Registered Team is a custom button and popup. Its error is a bare <code>&lt;div&gt;</code> that isn't linked to the field, so a screen reader never announces it (<strong>confirmed live</strong>). Submitting doesn't move focus to the first invalid field.</p>
    <ada-code tone="bad" caption="Production pattern — RegistrationSelect.vue L304-311, L403-405" lang="vue" code='<button class="registration-trigger" @click="open = true">
  {{ selectedLabel }}
</button>
…
<div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>' />
    <sr-output before="Registered Team, button (error never spoken)" after="Registered Team, button, invalid entry, Select at least one registered team" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="aria-invalid on the field, error linked via aria-describedby, focus moves to the first invalid field on submit.">
      <p>Confirmed for all three fields.</p>
    </agent-check>
    <agent-check agent="live-region-controller" verdict="refines" rule="Never move focus to an alert; alerts interrupt, so avoid firing them for content the user is already being taken to.">
      <p>If submit moves focus to Registered Team <em>and</em> its error has <code>role="alert"</code>, screen readers read the error twice. Keep <code>role="alert"</code> for errors that appear without a focus change. The field that gets focus should rely on <code>aria-describedby</code>.</p>
      <p><strong>Version check:</strong> Quasar 2.19.3 (presto-2026's version) never sets <code>aria-invalid</code> on a field; newer Quasar 2.x releases add <code>aria-invalid</code> and <code>aria-describedby</code> to a <code>q-select</code> with <code>error</code> + <code>error-message</code>. Check fuse's installed Quasar before deciding whether to add them to the two native selects by hand.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.popup">
    <p>Opening Registered Team shows one flat list of 200+ checkboxes with a text filter. Nothing tells a screen reader how many teams are selected or how many match the filter, and nothing groups the list.</p>
    <agent-check agent="live-region-controller" verdict="refines" rule="Result counts and filter changes use one polite live region that exists before it updates; debounce rapid input.">
      <p>Agrees. Use one <code>role="status"</code> for both counts ("3 selected · 9 teams shown"), and debounce it while the user types in the filter so every keystroke isn't read out.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Checkbox sets need a fieldset/legend so each option has context.">
      <p>The problem statement names "no grouping", but the acceptance criteria only ask for the live count. Grouping teams by club (<code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code>) is what makes 200 options usable, so it should be added to the criteria.</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, LandingPage, BookingWidget, DisplayAd },
    setup: () => ({ ID, I: ITEMS, PRESTO }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="The same landing page and search bar in the presto-2026 redesign. The hero is already protected, but the stepper, validation and team popup repeat the production gaps.">

  <ada-item v-bind="I.hero">
    <ada-before status="partial" source="presto-2026 Storybook › Landing Page / Book Reservation" :href="PRESTO.story('landing-page-book-reservation--teams-booking-widget')">
      <div style="height:430px;overflow:hidden;border-radius:8px"><landing-page :ads="0" /></div>
      <template #notes>
        <p><code>LandingPage.vue:78-79</code> always adds a <code>rgba(0,0,0,.5)</code> scrim, on top of a <code>#000</code> background color. It doesn't depend on the image, so the criterion is met.</p>
        <p><strong>Partial:</strong> 50% isn't enough in the worst case. The 40px bold title passes, but the 20px regular date line (<code>.lp__dates</code>) drops to 3.95:1 over a white image.</p>
        <contrast-pair fg="#FFFFFF" bg="#808080" label="Date line over a white image with presto's 50% scrim" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.alt">
    <ada-before status="partial" source="presto-2026 Storybook › Display Ad (340×215)" :href="PRESTO.story('components-media-visuals-display-ad--landing')">
      <display-ad />
      <template #notes>
        <p>The hero logo (<code>LandingPage.vue:91</code>) is the EventPipe logo with <code>alt="EventPipe"</code>. That's a correct name for that image, but the redesign doesn't show the event's own logo yet.</p>
        <p><code>DisplayAd.vue</code> is only a placeholder: <code>role="img"</code> labelled "Display Ad 340x215", with no image, link or alt-text field. The rules for linked ads (guarded <code>href</code>, alt text from the ad record) still need to be written.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.stepper">
    <ada-before status="applies" source="presto-2026 Storybook › Teams Booking Widget" :href="PRESTO.story('landing-page-components-teams-booking-widget--default')">
      <div style="max-width:1000px"><booking-widget mode="reservations" :tabs="false" /></div>
      <ada-code tone="bad" caption="presto-2026 — BookingWidget.vue:256-258 (inside the Travelers popover, once per room)" lang="vue" code='<q-btn round outline icon="remove" class="bw__step" :disable="…" @click="stepRoom(i, f.key, -1, f.min)" />
<div style="width:28px;text-align:center">{{ room[f.key] }}</div>
<q-btn round outline icon="add" class="bw__step" @click="stepRoom(i, f.key, 1, f.min)" />' />
      <template #notes>
        <p>Open <strong>Travelers</strong> to see them. The +/- buttons have no <code>aria-label</code>, and the count isn't announced.</p>
        <p>presto's own <code>QuantityStepper.vue</code> does better (<code>aria-label="Decrease"</code>/<code>"Increase"</code> and an <code>aria-live</code> value), but the widget doesn't use it, and its labels still don't say which count they change.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.validation">
    <ada-before status="applies" source="presto-2026 Storybook › Landing Page (blank Booking Type)" :href="PRESTO.story('landing-page-book-reservation--teams-booking-widget')">
      <div style="max-width:1000px"><booking-widget mode="" :tabs="false" /></div>
      <template #notes>
        <p>The widget has no validation. <strong>Search</strong> (<code>BookingWidget.vue:277</code>) has no handler, and the prototype (<code>App.vue:188-201</code>) starts a flow even when Booking Type is blank. No field shows an error or gets <code>aria-invalid</code>, and focus doesn't move.</p>
        <p>The "Add a team" dialog (<code>BookingWidget.vue:293-297</code>) repeats production's pattern. The input gets <code>:error</code> with <code>hide-bottom-space</code>, and the duplicate-name message is a separate <code>&lt;div&gt;</code> that isn't linked to it.</p>
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.popup">
    <ada-before status="partial" source="presto-2026 Storybook › Teams Booking Widget (Group Block)" :href="PRESTO.story('landing-page-components-teams-booking-widget--dropdown-selector')">
      <div style="max-width:1040px"><booking-widget mode="group" :tabs="false" :mode-dropdown="true" /></div>
      <template #notes>
        <p>Open <strong>Registered Team(s)</strong>. The list is grouped visually: each club has a "select all" checkbox and an indented list (<code>BookingWidget.vue:184-189</code>). But the groups aren't marked up as groups (no <code>fieldset</code> or <code>role="group"</code>).</p>
        <p>There's no selection count, because the trigger just says "Multiple Teams" (L58). "No teams match" (L190) isn't a live region, and the filter input (L171) has only a placeholder. The popup's close button (L168) is icon-only with no name.</p>
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
    components: { ...kit, QuantityStepper },
    setup() {
      // Item 3 — traveler steppers
      const trav = reactive({ adults: 1, children: 0 })
      const travFields = [
        { key: 'adults', label: 'Adults', noun: 'adults', min: 1 },
        { key: 'children', label: 'Children', noun: 'children', min: 0 },
      ]
      const travMsg = ref('')
      const step = (f, d) => {
        trav[f.key] = Math.max(f.min, trav[f.key] + d)
        travMsg.value = `${trav[f.key]} ${f.noun}`
      }
      const stepB = reactive({ adults: 2, children: 1 })

      // Item 4 — search validation
      const typeOptions = ['Book Reservations', 'Hold Rooms for Group or Team']
      const locOptions = ['Fredericksburg, VA', 'Stafford, VA']
      const form = reactive({ type: null, location: null, team: '' })
      const err = reactive({ type: '', location: '', team: '' })
      const typeRef = ref(null)
      const locRef = ref(null)
      const teamRef = ref(null)
      const submitSearch = async () => {
        err.type = form.type ? '' : 'Choose a booking type.'
        err.location = form.location ? '' : 'Choose a location.'
        err.team = form.team ? '' : 'Select at least one registered team.'
        await nextTick()
        const first = err.type ? typeRef : err.location ? locRef : err.team ? teamRef : null
        first?.value?.focus()
      }
      const pickTeam = () => {
        form.team = form.team ? '' : 'Arsenal U12 Boys Select'
        if (form.team) err.team = ''
      }

      // Item 5 — Registered Team popup
      const teamQuery = ref('')
      const picked = ref(['Arsenal U12 Boys Select'])
      const filtered = computed(() => {
        const q = teamQuery.value.trim().toLowerCase()
        return CLUBS.map((c) => ({ club: c.club, teams: c.teams.filter((t) => t.toLowerCase().includes(q)) })).filter((c) => c.teams.length)
      })
      const shown = computed(() => filtered.value.reduce((n, c) => n + c.teams.length, 0))
      const teamStatus = computed(() => `${picked.value.length} selected · ${shown.value} ${shown.value === 1 ? 'team' : 'teams'} shown`)

      return {
        ID, I: ITEMS, ADS, defaultBg,
        trav, travFields, travMsg, step, stepB,
        typeOptions, locOptions, form, err, typeRef, locRef, teamRef, submitSearch, pickTeam,
        teamQuery, picked, filtered, teamStatus,
      }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is the fix from Linear's acceptance criteria. Use Tab, Enter and a screen reader to check the demos.">

  <ada-item v-bind="I.hero">
    <ada-option letter="A" title="Permanent dark scrim behind the hero text (image-independent)" recommended lang="css"
      code=".hero {
  background-color: #000;
  /* 60% black: white text stays at 5.74:1 even over a pure-white image */
  background-image: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), var(--event-bg);
}">
      <div class="ada-row">
        <div style="flex:1 1 260px;min-height:140px;padding:20px;border-radius:8px;color:#fff;text-align:center;background-color:#000;background-image:linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), linear-gradient(#fff, #fff)">
          <p style="margin:0;font-size:24px;font-weight:700;line-height:1.2">Virginia International Youth Soccer Cup 2026</p>
          <p style="margin:8px 0 0;font-size:20px">Sat, 7/18/2026 – Sun, 7/19/2026</p>
          <p style="margin:8px 0 0;font-size:13px">Worst case: pure-white image</p>
        </div>
        <div :style="{ flex: '1 1 260px', minHeight: '140px', padding: '20px', borderRadius: '8px', color: '#fff', textAlign: 'center', backgroundColor: '#000', backgroundSize: 'cover', backgroundImage: 'linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url(' + defaultBg + ')' }">
          <p style="margin:0;font-size:24px;font-weight:700;line-height:1.2">Virginia International Youth Soccer Cup 2026</p>
          <p style="margin:8px 0 0;font-size:20px">Sat, 7/18/2026 – Sun, 7/19/2026</p>
          <p style="margin:8px 0 0;font-size:13px">Default event image</p>
        </div>
      </div>
      <contrast-pair fg="#FFFFFF" bg="#666666" label="White text over the worst case with a 60% scrim" />
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.alt">
    <ada-option letter="A" title="Real names in alt text; render the ad link only when it has an href" recommended lang="vue"
      code='<img :src="event.logo" :alt="event.name" />

<template v-for="ad in ads" :key="ad.id">
  <a v-if="ad.redirectURL" :href="ad.redirectURL">
    <img :src="ad.url" :alt="ad.altText" />
  </a>
  <img v-else :src="ad.url" :alt="ad.altText" />
</template>'>
      <div class="ada-row ada-focus-demo">
        <template v-for="ad in ADS" :key="ad.alt">
          <a v-if="ad.url" :href="ad.url" @click.prevent><img :src="ad.src" :alt="ad.alt" width="220" height="120" style="display:block;border-radius:6px" /></a>
          <img v-else :src="ad.src" :alt="ad.alt" width="220" height="120" style="display:block;border-radius:6px" />
        </template>
      </div>
      <p class="ada-note">The first ad has a URL, so it's a link. The second has none, so it renders as a plain image.</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.stepper">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="aria-label on all four +/- buttons (plus a polite count)" recommended lang="vue"
        code='<q-btn round outline icon="remove" aria-label="Decrease adults"
       :disable="adults <= 1" @click="adults--" />
<span aria-hidden="true">{{ adults }}</span>
<q-btn round outline icon="add" aria-label="Increase adults" @click="adults++" />
<span class="sr-only" aria-live="polite">{{ adults }} adults</span>'>
        <div class="ada-stack ada-focus-demo" style="max-width:320px">
          <div v-for="f in travFields" :key="f.key" class="ada-row" style="justify-content:space-between;align-items:center">
            <span style="font-weight:600">{{ f.label }}</span>
            <div class="ada-row" style="align-items:center;gap:10px">
              <q-btn round outline color="primary" size="sm" icon="remove" :aria-label="'Decrease ' + f.noun" :disable="trav[f.key] <= f.min" @click="step(f, -1)" />
              <span aria-hidden="true" style="min-width:20px;text-align:center;font-weight:700">{{ trav[f.key] }}</span>
              <q-btn round outline color="primary" size="sm" icon="add" :aria-label="'Increase ' + f.noun" @click="step(f, 1)" />
            </div>
          </div>
          <span class="ada-sr-only" aria-live="polite">{{ travMsg }}</span>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="aria-specialist" title="Reuse presto's QuantityStepper inside a labelled group" lang="vue"
        code='<div role="group" aria-labelledby="lbl-adults">
  <span id="lbl-adults">Adults</span>
  <QuantityStepper v-model="adults" :min="1" />
</div>'>
        <div class="ada-stack" style="max-width:320px">
          <div role="group" aria-labelledby="qs-adults" class="ada-row" style="justify-content:space-between;align-items:center">
            <span id="qs-adults" style="font-weight:600">Adults</span>
            <quantity-stepper v-model="stepB.adults" :min="1" />
          </div>
          <div role="group" aria-labelledby="qs-children" class="ada-row" style="justify-content:space-between;align-items:center">
            <span id="qs-children" style="font-weight:600">Children</span>
            <quantity-stepper v-model="stepB.children" :min="0" />
          </div>
        </div>
        <template #why><p>The design-system stepper already has named buttons and a live value. The group label gives "Decrease" its context ("Adults, group"), so fuse and presto share one component instead of four hand-built buttons.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.validation">
    <ada-option letter="A" title="Linked error on Registered Team, aria-invalid on all three fields, focus the first invalid field" recommended lang="vue"
      code='<button ref="teamTrigger" type="button" aria-labelledby="team-lbl team-val"
        :aria-invalid="teamError ? &quot;true&quot; : null"
        :aria-describedby="teamError ? &quot;team-err&quot; : null">…</button>
<div v-if="teamError" id="team-err" role="alert">{{ teamError }}</div>

// SearchBar.vue — emitValues()
await nextTick()
firstInvalidRef.value?.focus()'>
      <form class="ada-stack ada-focus-demo" style="max-width:420px" novalidate @submit.prevent="submitSearch">
        <q-select ref="typeRef" v-model="form.type" outlined :options="typeOptions" label="Booking type"
          :error="!!err.type" :error-message="err.type" @update:model-value="err.type = ''" />
        <q-select ref="locRef" v-model="form.location" outlined :options="locOptions" label="Location"
          :error="!!err.location" :error-message="err.location" @update:model-value="err.location = ''" />
        <div>
          <span id="team-lbl" style="display:block;font-size:13px;font-weight:600;margin-bottom:4px">Registered team</span>
          <button ref="teamRef" type="button" aria-labelledby="team-lbl team-val"
            :aria-invalid="err.team ? 'true' : null" :aria-describedby="err.team ? 'team-err' : null"
            :style="{ width: '100%', minHeight: '48px', textAlign: 'left', padding: '0 12px', background: '#fff', font: 'inherit', borderRadius: '4px', cursor: 'pointer', border: err.team ? '2px solid #B91C1C' : '1px solid #64748B' }"
            @click="pickTeam"><span id="team-val">{{ form.team || 'Select a team' }}</span></button>
          <div v-if="err.team" id="team-err" role="alert" style="color:#B91C1C;font-size:13px;margin-top:4px">{{ err.team }}</div>
        </div>
        <div class="ada-row"><q-btn type="submit" unelevated color="primary" no-caps label="Search" /></div>
      </form>
      <p class="ada-note">Press Search with the form empty: focus moves to Booking type and all three errors are exposed. Click "Select a team" to fill that field.</p>
    </ada-option>
  </ada-item>

  <ada-item v-bind="I.popup">
    <ada-option letter="A" title="Polite live region with a visible selection count (teams grouped by club)" recommended lang="vue"
      code='<q-input v-model="query" label="Filter by name, age or gender" />
<p role="status">{{ selected.length }} selected · {{ shown }} teams shown</p>

<fieldset v-for="club in filteredClubs" :key="club.name">
  <legend>{{ club.name }}</legend>
  <q-checkbox v-for="t in club.teams" :key="t" v-model="selected" :val="t" :label="t" />
</fieldset>'>
      <div class="ada-mini-frame ada-focus-demo" style="max-width:400px">
        <p style="margin:0 0 8px;font-weight:700">Search teams</p>
        <q-input v-model="teamQuery" outlined dense label="Filter by name, age or gender" />
        <p role="status" style="margin:10px 0;font-weight:600">{{ teamStatus }}</p>
        <fieldset v-for="c in filtered" :key="c.club" style="border:1px solid #CBD5E1;border-radius:6px;margin:0 0 10px;padding:6px 10px 8px">
          <legend style="font-weight:700;padding:0 4px">{{ c.club }}</legend>
          <q-checkbox v-for="t in c.teams" :key="t" v-model="picked" :val="t" :label="t" color="primary" style="display:flex" />
        </fieldset>
        <p v-if="!filtered.length" class="ada-note">No teams match "{{ teamQuery }}".</p>
      </div>
    </ada-option>
  </ada-item>
</ada-issue>`,
  }),
}
