import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { createOpenedResolveMeleePhaseState } from '@factories';
import type { GameState } from '@game';

import { getIssueCommandsPhaseState } from '@queries';
import {
  addCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteIssueCommandsPhaseEvent to the game state.
 * Records the current phase state as completed and advances to resolveMelee phase.
 * Uses `remainingEngagements` from the event (procedure / machine-generated log).
 *
 * Phase is narrowed via {@link getIssueCommandsPhaseState} (throws if not
 * `issueCommands`); the step is not re-validated.
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
  // Only Issue Commands ends here; the read throws in any other phase.
  const phaseState = getIssueCommandsPhaseState(state);
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
