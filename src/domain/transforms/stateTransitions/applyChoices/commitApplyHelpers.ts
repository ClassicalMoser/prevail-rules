import type { CommandCard, HiddenCard, PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import { getHiddenPlayerCardState, getOwnedPlayerCardState } from '@queries';
import {
  discardCardsFromHand,
  discardHiddenCardFromHand,
  replaceHiddenPlayerCardState,
  replaceOwnedPlayerCardState,
} from '@transforms/pureTransforms';

export function commitmentFromCommittedCard(
  committedCard: CommandCard | HiddenCard | null,
): Commitment {
  if (committedCard === null) {
    return { commitmentType: 'declined' };
  }
  return {
    card: committedCard,
    commitmentType: 'completed',
  };
}

/**
 * Discards the committed card from the acting player's hand.
 * Concrete cards use the owned slice; `'hidden'` uses the unowned slice.
 * Ownership is proven by {@link getOwnedPlayerCardState} /
 * {@link getHiddenPlayerCardState} (visibility discriminant — no casts).
 */
export function applyCommitCardDiscard<S extends GameState>(
  state: S,
  player: PlayerSide,
  committedCard: CommandCard | HiddenCard | null,
): S {
  if (committedCard === null) {
    return state;
  }

  if (committedCard === 'hidden') {
    const hiddenSlice = getHiddenPlayerCardState(state.cardState, player);
    return {
      ...state,
      cardState: replaceHiddenPlayerCardState(
        state.cardState,
        player,
        discardHiddenCardFromHand(hiddenSlice),
      ),
    };
  }

  const ownedPlayerCardState = getOwnedPlayerCardState(state.cardState, player);
  return {
    ...state,
    cardState: replaceOwnedPlayerCardState(
      state.cardState,
      player,
      discardCardsFromHand(ownedPlayerCardState, [committedCard.id]),
    ),
  };
}
