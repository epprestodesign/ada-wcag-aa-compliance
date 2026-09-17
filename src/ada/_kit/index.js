// Audit kit — shared building blocks for every ADA issue story.
import AdaIssue from './AdaIssue.vue'
import AdaItem from './AdaItem.vue'
import AgentCheck from './AgentCheck.vue'
import AdaBefore from './AdaBefore.vue'
import AdaOption from './AdaOption.vue'
import AdaCode from './AdaCode.vue'
import ContrastPair from './ContrastPair.vue'
import SrOutput from './SrOutput.vue'
import AdaMarkdown from './AdaMarkdown.vue'
import * as issuesModule from './issues.js'

export { AdaIssue, AdaItem, AgentCheck, AdaBefore, AdaOption, AdaCode, ContrastPair, SrOutput, AdaMarkdown }
export * from './issues.js'
export * from './agents.js'

/** Components object to spread into a story's `components`. */
export const kit = { AdaIssue, AdaItem, AgentCheck, AdaBefore, AdaOption, AdaCode, ContrastPair, SrOutput }

/**
 * Standard `parameters` for an issue file. Storybook needs `title` and `tags`
 * as literals in each story file, so only parameters come from here:
 *   export default {
 *     title: 'Epic 1 – fuse/ADA-FUSE-03 – Contracted Hotel Details & Room Rates',
 *     tags: ['autodocs'],
 *     parameters: issueParams('ENG-2925'),
 *   }
 */
export function issueParams(id, { description = '' } = {}) {
  const i = issuesModule.issue(id)
  return {
    layout: 'fullscreen',
    linear: i.url,
    docs: {
      description: {
        component:
          `**${i.id} · ${i.key}** — ${i.title}  \n` +
          `Priority **${i.priority}** · Status **${i.status}** · WCAG ${i.wcag.join(', ')} · ` +
          `[Open in Linear](${i.url})\n\n` +
          'Stories: **Issue** (Linear findings + agent cross-check) → **Before** (presto-2026 today) → **Proposal** (Linear fix + agent alternates).' +
          (description ? `\n\n${description}` : ''),
      },
    },
  }
}

/**
 * Story parameters for each view. Before stories document existing defects,
 * so axe findings there are expected; Proposal stories should be clean.
 */
export const VIEW_PARAMS = {
  issue: { docs: { description: { story: 'What Linear reports for each item, with the accessibility-agents cross-check.' } } },
  before: {
    docs: { description: { story: 'The matching element in presto-2026 today (Storybook / prototype). Axe findings here are expected — they document the defect.' } },
  },
  proposal: { docs: { description: { story: 'Option A is the Linear acceptance-criteria fix; B/C are agent-suggested alternates. These should pass axe.' } } },
}
