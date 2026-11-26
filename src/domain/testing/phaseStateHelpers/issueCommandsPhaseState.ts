import type { GameState, IssueCommandsPhaseState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

/**
 * Creates an IssueCommandsPhaseState with sensible defaults.
 *
 * TODO(composition): the state is never read; the defaults are the same for
 * every game. Callers in some sixty specs pass one anyway. To settle: drop the
 * parameter and update the callers, or say what it is for.
 */
export function createIssueCommandsPhaseState(
  _state: GameState,
  overrides?: Partial<IssueCommandsPhaseState>,
): IssueCommandsPhaseState {
  const issueCommands: IssueCommandsPhaseState = {
    // No order is under way yet; a spec about one passes it here.
    currentCommandResolutionState: 'pending',
    phase: ISSUE_COMMANDS_PHASE,
    // Nobody is left waiting to act on either side's order, so a spec names
    // the units an order still has to carry.
    remainingUnitsFirstPlayer: [],
    remainingUnitsSecondPlayer: [],
    // The first player carries out the orders it issued, before the second
    // player issues any (§4.3).
    step: 'firstPlayerResolveCommands',
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return issueCommands;
}
