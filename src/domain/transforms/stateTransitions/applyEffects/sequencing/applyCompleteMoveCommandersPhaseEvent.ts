import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { createOpenedIssueCommandsPhaseState } from '@factories';
import type { GameState, MoveCommandersPhaseState } from '@game';

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
  // TODO(misleading): nothing is broadened, and no phase state carries
  // spatial information now. The line insists the game is moving commanders,
  // and throws otherwise. Settle by rewording.
  const currentPhaseState: MoveCommandersPhaseState =
    getMoveCommandersPhaseState(state);

  // Both commanders have moved, or been passed over, so Phase 2 goes on the
  // round's record of finished phases.
  const stateWithCompletedPhase = addCompletedPhase(state, currentPhaseState);

  // Phase 3 opens with the first player issuing all their orders (§4.3).
  // No order is under way and no unit is ordered yet: each player's card in
  // play says what they may order, read when they issue.
  const newPhaseState = createOpenedIssueCommandsPhaseState();

  // Phase 2 recorded as done, and the first player to issue their orders.
  const issuing = updatePhaseState(stateWithCompletedPhase, newPhaseState);
  return issuing;
}
