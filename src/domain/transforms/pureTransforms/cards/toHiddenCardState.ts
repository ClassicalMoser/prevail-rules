import type { HiddenCardState, OwnedCardState } from '@entities';

/**
 * Converts an owned card slice to the hidden perspective: hand and awaiting-play
 * identities become {@link HiddenCard} placeholders; already-public piles stay.
 */
export function toHiddenCardState(owned: OwnedCardState): HiddenCardState {
  return {
    awaitingPlay: owned.awaitingPlay === null ? null : 'hidden',
    burnt: owned.burnt,
    discarded: owned.discarded,
    inHand: owned.inHand.map(() => 'hidden' as const),
    inPlay: owned.inPlay,
    played: owned.played,
  };
}
