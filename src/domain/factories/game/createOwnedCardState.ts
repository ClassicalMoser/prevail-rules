import type { OwnedCardState } from '@game';

/**
 * A player's own card piles, every pile empty unless named.
 *
 * The empty values are the ones a game starts from, so a caller that cares
 * about one pile names that pile and the other five stay out of the way.
 *
 * @param piles - The piles to set
 * @returns The player's card state
 */
export function createOwnedCardState(
  piles?: Partial<OwnedCardState>,
): OwnedCardState {
  return {
    awaitingPlay: null,
    burnt: [],
    discarded: [],
    inHand: [],
    inPlay: null,
    played: [],
    ...piles,
  };
}
