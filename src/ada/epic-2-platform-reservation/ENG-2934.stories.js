// ENG-2934 · ADA-PLAT-RES-04 — platform checkout step 1 (Guest Information):
// orphaned labels, fake-span remove/add guest controls, JS-only Continue.
// Issue → Before (presto-2026) → Proposal (Linear fix + agent alternates).
import { ref, reactive, nextTick } from 'vue'
import { kit, issueParams, VIEW_PARAMS, PRESTO } from '../_kit/index.js'
import linearMd from './ENG-2934.linear.md?raw'
import ReservationGuests from '../../presto/components/checkout/ReservationGuests.vue'
import StepContactInfo from '../../presto/components/checkout/steps/StepContactInfo.vue'

export default {
  title: 'Epic 2 – platform Reservation Flow/ADA-PLAT-RES-04 – Checkout Step 1: Guest Information',
  tags: ['autodocs'],
  parameters: issueParams('ENG-2934'),
}

const ID = 'ENG-2934'
const FILE = 'platform/app/templates/enduser/orders/guest_information.plush.html'

const ITEMS = {
  labels: { n: 1, title: '11 orphaned labels on the guest form', wcag: ['1.3.1', '3.3.2'], state: 'corrected', element: 'Form fields · labels', where: `${FILE}:50, 54, 58, 63, 82, 89, 103, 123, 127, 131, 137` },
  trash: { n: 2, title: 'Remove-guest trash icons are non-focusable spans (2 instances)', wcag: ['2.1.1', '4.1.2'], state: 'corrected', element: 'Icon button · remove guest', where: `${FILE}:93, :111` },
  add: { n: 3, title: '"Add additional guest" is a fake span; "Continue" depends on JS', wcag: ['2.1.1', '4.1.2'], state: 'new', element: 'Button · add guest / continue', where: `${FILE}:180, :274` },
}

