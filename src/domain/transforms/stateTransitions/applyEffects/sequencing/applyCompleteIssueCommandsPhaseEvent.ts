import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { createOpenedResolveMeleePhaseState } from '@factories';
import type { GameState } from '@game';

import { getCurrentPhaseState } from '@queries';
import {
  addCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteIssueCommandsPhaseEvent to the game state.
 * Records the current phase state as completed and advances to resolveMelee phase.
 * Uses `remainingEngagements` from the event (procedure / machine-generated log).
 *
 * Phase and step are not re-validated here; the event is trusted from the procedure /
 * machine-generated log.
 *
 * @param event - The complete issue commands phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteIssueCommandsPhaseEvent<S extends GameState>(
  event: CompleteIssueCommandsPhaseEvent,
  state: S,
): S {
  // Both players' orders are carried out, so Phase 3 goes on the round's
  // record of finished phases.
  // TODO(composition): its siblings insist on their own phase
  // (`getPlayCardsPhaseState`, `getMoveCommandersPhaseState`,
  // `getResolveMeleePhaseState`); this records whatever phase is current.
  // Settle by `getIssueCommandsPhaseState`, which would also refuse a game
  // outside Phase 3, or by saying why this one need not.
  const phaseState = getCurrentPhaseState(state);
  const stateWithCompletedPhase = addCompletedPhase(state, phaseState);

  // Phase 4 opens with every engaged space still to fight: none may be
  // skipped (§4.4.1), and none is chosen yet, since the first player picks
  // the order (§4.4.2). The procedure listed the engaged spaces on the event.
  const newPhaseState = createOpenedResolveMeleePhaseState(
    event.remainingEngagements,
  );

  // Phase 3 recorded as done, and the melee phase under way.
  const newState = updatePhaseState(stateWithCompletedPhase, newPhaseState);
  return newState;
}
