# ADA / WCAG 2.1 AA Compliance — Storybook

A Storybook that walks through every issue in the Linear project
[**ADA / WCAG 2.1 AA Compliance**](https://linear.app/eventpipe/project/ada-wcag-21-aa-compliance-8122fef6668b)
(33 issues across 6 epics). For each one it shows what Linear flags, how the
same element looks in the Presto redesign today, and the proposed fix.

- **Stack:** Vue 3 · Quasar 2 · Storybook 10.6 · Vite 6 · pnpm (the same engine as
  [presto-2026](https://github.com/epprestodesign/presto-2026))
- **Design system:** Presto DS, vendored from presto-2026 into `src/presto/`
- **Cross-check:** [Community-Access/accessibility-agents](https://github.com/Community-Access/accessibility-agents),
  enabled at project scope in `.claude/settings.json`

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

Every issue component has three stories:

| Story | Shows |
|---|---|
| **Issue** | Each numbered problem from Linear, with the production file:line, the flawed pattern, a contrast readout, and an accessibility-agents cross-check |
| **Before** | The matching presto-2026 element, rendered from real DS components, with a verdict: still present / partial / already handled / no equivalent yet |
| **Proposal** | Option A = the Linear acceptance-criteria fix (live demo + code), plus agent-suggested alternates where they add value |

Only the ADA stories appear in the sidebar. The presto-2026 source is there so
the Before stories can render it.

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

## Linear

Linear is the source of truth. Issue content was read on 2026-09-17 and
nothing here writes back to Linear. To refresh an issue, re-pull its
description into `ENG-XXXX.linear.md` and update its story file (see
`src/ada/_kit/AUTHORING.md`).

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages
(`https://epprestodesign.github.io/ada-wcag-aa-compliance/`) on every push to
`main`. Push from the **epprestodesign** account only.
