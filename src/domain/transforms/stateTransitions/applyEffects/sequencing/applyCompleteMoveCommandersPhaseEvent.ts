import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type {
  GameState,
  IssueCommandsPhaseState,
  MoveCommandersPhaseState,
} from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { getMoveCommandersPhaseState } from '@queries';
import {
  addCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteMoveCommandersPhaseEvent to the game state.
 * Records the current move-commanders phase as completed and advances to the
 * issue commands phase, with the initiative player issuing first.
 *
 * Phase is narrowed via {@link getMoveCommandersPhaseState} (throws if not `moveCommanders`).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteMoveCommandersPhaseEvent<S extends GameState>(
  _event: CompleteMoveCommandersPhaseEvent,
  state: S,
): S {
  // Safe type broadening: No spatial information on MoveCommandersPhaseState
  const currentPhaseState: MoveCommandersPhaseState =
    getMoveCommandersPhaseState(state);

  const stateWithCompletedPhase = addCompletedPhase(state, currentPhaseState);

  const newPhaseState: IssueCommandsPhaseState = {
    currentCommandResolutionState: 'pending',
    phase: ISSUE_COMMANDS_PHASE,
    remainingUnitsFirstPlayer: [],
    remainingUnitsSecondPlayer: [],
    step: 'firstPlayerIssueCommands',
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
