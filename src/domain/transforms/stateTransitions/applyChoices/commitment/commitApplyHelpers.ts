import type { CommandCard, PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import { getTopDiscardedCard } from '@queries';
import {
  discardCardsFromHand,
  discardShownCardFromHiddenHand,
  updatePlayerCards,
} from '@transforms/pureTransforms';

/**
 * The commitment a choice settles, read once its card has been discarded: a
 * refusal declines, and a committed card is the one now on top of the
 * player's discard pile. That is the state's own copy, the hand's where the
 * hand is in view and the shown card where it is not, so the commitment holds
 * what the card prints rather than what the choice claimed.
 *
 * @param discarded - The state after `applyCommitCardDiscard`
 * @param player - The player committing
 * @param committedCard - The choice's card, or `'none'` for a refusal
 * @returns The settled commitment
 */
export function commitmentFromCommittedCard(
  discarded: GameState,
  player: PlayerSide,
  committedCard: CommandCard | 'none',
): Commitment {
  // A refusal spends no card and declines the commitment.
  if (committedCard === 'none') {
    const declined: Commitment = { commitmentType: 'declined' };
    return declined;
  }

  // The card committed is the one the hand gave up to the discard pile.
  const completed: Commitment = {
    card: getTopDiscardedCard(discarded, player),
    commitmentType: 'completed',
  };
  return completed;
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
  committedCard: CommandCard | 'none',
): S {
  if (committedCard === 'none') {
    return state;
  }

  const committed = updatePlayerCards(state, player, {
    hidden: (hidden) => discardShownCardFromHiddenHand(hidden, committedCard),
    owned: (owned) => discardCardsFromHand(owned, [committedCard.id]),
  });
  return committed;
}