// Production snippets are reconstructed from the patterns and line numbers Linear
// cites (the platform repo isn't checked out here).
const C = {
  labelsBad: `<!-- L50 / L54 — label has no "for", input has no matching id -->
<label class="form-label">First Name</label>
<input type="text" class="form-control" name="Guests[0].FirstName" value="<%= guest.FirstName %>">

<label class="form-label">Last Name</label>
<input type="text" class="form-control" name="Guests[0].LastName" value="<%= guest.LastName %>">

<!-- L58 / L63 -->
<label class="form-label">Mobile Number</label>
<input type="tel" class="form-control" name="Guests[0].Mobile">
<label class="form-label">Guest Type</label>
<select class="form-select" name="Guests[0].GuestType">…</select>`,
  trashBad: `<!-- L93 (and an identical copy at L111) -->
<span class="text-danger cursor-pointer"
      data-action="click->guest-information#removeGuest">
  <i class="fa fa-trash"></i>
</span>`,
  addBad: `<!-- L180 -->
<span class="link-primary" data-action="click->guest-information#addGuest">
  <i class="fa fa-plus"></i> Add additional guest
</span>

<!-- L274 — no submit semantics; nothing happens without the Stimulus controller -->
<button type="button" class="btn btn-primary"
        data-action="click->guest-information#continue">Continue</button>`,
  prestoLabels: `<!-- presto-2026 ReservationGuests.vue:208-216 — Country -->
<div class="cgf__field cgf__field--full">
  <span>Country</span>                  <!-- not a <label> -->
  <div class="rg__selectwrap"><select v-model="room.country">…</select></div>
</div>

<!-- :138-142 — Mobile number: <span> + PhoneField's bare <input type="tel"> -->
<div class="cgf__field cgf__field--full">
  <span>Mobile number *</span>
  <phone-field v-model="room.mobile" />
</div>`,
  prestoTrash: `<!-- presto-2026 ReservationGuests.vue:255 -->
<button type="button" class="rg__remove" aria-label="Remove guest"
        @click="removeGuest(i, gi)"><q-icon name="close" /></button>`,
  prestoAdd: `<!-- presto-2026 ReservationGuests.vue:257 · StepContactInfo.vue:578, 592 -->
<button type="button" class="rg__addbtn" @click="addGuest(i)">
  <q-icon name="add" /> Add Additional Guest
</button>
<q-btn label="Next" @click="onNext" />   // onNext: showErrors = true — focus stays on Next`,
  labelsFix: `<%= let gid = "guest-" + i %>
<label for="<%= gid %>-first" class="form-label">First Name</label>
<input id="<%= gid %>-first" type="text" class="form-control"
       name="Guests[<%= i %>].FirstName" value="<%= guest.FirstName %>">

<label for="<%= gid %>-last" class="form-label">Last Name</label>
<input id="<%= gid %>-last" type="text" class="form-control" name="Guests[<%= i %>].LastName">

<label for="<%= gid %>-mobile" class="form-label">Mobile Number</label>
<input id="<%= gid %>-mobile" type="tel" class="form-control" name="Guests[<%= i %>].Mobile">

<label for="<%= gid %>-type" class="form-label">Guest Type</label>
<select id="<%= gid %>-type" class="form-select" name="Guests[<%= i %>].GuestType">…</select>

<!-- The fallback block (L123-137) must use a different prefix so ids stay unique. -->`,
  labelsFieldset: `<fieldset class="guest" id="guest-<%= i %>">
  <legend>Guest <%= i + 1 %><%= if (i == 0) { %> (primary)<% } %></legend>

  <label for="guest-<%= i %>-first">First Name</label>
  <input id="guest-<%= i %>-first" autocomplete="given-name" …>

  <label for="guest-<%= i %>-last">Last Name</label>
  <input id="guest-<%= i %>-last" autocomplete="family-name" …>

  <label for="guest-<%= i %>-mobile">Mobile Number</label>
  <input id="guest-<%= i %>-mobile" type="tel" autocomplete="tel" …>
</fieldset>`,
  trashFix: `<button type="button" class="btn btn-link text-danger"
        aria-label="Remove guest <%= i + 1 %>"
        data-action="guest-information#removeGuest">
  <i class="fa fa-trash" aria-hidden="true"></i>
</button>`,
  trashFocus: `// guest_information_controller.js
removeGuest(event) {
  const row = event.currentTarget.closest('.guest')
  const rows = [...this.element.querySelectorAll('.guest')]
  const next = rows[rows.indexOf(row) + 1] ?? rows[rows.indexOf(row) - 1]
  row.remove()
  this.renumber()                               // "Remove guest N" stays accurate
  ;(next?.querySelector('button[aria-label^="Remove"]') ?? this.addButtonTarget).focus()
  this.statusTarget.textContent = 'Guest removed.' // <p role="status">
}`,
  addFix: `<button type="button" class="btn btn-link"
        data-action="guest-information#addGuest">
  <i class="fa fa-plus" aria-hidden="true"></i> Add additional guest
</button>`,
  addSubmit: `<form action="<%= orderGuestsPath() %>" method="POST"
      data-controller="guest-information"
      data-action="submit->guest-information#continue">
  …
  <button type="submit" class="btn btn-primary">Continue</button>
</form>

// controller
addGuest() {
  const row = this.insertGuestRow()
  row.querySelector('input').focus()   // land on the new guest's First Name
}`,
}

const sampleRooms = [{ adults: 1, children: 0 }]
const sampleRoomsExtra = [{ adults: 3, children: 0 }]

