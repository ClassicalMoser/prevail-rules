import type { Board } from "@entities";
import type { ResolveInitiativeEvent } from "@events";
import type { GameState, GameStateForBoard } from "@game";
import { getPlayCardsPhaseState } from "@queries";
import {
  markPhaseAsComplete,
  updateCurrentInitiativeForBoard,
  updatePhaseState,
} from "@transforms/pureTransforms";

/**
 * Applies a ResolveInitiativeEvent to the game state.
 * Sets the player who has initiative for this round and advances the play cards phase
 * step to `complete`.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`).
 *
 * @param event - The resolve initiative event to apply
 * @param state - The current game state
 * @returns A new game state with initiative assigned
 */
export function applyResolveInitiativeEvent<TBoard extends Board>(
  event: ResolveInitiativeEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Safe broad type cast because we know the event is for the board type
  const phaseState = getPlayCardsPhaseState(state as GameState);

  // Advance to complete step
  const newPhaseState = markPhaseAsComplete(phaseState);

  // Safe broad type cast because we know the event is for the board type
  const stateWithInitiative = updateCurrentInitiativeForBoard(state, event.player);
  const stateWithPhase = updatePhaseState(stateWithInitiative, newPhaseState);

  return stateWithPhase;
}
