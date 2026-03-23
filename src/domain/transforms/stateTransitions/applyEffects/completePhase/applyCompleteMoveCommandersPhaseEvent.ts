import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { getMoveCommandersPhaseState } from '@queries';
import {
  addCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteMoveCommandersPhaseEvent to the game state.
 * Records the current move-commanders phase as completed and advances to issueCommands phase.
 * Uses `remainingCommandsFirstPlayer` and `remainingCommandsSecondPlayer` from the event
 * (initiative / non-initiative order, same as issue-commands phase fields).
 *
 * Phase is narrowed via `getMoveCommandersPhaseState` (throws if not `moveCommanders`).
 *
 * @param event - The complete move commanders phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteMoveCommandersPhaseEvent<TBoard extends Board>(
  event: CompleteMoveCommandersPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = getMoveCommandersPhaseState(state);

  const stateWithCompletedPhase = addCompletedPhase(state, currentPhaseState);

  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    phase: ISSUE_COMMANDS_PHASE,
    step: 'firstPlayerIssueCommands',
    remainingCommandsFirstPlayer: event.remainingCommandsFirstPlayer,
    remainingUnitsFirstPlayer: new Set(),
    remainingCommandsSecondPlayer: event.remainingCommandsSecondPlayer,
    remainingUnitsSecondPlayer: new Set(),
    currentCommandResolutionState: undefined,
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
