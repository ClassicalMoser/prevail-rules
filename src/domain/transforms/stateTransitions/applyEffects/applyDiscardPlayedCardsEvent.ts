import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { DiscardPlayedCardsEvent } from '@events';
import { getCleanupPhaseState } from '@queries';
import {
  moveCardToPlayed,
  updateCardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

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
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCleanupPhaseState(state);

  // Move both players' cards from inPlay to played pile
  let newCardState = state.cardState;
  newCardState = moveCardToPlayed(newCardState, 'white');
  newCardState = moveCardToPlayed(newCardState, 'black');

  // Advance to firstPlayerChooseRally step
  const newPhaseState: CleanupPhaseState = {
    ...phaseState,
    step: 'firstPlayerChooseRally',
  };

  const stateWithCards = updateCardState(state, newCardState);
  return updatePhaseState(stateWithCards, newPhaseState);
}
