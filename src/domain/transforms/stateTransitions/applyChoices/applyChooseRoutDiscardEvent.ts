import type { Board } from "@entities";
import type { ChooseRoutDiscardEvent } from "@events";
import type { GameStateForBoard } from "@game";
import { getCurrentRallyResolutionState, getRoutStateFromRally } from "@queries";
import { updateRoutState } from "@transforms/pureTransforms";

/**
 * Applies a ChooseRoutDiscardEvent to the game state.
 * Marks that the player has chosen which cards to discard for rout penalty.
 * Event is assumed pre-validated (cleanup phase, resolveRally step, player has rout state).
 *
 * @param event - The choose rout discard event to apply
 * @param state - The current game state
 * @returns A new game state with the rout discard choice recorded
 */
export function applyChooseRoutDiscardEvent<TBoard extends Board>(
  event: ChooseRoutDiscardEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Find the relevant game states for this event
  const rallyState = getCurrentRallyResolutionState(state);
  const routState = getRoutStateFromRally(rallyState);

  // Update the rout state with cardsChosen set to true (step unchanged; awaiting ResolveRoutDiscardEvent)
  const updatedRoutState = {
    ...routState,
    cardsChosen: true,
  };

  // Update the rout state with the new cards chosen
  const newGameState = updateRoutState(state, updatedRoutState);
  // Return the new game state with the updated rout state
  return newGameState;
}
