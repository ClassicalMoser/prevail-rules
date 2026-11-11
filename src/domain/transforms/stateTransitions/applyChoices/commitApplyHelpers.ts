import type { CommandCard, PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import { findOwnedPlayerCardState, getHiddenPlayerCardState } from '@queries';
import {
  discardCardsFromHand,
  discardShownCardFromHiddenHand,
  replaceHiddenPlayerCardState,
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
 *
 * The fold follows the shape of the hand it reads. Where the hand is in view
 * (the full record, or the committing player's own seat) the card leaves it.
 * Where it is not — an opponent's seat, or a spectator's — the commitment is
 * still face up (§8), so one hidden card leaves the hand and the shown card
 * lies on the discard pile. Neither shape is a fault.
 */
export function applyCommitCardDiscard<S extends GameState>(
  state: S,
  player: PlayerSide,
  committedCard: CommandCard | null,
): S {
  if (committedCard === null) {
    return state;
  }

  const ownedPlayerCardState = findOwnedPlayerCardState(
    state.cardState,
    player,
  );
  if (ownedPlayerCardState === undefined) {
    const hiddenPlayerCardState = getHiddenPlayerCardState(
      state.cardState,
      player,
    );
    return {
      ...state,
      cardState: replaceHiddenPlayerCardState(
        state.cardState,
        player,
        discardShownCardFromHiddenHand(hiddenPlayerCardState, committedCard),
      ),
    };
  }
  return {
    ...state,
    cardState: replaceOwnedPlayerCardState(
      state.cardState,
      player,
      discardCardsFromHand(ownedPlayerCardState, [committedCard.id]),
    ),
  };
}
