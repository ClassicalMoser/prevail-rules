import type { ChooseCardEvent, ProjectedChooseCardEvent } from '@events';
import type { GameState, PlayCardsPhaseState } from '@game';
import {
  getHiddenPlayerCardState,
  getOwnedPlayerCardState,
  getPlayCardsPhaseState,
} from '@queries';
import {
  chooseCard,
  chooseHiddenCard,
  replaceHiddenPlayerCardState,
  replaceOwnedPlayerCardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

type ChooseCardApplyEvent = ChooseCardEvent | ProjectedChooseCardEvent;

function advanceIfBothChosen<S extends GameState>(
  state: S,
  currentPhaseState: PlayCardsPhaseState,
): S {
  const bothPlayersChosen =
    state.cardState.black.awaitingPlay !== null &&
    state.cardState.white.awaitingPlay !== null;

  if (!bothPlayersChosen) {
    return updatePhaseState(state, currentPhaseState);
  }

  return updatePhaseState(state, {
    ...currentPhaseState,
    step: 'revealCards',
  });
}

/**
 * Applies a choose-card event to authoritative or seat-visible state.
 *
 * Concrete cards use the owned slice; `'hidden'` uses the unowned slice via
 * {@link chooseHiddenCard}. Ownership is proven by
 * {@link getOwnedPlayerCardState} / {@link getHiddenPlayerCardState}.
 */
export function applyChooseCardEvent<S extends GameState>(
  event: ChooseCardApplyEvent,
  state: S,
): S {
  const { player, card } = event;
  const currentPhaseState: PlayCardsPhaseState = getPlayCardsPhaseState(state);

  if (card === 'hidden') {
    const hiddenSlice = getHiddenPlayerCardState(state.cardState, player);
    const stateWithUpdatedPlayer = {
      ...state,
      cardState: replaceHiddenPlayerCardState(
        state.cardState,
        player,
        chooseHiddenCard(hiddenSlice),
      ),
    };
    return advanceIfBothChosen(stateWithUpdatedPlayer, currentPhaseState);
  }

  const ownedCardState = getOwnedPlayerCardState(state.cardState, player);
  const stateWithUpdatedPlayer = {
    ...state,
    cardState: replaceOwnedPlayerCardState(
      state.cardState,
      player,
      chooseCard(ownedCardState, card),
    ),
  };
  return advanceIfBothChosen(stateWithUpdatedPlayer, currentPhaseState);
}