/* ------------------------------------------------------------------ Issue */
export const Issue = {
  parameters: VIEW_PARAMS.issue,
  render: () => ({
    components: kit,
    setup: () => ({ ID, I: ITEMS, C, linearMd }),
    template: `
<ada-issue :issue-id="ID" view="issue" :linear-md="linearMd"
  summary="Step 1 of the platform checkout collects the primary and additional guests. Screen readers hear unnamed fields, and keyboard users can't add or remove guests at all.">

  <ada-item v-bind="I.labels">
    <p>Eleven <code>&lt;label&gt;</code> elements sit next to their fields without a <code>for</code>/<code>id</code> link. A screen reader announces “edit text” with no name, and clicking the label text doesn't focus the field. Linear corrected the count from 3 to 11: First/Last Name, Mobile Number and Guest Type for the primary guest and for additional guests, repeated again in a fallback block.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — guest_information.plush.html:50-63" :code="C.labelsBad" />
    <sr-output before="edit text" after="First Name, edit text" />
    <agent-check agent="forms-specialist" verdict="agrees" rule="Every form control MUST have a programmatically associated label; use &lt;label for&gt; matching the input's id. Visual proximity is not enough.">
      <p>Confirmed. Every <code>id</code> needs a per-guest prefix. The same four labels repeat for each guest and again in the fallback block, so a shared <code>id="first-name"</code> would just create duplicate ids.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Use fieldset/legend for related field groups when the group label provides essential context for the individual fields.">
      <p>Fixing <code>for</code>/<code>id</code> alone still leaves several fields all named “First Name”. Wrapping each guest in <code>&lt;fieldset&gt;&lt;legend&gt;Guest 2&lt;/legend&gt;</code> tells the user whose name they're typing (Proposal, Option B). Adding <code>autocomplete="given-name"</code>, <code>family-name</code> and <code>tel</code> also covers SC 1.3.5.</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.trash">
    <p>The trash icon is a <code>&lt;span&gt;</code> with only a Stimulus click action. It has no <code>tabindex</code>, role, key handler or accessible name, so keyboard and switch users can't remove a guest. Linear found a second identical copy at line 111.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — guest_information.plush.html:93, :111" :code="C.trashBad" />
    <sr-output before="(not announced; not focusable)" after="Remove guest 2, button" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="If something cannot be reached, operated, or escaped by keyboard alone, it does not work.">
      <p>Confirmed. A native <code>&lt;button&gt;</code> fixes reach, activation (Enter/Space) and role in one change.</p>
    </agent-check>
    <agent-check agent="keyboard-navigator" verdict="refines" rule="Deletion and removal: focus moves to the next item, or the previous one if the last was deleted — never let focus disappear into the void.">
      <p>Once the button works, pressing it removes the focused element, and focus falls back to <code>&lt;body&gt;</code>. The controller should move focus to the next guest's remove button (or to “Add additional guest”) and renumber the remaining <code>aria-label</code>s (Option B).</p>
    </agent-check>
  </ada-item>

  <ada-item v-bind="I.add">
    <p>“Add additional guest” uses the same fake-span pattern, so keyboard users can't add guests. “Continue” is a real button, but it's <code>type="button"</code>. Without the Stimulus controller it does nothing, and pressing Enter in a field doesn't submit the step.</p>
    <ada-code tone="bad" caption="Production pattern (reconstructed from Linear) — guest_information.plush.html:180, :274" :code="C.addBad" />
    <agent-check agent="keyboard-navigator" verdict="agrees" rule="Interactive controls must be natively focusable and operable; tabindex on a span is not a substitute for a button.">
      <p>Confirmed for the add control. Linear's acceptance criteria don't cover “Continue”, even though the problem statement lists it.</p>
    </agent-check>
    <agent-check agent="forms-specialist" verdict="refines" rule="Dynamic content the user triggered: move focus to the new content or announce it.">
      <p>After “Add additional guest”, focus should land on the new guest's First Name field. For “Continue”, a <code>&lt;form&gt;</code> with <code>type="submit"</code> gives Enter-to-submit and works without JS. The controller can still intercept <code>submit</code> for validation (Option B).</p>
    </agent-check>
  </ada-item>
</ada-issue>`,
  }),
}

