import type { Board } from "@entities";
import type { DiscardPlayedCardsEvent } from "@events";
import type { CleanupPhaseState, GameStateWithBoard } from "@game";
import { getCleanupPhaseState } from "@queries";
import { moveCardToPlayed, updateCardState, updatePhaseState } from "@transforms/pureTransforms";

/**
 * Applies a DiscardPlayedCardsEvent to the game state.
 * Moves both players' cards from inPlay to played pile.
 * Advances the cleanup phase step to `firstPlayerChooseRally`, preserving other cleanup
 * fields from the current phase state when present.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getCleanupPhaseState` (throws if not `cleanup`).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with cards moved to played pile
 */
export function applyDiscardPlayedCardsEvent<TBoard extends Board>(
  _event: DiscardPlayedCardsEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const phaseState = getCleanupPhaseState(state);

  const stateWithCards = updateCardState(state, (current) =>
    moveCardToPlayed(moveCardToPlayed(current, "white"), "black"),
  );

  const newPhaseState: CleanupPhaseState = {
    ...phaseState,
    step: "firstPlayerChooseRally",
  };

  return updatePhaseState(stateWithCards, newPhaseState);
}
