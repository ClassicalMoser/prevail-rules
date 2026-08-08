import type { HiddenCardState, PlayerSide } from '@entities';
import type { ChooseCardEvent, ProjectedChooseCardEvent } from '@events';
import type {
  GameState,
  GameStateForVisibility,
  PlayCardsPhaseState,
  UnownedPlayerForGameState,
} from '@game';
import { getOwnedPlayerCardState, getPlayCardsPhaseState } from '@queries';
import {
  chooseCard,
  chooseHiddenCard,
  updateHiddenPlayerCardState,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

type ChooseCardApplyEvent = ChooseCardEvent | ProjectedChooseCardEvent;

function isOwnedPlayerForState(state: GameState, player: PlayerSide): boolean {
  const { visibility } = state.cardState;
  if (visibility === 'authoritative') {
    return true;
  }
  if (visibility === 'whiteSeen') {
    return player === 'white';
  }
  return player === 'black';
}

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

function applyUnownedChooseCard<
  S extends
    | GameStateForVisibility<'whiteSeen'>
    | GameStateForVisibility<'blackSeen'>,
>(
  event: ProjectedChooseCardEvent & {
    player: UnownedPlayerForGameState<S>;
  },
  state: S,
  currentPhaseState: PlayCardsPhaseState,
): S {
  if (event.card !== 'hidden') {
    throw new Error(
      'Unowned chooseCard apply requires a projected event with card: hidden',
    );
  }

  const hiddenSlice = state.cardState[event.player] as HiddenCardState;
  const chosenHidden = chooseHiddenCard(hiddenSlice);
  const stateWithUpdatedPlayer = updateHiddenPlayerCardState(
    state,
    event.player,
    chosenHidden,
  );

  return advanceIfBothChosen(stateWithUpdatedPlayer, currentPhaseState);
}

/**
 * Applies a choose-card event to authoritative or seat-visible state.
 *
 * Owned seats use the full card identity. Unowned seats on seen views apply a
 * projected event (`card: 'hidden'`) via {@link chooseHiddenCard}.
 */
export function applyChooseCardEvent<S extends GameState>(
  event: ChooseCardApplyEvent,
  state: S,
): S {
  const { player, card } = event;
  const currentPhaseState: PlayCardsPhaseState = getPlayCardsPhaseState(state);

  if (isOwnedPlayerForState(state, player)) {
    if (card === 'hidden') {
      throw new Error(
        'Owned chooseCard apply requires a concrete CommandCard, not hidden',
      );
    }
    const ownedCardState = getOwnedPlayerCardState(state.cardState, player);
    const chosenCard = chooseCard(ownedCardState, card);
    const stateWithUpdatedPlayer = updatePlayerCardState(
      state,
      player,
      chosenCard,
    );
    return advanceIfBothChosen(stateWithUpdatedPlayer, currentPhaseState);
  }

  if (
    state.cardState.visibility !== 'whiteSeen' &&
    state.cardState.visibility !== 'blackSeen'
  ) {
    throw new Error('Unowned chooseCard apply requires a seen visibility state');
  }

  return applyUnownedChooseCard(
    event as ProjectedChooseCardEvent & {
      player: UnownedPlayerForGameState<
        | GameStateForVisibility<'whiteSeen'>
        | GameStateForVisibility<'blackSeen'>
      >;
    },
    state as S &
      (
        | GameStateForVisibility<'whiteSeen'>
        | GameStateForVisibility<'blackSeen'>
      ),
    currentPhaseState,
  );
}