/* ----------------------------------------------------------------- Before */
export const Before = {
  parameters: VIEW_PARAMS.before,
  render: () => ({
    components: { ...kit, ReservationGuests, StepContactInfo },
    setup: () => ({ ID, I: ITEMS, C, PRESTO, sampleRooms, sampleRoomsExtra, g1: ref([]), g2: ref([]), g3: ref([]) }),
    template: `
<ada-issue :issue-id="ID" view="before"
  summary="In presto-2026, step 1 is the Contact Info step (ReservationGuests inside StepContactInfo). Most labels and all the guest controls are already native. The gaps are listed per item.">

  <ada-item v-bind="I.labels">
    <ada-before status="partial" source="presto-2026 Storybook › Checkout › Reservation Guests" :href="PRESTO.story('checkout-experience-components-book-reservation-reservation-guests--single-room')">
      <div style="max-width:720px"><reservation-guests v-model="g1" :rooms="sampleRooms" /></div>
      <template #notes>
        <p><strong>Already right:</strong> First/Last name, Email, Address, City, State and Postal Code, plus each additional guest's name fields (“Guest 1 first name”), use a wrapping <code>&lt;label&gt;</code>, so they have names (<code>ReservationGuests.vue:127-136, 193-239, 247-254</code>). Guest Type isn't collected in presto.</p>
        <p><strong>Still orphaned:</strong> <em>Mobile number</em> is a <code>&lt;span&gt;</code> over <code>PhoneField</code>'s bare <code>&lt;input type="tel"&gt;</code> (<code>:138-142</code>, <code>PhoneField.vue:417</code>). <em>Country</em> (<code>:208-216</code>), custom fields (<code>:177-188</code>) and each “Additional email” input (<code>:150-156</code>) also use a <code>&lt;span&gt;</code> in a <code>&lt;div&gt;</code>. The <code>+1</code> country-code button's name is just “+1”. axe flags the unlabeled Country <code>&lt;select&gt;</code> here (select-name). It doesn't flag the phone input only because its placeholder “(617) 470-7879” counts as a fallback name, and that's not a real label.</p>
        <ada-code tone="bad" caption="presto-2026 source" :code="C.prestoLabels" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.trash">
    <ada-before status="partial" source="presto-2026 Storybook › Checkout › Reservation Guests › Multiple Rooms" :href="PRESTO.story('checkout-experience-components-book-reservation-reservation-guests--multiple-rooms')">
      <div style="max-width:720px"><reservation-guests v-model="g2" :rooms="sampleRoomsExtra" /></div>
      <template #notes>
        <p><strong>Already right:</strong> remove is a native <code>&lt;button type="button"&gt;</code> with an <code>aria-label</code>. Quasar renders the icon with <code>aria-hidden="true"</code>.</p>
        <p><strong>Still open:</strong> every copy is named just “Remove guest”, not “Remove guest N” as Linear requires, so Tab and the buttons list can't tell the two apart. <code>removeGuest()</code> only splices the array (<code>:86</code>), so focus is lost when the focused row disappears. Tab to a remove button and press Enter to see it.</p>
        <ada-code tone="neutral" caption="presto-2026 source" :code="C.prestoTrash" />
      </template>
    </ada-before>
  </ada-item>

  <ada-item v-bind="I.add">
    <ada-before status="resolved" source="presto-2026 Storybook › Checkout › Contact Info" :href="PRESTO.story('checkout-experience-components-book-reservation-contact-info--reservation')">
      <div style="max-width:640px"><step-contact-info mode="reservation" :rooms="sampleRooms" v-model="g3" /></div>
      <template #notes>
        <p>“Add Additional Guest” and “Next” are both native buttons, so they're reachable and work with Enter and Space. This is a Vue SPA, so there's no server-post fallback to worry about.</p>
        <p><strong>Related gap:</strong> pressing <strong>Next</strong> with empty fields only sets <code>showErrors</code> (<code>StepContactInfo.vue:578</code>). Focus stays on Next, the new errors aren't announced, and the error text isn't linked to its field. The same pattern is ENG-2936 item 4. Adding a guest doesn't move focus to the new row either.</p>
        <ada-code tone="neutral" caption="presto-2026 source" :code="C.prestoAdd" />
      </template>
    </ada-before>
  </ada-item>
</ada-issue>`,
  }),
}

