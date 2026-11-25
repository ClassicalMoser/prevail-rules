import type { CommandCard, PlayerSide } from '@entities';
import type { Commitment, GameState } from '@game';
import { getTopDiscardedCard } from '@queries';
import { isNone } from '@utils';
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
  if (isNone(committedCard)) {
    const declined: Commitment = { commitmentType: 'declined' };

    // The moment goes on without a bonus.
    return declined;
  }

  // The card committed is the one the hand gave up to the discard pile.
  const completed: Commitment = {
    card: getTopDiscardedCard(discarded, player),
    commitmentType: 'completed',
  };

  // Worth +1 to each stat the card names, read where the commitment is used
  // (§8.2).
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
  // Commitment is always optional (§8.3): a refusal leaves the hand as it was.
  if (isNone(committedCard)) {
    return state;
  }

  // The card leaves the hand for the discard pile, where it waits for the
  // next rally (§8.1). Where the hand is in view the hand's own copy is the
  // one moved; where it is hidden the shown card is the only copy there is.
  const committed = updatePlayerCards(state, player, {
    hidden: (hidden) => discardShownCardFromHiddenHand(hidden, committedCard),
    owned: (owned) => discardCardsFromHand(owned, [committedCard.id]),
  });

  // The hand is one card smaller, and that card is on top of the discard pile
  // for `commitmentFromCommittedCard` to read.
  return committed;
}
