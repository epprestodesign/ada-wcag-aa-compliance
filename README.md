# ADA / WCAG 2.1 AA Compliance — Storybook

**Live:** https://epprestodesign.github.io/ada-wcag-aa-compliance/

A Storybook that walks through every issue in the Linear project
[**ADA / WCAG 2.1 AA Compliance**](https://linear.app/eventpipe/project/ada-wcag-21-aa-compliance-8122fef6668b)
— 33 issues across 6 epics — and, for each one, shows three things side by
side: what the ticket flags, how that element looks in the Presto redesign
today, and what we propose to change.

- **Stack:** Vue 3 · Quasar 2.19.3 · Storybook 10.6 · Vite 6 · pnpm (the same
  engine as [presto-2026](https://github.com/epprestodesign/presto-2026))
- **Design system:** Presto DS, vendored from presto-2026 into `src/presto/`
- **Cross-check:** [Community-Access/accessibility-agents](https://github.com/Community-Access/accessibility-agents),
  enabled at project scope in `.claude/settings.json`

## Why this exists

The Linear tickets are precise but text-only: they cite a file, a line and a
success criterion in codebases most reviewers don't have checked out. That
makes it hard to agree on a fix, and harder to see what the remediation should
look like in the product we're actually building.

This Storybook makes each ticket concrete. Every issue becomes a component you
can open, tab through and hand to a designer, an engineer or a legal reviewer.
Because it's built on the Presto design system, the proposals are written in
the components we'll ship, not in the abstract.

It also serves as the audit of the redesign itself: the **Before** stories are
presto-2026's own components, so any defect they repeat shows up immediately.

## What it covers

Six epics, matching the Linear milestones, across three codebases:

| Epic | Codebase | Issues |
|---|---|---|
| Epic 1 – fuse | Vue 3 / Quasar SPA ("Presto" booking engine) | ADA-FUSE-00 → 07 |
| Epic 2 – platform Reservation Flow | Go Buffalo monolith | ADA-PLAT-RES-00 → 07 |
| Epic 3 – platform Group Block Flow | Go Buffalo monolith | ADA-PLAT-GRP-01 → 05 |
| Epic 4 – platform Guest Self-Service | Go Buffalo monolith | ADA-PLAT-AUTH-01 |
| Epic 5 – platform Order Management | Go Buffalo monolith | ADA-PLAT-MGMT-00 → 04 |
| Epic 6 – blitz Live Inventory | Vue 3 / Quasar app | ADA-BLITZ-RES-00 → 05 |

Where it stands, as of the 2026-09-17 snapshot:

| | |
|---|---|
| Itemized problems | 138 (5 refuted by Linear) |
| Fully or partly present in presto-2026 | 90 |
| Already handled in presto-2026 | 35 |
| No presto-2026 equivalent yet | 17 |
| Agent cross-checks | 191 (114 notes, 4 disagreements with Linear) |
| Agent-suggested alternates | 80 |

The **All Issues** page in the sidebar keeps these counts live; they're
generated from the story files, not typed by hand.

## How to read an issue

Every issue component has the same three stories, and the numbered items match
the numbered problems in the ticket, so item *N* is the same element in all
three.

| Story | Shows |
|---|---|
| **Issue** | Each problem from Linear, with the production file:line, the flawed pattern, a contrast readout where color is involved, and a cross-check verdict from the matching accessibility specialist. The ticket text is included verbatim behind a disclosure. |
| **Before** | The matching presto-2026 element, rendered from real design-system components, marked **still present** / **partial** / **already handled** / **no equivalent yet** |
| **Proposal** | **Option A** is always the Linear acceptance-criteria fix, as a live demo plus code. **Options B/C** appear where a specialist suggests a meaningfully different approach, and are labeled *agent-suggested — not in Linear*. |

Items also carry a state: **Confirmed**, **Corrected in Linear**, **New
finding**, **Refuted — no change** (kept visible so nobody "fixes" it later), or
**Needs JS verification**.

Agent verdicts are **Agrees with Linear**, **Agent note** (agrees, but adds a
nuance or corrects a number) or **Disagrees with Linear**. Where an agent
disagrees, Linear's fix still appears as Option A and the alternative is marked
Recommended — the ticket is never edited to match.

## Structure

```
src/
  ada/
    overview/                 Introduction · All Issues · Cross-Check Agents
    _kit/                     shared audit components, issue index, AUTHORING.md
    epic-1-fuse/              ENG-2922 … ENG-2929
    epic-2-platform-reservation/
    epic-3-platform-group-block/
    epic-4-platform-self-service/
    epic-5-platform-order-management/
    epic-6-blitz-live-inventory/
      ENG-XXXX.stories.js     one component per Linear issue
      ENG-XXXX.linear.md      the Linear description, verbatim
  presto/                     presto-2026 components, stories, tokens (Before source)
```

Only the ADA stories appear in the sidebar. The presto-2026 source is vendored
so the Before stories can render the real thing.

## Commands

```bash
pnpm install
pnpm storybook                  # dev server on :6006
pnpm ada:index                  # regenerate the All Issues tallies
pnpm ada:check <story-id> …     # screenshot + axe (dev server must be running)
pnpm build-storybook            # static build → storybook-static/
pnpm a11y:ci                    # serve the build and ada-check every story (what CI runs)
```

For the live Hotel Map and remote imagery, copy `.env.example` to `.env` and
fill in the keys. The file is gitignored.

## Checks

Every story runs **axe-core** (WCAG 2.x A/AA) in Storybook's Accessibility
panel, and `scripts/ada-check.mjs` (Playwright + axe) runs the same audit
headlessly over every story in CI:

- **Fails the build:** console errors, empty renders, or axe violations in
  Issue, Proposal or Overview stories.
- **Reported, not failed:** findings in Before stories — they document existing
  presto-2026 defects on purpose. Contrast swatches are excluded for the same
  reason; the ratio printed beside each one is the result.

`@storybook/test-runner` is deliberately not used: version 0.24 can't load its
config under Storybook 10.6, because Jest 30 rejects `module.register()`.

AI and automated tools miss things. Confirm every proposal with VoiceOver,
NVDA, JAWS and keyboard-only testing before shipping.

## Known limitations

- The fuse, platform and blitz repositories aren't part of this workspace, so
  "production" snippets are reconstructed from the Linear descriptions. Their
  captions say so.
- Without `VITE_GOOGLE_MAPS_API_KEY`, the Hotel Map item shows marker source
  code instead of a live map.
- Cross-checks apply each specialist agent's written rules; they are not a
  substitute for assistive-technology testing.

## Linear

Linear is the source of truth. Issue content was read on 2026-09-17 and nothing
here writes back to Linear. To refresh an issue, re-pull its description into
`ENG-XXXX.linear.md` and update its story file — see
[`src/ada/_kit/AUTHORING.md`](src/ada/_kit/AUTHORING.md), which documents the
component contract, the agent roster and the kit components.

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to
`main`; `.github/workflows/a11y.yml` runs the accessibility check on every pull
request. Push from the **epprestodesign** account only.