/* --------------------------------------------------------------- Proposal */
let uidSeq = 0
export const Proposal = {
  parameters: VIEW_PARAMS.proposal,
  render: () => ({
    components: kit,
    setup() {
      const guests = reactive([{ id: ++uidSeq, first: 'Alex', last: 'Smith' }, { id: ++uidSeq, first: 'Jordan', last: 'Lee' }, { id: ++uidSeq, first: 'Sam', last: 'Ortiz' }])
      const guestsB = reactive([{ id: ++uidSeq, first: 'Alex', last: 'Smith' }, { id: ++uidSeq, first: 'Jordan', last: 'Lee' }, { id: ++uidSeq, first: 'Sam', last: 'Ortiz' }])
      const status = ref('')
      const addBtnB = ref(null)
      const listB = ref(null)
      const removeA = (i) => guests.splice(i, 1)
      const removeB = async (i) => {
        guestsB.splice(i, 1)
        status.value = `Guest removed. ${guestsB.length} guest${guestsB.length === 1 ? '' : 's'} remaining.`
        await nextTick()
        const btns = listB.value?.querySelectorAll('[data-remove]') || []
        const target = btns[i] || btns[i - 1] || addBtnB.value
        target?.focus()
      }
      const addB = async () => {
        guestsB.push({ id: ++uidSeq, first: '', last: '' })
        await nextTick()
        listB.value?.querySelector(`#pb-${guestsB[guestsB.length - 1].id}-first`)?.focus()
      }
      const addA = () => guests.push({ id: ++uidSeq, first: '', last: '' })
      const submitted = ref('')
      const onSubmit = () => { submitted.value = 'Form submitted with Enter or the Continue button.' }
      return { ID, I: ITEMS, C, guests, guestsB, removeA, removeB, addA, addB, status, addBtnB, listB, submitted, onSubmit }
    },
    template: `
<ada-issue :issue-id="ID" view="proposal"
  summary="Option A in every item is Linear's acceptance criterion as Plush markup. The demos are live: Tab through them, and click a label to confirm it focuses its field.">

  <ada-item v-bind="I.labels">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add matching id and for to all 11 labels (per-guest prefix)" recommended :code="C.labelsFix">
        <div class="ada-mini-frame ada-focus-demo ada-stack" style="max-width:420px">
          <div class="ada-stack" style="gap:4px"><label for="pa-g0-first">First Name</label><input id="pa-g0-first" class="ada-demo-input" type="text" value="Alex" style="height:40px;padding:0 10px;border:1px solid #64748B;border-radius:6px" /></div>
          <div class="ada-stack" style="gap:4px"><label for="pa-g0-last">Last Name</label><input id="pa-g0-last" type="text" value="Smith" style="height:40px;padding:0 10px;border:1px solid #64748B;border-radius:6px" /></div>
          <div class="ada-stack" style="gap:4px"><label for="pa-g0-mobile">Mobile Number</label><input id="pa-g0-mobile" type="tel" style="height:40px;padding:0 10px;border:1px solid #64748B;border-radius:6px" /></div>
          <div class="ada-stack" style="gap:4px"><label for="pa-g0-type">Guest Type</label>
            <select id="pa-g0-type" style="height:40px;padding:0 10px;border:1px solid #64748B;border-radius:6px"><option>Adult</option><option>Child</option></select></div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Also group each guest in a fieldset with a numbered legend, plus autocomplete" :code="C.labelsFieldset">
        <div class="ada-stack ada-focus-demo" style="max-width:420px">
          <fieldset class="ada-mini-frame" style="margin:0">
            <legend style="font-weight:700;padding:0 4px">Guest 1 (primary)</legend>
            <div class="ada-row">
              <q-input dense outlined label="First Name" model-value="Alex" autocomplete="given-name" style="flex:1;min-width:140px" />
              <q-input dense outlined label="Last Name" model-value="Smith" autocomplete="family-name" style="flex:1;min-width:140px" />
            </div>
          </fieldset>
          <fieldset class="ada-mini-frame" style="margin:0">
            <legend style="font-weight:700;padding:0 4px">Guest 2</legend>
            <div class="ada-row">
              <q-input dense outlined label="First Name" model-value="Jordan" style="flex:1;min-width:140px" />
              <q-input dense outlined label="Last Name" model-value="Lee" style="flex:1;min-width:140px" />
            </div>
          </fieldset>
        </div>
        <template #why><p>With labels fixed, a screen reader still hears “First Name” once per guest. The legend adds context (“Guest 2 group, First Name”), and <code>autocomplete</code> lets browsers fill the primary guest's details (SC 1.3.5).</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.trash">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Both trash spans become buttons named Remove guest N" recommended :code="C.trashFix">
        <ul class="ada-stack ada-focus-demo" style="list-style:none;margin:0;padding:0;max-width:420px">
          <li v-for="(g, i) in guests" :key="g.id" class="ada-mini-frame ada-row" style="align-items:center;padding:8px 12px">
            <span style="flex:1">Guest {{ i + 1 }}: {{ g.first || '(new)' }} {{ g.last }}</span>
            <q-btn flat round dense color="negative" icon="delete" :aria-label="'Remove guest ' + (i + 1)" @click="removeA(i)" />
          </li>
        </ul>
        <q-btn v-if="!guests.length" flat no-caps color="primary" icon="add" label="Reset demo guests" @click="addA(); addA()" />
      </ada-option>
      <ada-option letter="B" origin="agent" agent="keyboard-navigator" title="Also move focus after removal and announce it" :code="C.trashFocus" lang="js">
        <div class="ada-focus-demo" style="max-width:420px">
          <ul ref="listB" class="ada-stack" style="list-style:none;margin:0 0 8px;padding:0">
            <li v-for="(g, i) in guestsB" :key="g.id" class="ada-mini-frame ada-row" style="align-items:center;padding:8px 12px">
              <span style="flex:1">Guest {{ i + 1 }}: {{ g.first || '(new)' }} {{ g.last }}</span>
              <q-btn data-remove flat round dense color="negative" icon="delete" :aria-label="'Remove guest ' + (i + 1)" @click="removeB(i)" />
            </li>
          </ul>
          <button ref="addBtnB" type="button" class="q-btn q-btn--flat q-btn--rectangle text-primary q-btn--no-uppercase" style="padding:4px 8px" @click="addB">+ Add additional guest</button>
          <p role="status" class="ada-note" style="margin-top:6px">{{ status }}</p>
        </div>
        <template #why><p>Tab to a remove button and press Enter. Focus moves to the next guest's remove button (or to Add when none are left), and the status line announces the change. Without this, focus drops to the top of the page.</p></template>
      </ada-option>
    </div>
  </ada-item>

  <ada-item v-bind="I.add">
    <div class="ada-options ada-options--2">
      <ada-option letter="A" title="Add additional guest becomes a real button" recommended :code="C.addFix">
        <div class="ada-focus-demo ada-stack" style="max-width:420px">
          <p class="ada-note">{{ guests.length }} guest{{ guests.length === 1 ? '' : 's' }} in the list above.</p>
          <div><q-btn flat no-caps color="primary" icon="add" label="Add additional guest" @click="addA" /></div>
        </div>
      </ada-option>
      <ada-option letter="B" origin="agent" agent="forms-specialist" title="Continue as a form submit; focus the new guest's first field" :code="C.addSubmit">
        <form class="ada-mini-frame ada-focus-demo ada-stack" style="max-width:420px" @submit.prevent="onSubmit">
          <div class="ada-stack" style="gap:4px"><label for="pb-cont-first">First Name</label><input id="pb-cont-first" type="text" autocomplete="given-name" style="height:40px;padding:0 10px;border:1px solid #64748B;border-radius:6px" /></div>
          <div><button type="submit" class="q-btn q-btn--unelevated q-btn--rectangle bg-primary text-white q-btn--no-uppercase" style="padding:8px 20px">Continue</button></div>
          <p role="status" class="ada-note">{{ submitted }}</p>
        </form>
        <template #why><p>Type in the field and press Enter: the step submits. With <code>type="submit"</code>, the step still posts if the Stimulus bundle fails to load. The Option B remove demo above shows Add moving focus into the new row.</p></template>
      </ada-option>
    </div>
  </ada-item>
</ada-issue>`,
  }),
}
