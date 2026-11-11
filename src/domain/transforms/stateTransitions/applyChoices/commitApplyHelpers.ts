import type { CommandCard, PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import {
  discardCardsFromHand,
  discardShownCardFromHiddenHand,
  updatePlayerCards,
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

  const committed = updatePlayerCards(state, player, {
    hidden: (hidden) => discardShownCardFromHiddenHand(hidden, committedCard),
    owned: (owned) => discardCardsFromHand(owned, [committedCard.id]),
  });
  return committed;
}
