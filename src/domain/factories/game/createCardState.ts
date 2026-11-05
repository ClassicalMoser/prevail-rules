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
 * A side left out starts empty.
 *
 * @param black - Black's piles
 * @param white - White's piles
 * @returns The authoritative card state
 */
export function createCardState(
  black?: OwnedCardState,
  white?: OwnedCardState,
): AuthoritativeCardState {
  return {
    black: black ?? createOwnedCardState(),
    visibility: 'authoritative',
    white: white ?? createOwnedCardState(),
  };
}
