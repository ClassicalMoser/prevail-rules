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
 * Advances the cleanup phase step from 'discardPlayedCards' to 'firstPlayerChooseRally'.
 *
 * @param event - The discard played cards event to apply
 * @param state - The current game state
 * @returns A new game state with cards moved to played pile
 */
export function applyDiscardPlayedCardsEvent<TBoard extends Board>(
  event: DiscardPlayedCardsEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCleanupPhaseState(state);

  if (phaseState.step !== 'discardPlayedCards') {
    throw new Error('Cleanup phase is not on discardPlayedCards step');
  }

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
