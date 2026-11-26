import type { IssueCommandsPhaseState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

/**
 * Phase 3 as it opens: the first player issues all their commands before
 * the second player issues any (§4.3). No unit has been ordered, so neither player has a unit still to
 * act, and no move or shot is under way.
 *
 * @returns The Issue Commands phase, on its first step
 */
export function createOpenedIssueCommandsPhaseState(): IssueCommandsPhaseState {
  // The first player orders first; their units are carried out before the
  // second player issues anything.
  const issueCommands: IssueCommandsPhaseState = {
    currentCommandResolutionState: 'pending',
    phase: ISSUE_COMMANDS_PHASE,
    remainingUnitsFirstPlayer: [],
    remainingUnitsSecondPlayer: [],
    step: 'firstPlayerIssueCommands',
  };

  // The phase, open and nobody yet ordered.
  return issueCommands;
}
