import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { ChooseCardEvent } from '@events';
import { getPlayCardsPhaseState } from '@queries';
import {
  chooseCard,
  updateCardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseCardEvent to the game state.
 * Moves the chosen card from the player's hand to awaitingPlay.
 * If both players have now chosen cards, advances the step to 'revealCards'.
 *
 * @param event - The choose card event to apply
 * @param state - The current game state
 * @returns A new game state with the card chosen
 */
export function applyChooseCardEvent<TBoard extends Board>(
  event: ChooseCardEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, card } = event;
  const currentPhaseState: PlayCardsPhaseState = getPlayCardsPhaseState(state);

  // Choose the card
  const newCardState = chooseCard(state.cardState, player, card);
  // Update the card state
  const stateWithUpdatedPlayer = updateCardState(state, newCardState);

  // Check if both players have now chosen cards
  const bothPlayersChosen =
    newCardState.black.awaitingPlay !== null &&
    newCardState.white.awaitingPlay !== null;

  // If both players have chosen, advance step to revealCards
  const newPhaseState: PlayCardsPhaseState = bothPlayersChosen
    ? {
        ...currentPhaseState,
        step: 'revealCards',
      }
    : currentPhaseState;

  return updatePhaseState(stateWithUpdatedPlayer, newPhaseState);
}
