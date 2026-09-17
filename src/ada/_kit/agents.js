// Specialists from Community-Access/accessibility-agents used to cross-check
// each Linear finding. Installed at project scope (.claude/settings.json).
// Descriptions are condensed from each agent's own frontmatter.
export const AGENTS_REPO = 'https://github.com/Community-Access/accessibility-agents'
export const AGENTS_VERSION = '3.2.0'

export const AGENTS = {
  'accessibility-lead': {
    name: 'accessibility-lead',
    focus: 'Orchestrator — routes UI work to the specialist team and runs the final review.',
  },
  'aria-specialist': {
    name: 'aria-specialist',
    focus: 'ARIA roles/states for interactive widgets: tabs, dialogs, comboboxes, carousels, custom controls.',
  },
  'contrast-master': {
    name: 'contrast-master',
    focus: 'Color contrast, color-only indicators, focus indicator visibility, themes.',
  },
  'design-system-auditor': {
    name: 'design-system-auditor',
    focus: 'Contrast and focus-ring compliance at the design-token source.',
  },
  'forms-specialist': {
    name: 'forms-specialist',
    focus: 'Labels, grouping, validation, error identification, multi-step wizards.',
  },
  'keyboard-navigator': {
    name: 'keyboard-navigator',
    focus: 'Keyboard operability, tab order, focus management, skip links.',
  },
  'modal-specialist': {
    name: 'modal-specialist',
    focus: 'Dialogs, alert dialogs, popovers: focus trap, focus return, escape, announcements.',
  },
  'tables-data-specialist': {
    name: 'tables-data-specialist',
    focus: 'Data table markup: caption, th scope, headers, responsive table patterns.',
  },
  'live-region-controller': {
    name: 'live-region-controller',
    focus: 'Status messages, loading states, timers, results counts, async feedback.',
  },
  'alt-text-headings': {
    name: 'alt-text-headings',
    focus: 'Alt text (meaningful vs decorative), heading hierarchy, landmarks.',
  },
  'link-checker': {
    name: 'link-checker',
    focus: 'Link purpose — vague link text, new-window warnings.',
  },
  'cognitive-accessibility': {
    name: 'cognitive-accessibility',
    focus: 'Plain language, predictable behavior, timing and error-recovery support.',
  },
}
