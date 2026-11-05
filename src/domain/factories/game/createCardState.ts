import type { AuthoritativeCardState, OwnedCardState } from '@game';
import { createOwnedCardState } from './createOwnedCardState';

/**
 * An authoritative card state from up to two players' piles, black first.
 *
 * Authoritative because that is the state an engine creates. A seat's view or a
 * spectator's is derived from it by `projectGameForVisibility`, never built:
 * `HiddenCardState.inHand` holds the `'hidden'` sentinel, so an empty hidden
 * hand could not be told from an empty owned one anyway.
 *
 * A side left out starts empty. Named rather than positional: two owned card
 * states are the same shape, so an order would have to be remembered.
 *
 * @param sides - The piles to set, per side
 * @returns The authoritative card state
 */
export function createCardState(sides?: {
  black?: OwnedCardState;
  white?: OwnedCardState;
}): AuthoritativeCardState {
  return {
    black: sides?.black ?? createOwnedCardState(),
    visibility: 'authoritative',
    white: sides?.white ?? createOwnedCardState(),
  };
}
