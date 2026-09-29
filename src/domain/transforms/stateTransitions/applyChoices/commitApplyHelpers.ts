import type { CommandCard, PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import { getOwnedPlayerCardState } from '@queries';
import {
  discardCardsFromHand,
  replaceOwnedPlayerCardState,
} from '@transforms/pureTransforms';

export function commitmentFromCommittedCard(
  committedCard: CommandCard | null,
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
 * Concrete cards are discarded from the owned slice.
 * Ownership is proven by {@link getOwnedPlayerCardState}
 * (visibility discriminant — no casts).
 */
export function applyCommitCardDiscard<S extends GameState>(
  state: S,
  player: PlayerSide,
  committedCard: CommandCard | null,
): S {
  if (committedCard === null) {
    return state;
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
