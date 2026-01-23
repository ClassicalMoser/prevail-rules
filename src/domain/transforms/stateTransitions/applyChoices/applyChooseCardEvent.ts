import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { ChooseCardEvent } from '@events';
import { getOtherPlayer, getPlayCardsPhaseState } from '@queries';
import {
  updatePhaseState,
  updatePlayerCardState,
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
  const currentPhaseState = getPlayCardsPhaseState(state);

  if (currentPhaseState.step !== 'chooseCards') {
    throw new Error('Play cards phase is not on chooseCards step');
  }

  const oldHand = state.cardState[player].inHand;
  const newHand = oldHand.filter((c) => c.id !== card.id);

  // Update player's card state
  const stateWithUpdatedPlayer = updatePlayerCardState(state, player, {
    ...state.cardState[player],
    inHand: newHand,
    awaitingPlay: card,
  });

  // Check if both players have now chosen cards
  const otherPlayer = getOtherPlayer(player);
  const otherPlayerAwaitingCard =
    stateWithUpdatedPlayer.cardState[otherPlayer].awaitingPlay;
  const bothPlayersChosen = otherPlayerAwaitingCard !== null;

  // If both players have chosen, advance step to revealCards
  const newPhaseState: PlayCardsPhaseState = bothPlayersChosen
    ? {
        ...currentPhaseState,
        step: 'revealCards',
      }
    : currentPhaseState;

  return updatePhaseState(stateWithUpdatedPlayer, newPhaseState);
}
