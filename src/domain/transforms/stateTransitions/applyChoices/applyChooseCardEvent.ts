import type { ChooseCardEvent } from '@events';
import type {
  GameState,
  GameStateForVisibility,
  PlayCardsPhaseState,
} from '@game';
import { getPlayCardsPhaseState } from '@queries';
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
 * Trusts authoritative visibility for owned card slices.
 */
export function applyChooseCardEvent(
  event: ChooseCardEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const { player, card } = event;
  const currentPhaseState: PlayCardsPhaseState =
    getPlayCardsPhaseState(authoritative);

  const stateWithUpdatedPlayer = updatePlayerCardState(
    authoritative,
    player,
    chooseCard(authoritative.cardState[player], card),
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
