import type { Board } from "@entities";
import type { CompletePlayCardsPhaseEvent } from "@events";
import type { GameState, GameStateForBoard, MoveCommandersPhaseState } from "@game";
import { MOVE_COMMANDERS_PHASE } from "@game";

import { getPlayCardsPhaseState } from "@queries";
import { addCompletedPhase, updatePhaseState } from "@transforms/pureTransforms";

/**
 * Applies a CompletePlayCardsPhaseEvent to the game state.
 * Records the current phase state as completed and advances to moveCommanders phase.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`). The
 * current phase state is read only to snapshot it into `completedPhases`.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompletePlayCardsPhaseEvent<TBoard extends Board>(
  _event: CompletePlayCardsPhaseEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Safe type broadening: No spatial information on PlayCardsPhaseState
  const phaseState = getPlayCardsPhaseState(state as GameState);

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = addCompletedPhase(state, phaseState);

  // Create the new move commanders phase state
  const newPhaseState: MoveCommandersPhaseState = {
    phase: MOVE_COMMANDERS_PHASE,
    step: "moveFirstCommander",
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
