import type { ChooseCardEvent } from '@events';
import type {
  GameState,
  OwnedPlayerForGameState,
  PlayCardsPhaseState,
} from '@game';
import { getOwnedPlayerCardState, getPlayCardsPhaseState } from '@queries';
import {
  chooseCard,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseCardEvent to the game state.
 * Moves the chosen card from the player's hand to awaitingPlay.
 * If both players have now chosen cards, advances the step to 'revealCards'.
 *
 * `event.player` must be owned under game state `S`.
 */
export function applyChooseCardEvent<S extends GameState>(
  event: ChooseCardEvent & { player: OwnedPlayerForGameState<S> },
  state: S,
): S {
  const { player, card } = event;
  const currentPhaseState: PlayCardsPhaseState = getPlayCardsPhaseState(state);

  const ownedCardState = getOwnedPlayerCardState(state.cardState, player);
  const chosenCard = chooseCard(ownedCardState, card);
  const stateWithUpdatedPlayer = updatePlayerCardState(
    state,
    player,
    chosenCard,
  );

  const bothPlayersChosen =
    stateWithUpdatedPlayer.cardState.black.awaitingPlay !== null &&
    stateWithUpdatedPlayer.cardState.white.awaitingPlay !== null;

  const newPhaseState: PlayCardsPhaseState = bothPlayersChosen
    ? {
        ...currentPhaseState,
        step: 'revealCards',
      }
    : currentPhaseState;

  return updatePhaseState(stateWithUpdatedPlayer, newPhaseState);
}
