import type { GameState, IssueCommandsPhaseState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

/**
 * Creates an IssueCommandsPhaseState with sensible defaults.
 */
export function createIssueCommandsPhaseState(
  _state: GameState,
  overrides?: Partial<IssueCommandsPhaseState>,
): IssueCommandsPhaseState {
  return {
    currentCommandResolutionState: 'pending',
    phase: ISSUE_COMMANDS_PHASE,
    remainingUnitsFirstPlayer: [],
    remainingUnitsSecondPlayer: [],
    step: 'firstPlayerResolveCommands',
    ...overrides,
  };
}
