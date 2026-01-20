import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { ChooseCardEvent } from '@events';
import { getOtherPlayer } from '@queries';

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
  event: ChooseCardEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, card } = event;
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'playCards') {
    throw new Error('Current phase is not playCards');
  }

  if (currentPhaseState.step !== 'chooseCards') {
    throw new Error('Play cards phase is not on chooseCards step');
  }

  // Validate player hasn't already chosen
  if (state.cardState[player].awaitingPlay !== null) {
    throw new Error(`Player ${player} has already chosen a card`);
  }

  const oldHand = state.cardState[player].inHand;
  const newHand = oldHand.filter((c) => c.id !== card.id);
  const newPlayerCardState = {
    ...state.cardState[player],
    inHand: newHand,
    awaitingPlay: card,
  };

  const newCardState = {
    ...state.cardState,
    [player]: newPlayerCardState,
  };

  // Check if both players have now chosen cards
  const otherPlayer = getOtherPlayer(player);
  const otherPlayerAwaitingCard = newCardState[otherPlayer].awaitingPlay;
  const bothPlayersChosen = otherPlayerAwaitingCard !== null;

  // If both players have chosen, advance step to revealCards
  const newPhaseState: PlayCardsPhaseState = bothPlayersChosen
    ? {
        ...currentPhaseState,
        step: 'revealCards',
      }
    : currentPhaseState;

  return {
    ...state,
    cardState: newCardState,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
