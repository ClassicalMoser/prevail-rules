import { createOpenedIssueCommandsPhaseState } from '@factories';
import type { IssueCommandsPhaseState } from '@game';

/**
 * Phase 3 on the first player carrying out their orders: the phase as it
 * opens, moved on to the step where most Phase 3 specs stand.
 *
 * @param overrides - What a spec sets beyond that: the units still to act,
 * an order under way, another step
 * @returns The Issue Commands phase, to put in a game with `updatePhaseState`
 */
export function createIssueCommandsPhaseState(
  overrides?: Partial<IssueCommandsPhaseState>,
): IssueCommandsPhaseState {
  const issueCommands: IssueCommandsPhaseState = {
    // Nobody ordered and no order under way, as the phase opens; a spec names
    // the units an order still has to carry, or the order under way.
    ...createOpenedIssueCommandsPhaseState(),
    // The first player carries out the orders it issued, before the second
    // player issues any (§4.3).
    step: 'firstPlayerResolveCommands',
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return issueCommands;
}
