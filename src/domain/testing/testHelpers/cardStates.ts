import type {
  AuthoritativeCardState,
  HiddenCardState,
  OwnedCardState,
} from '@game';

/**
 * A player's own card piles, with every pile empty unless named.
 *
 * A spec that cares about one pile says that pile. The other five are the
 * empty values a game starts from, so they carry no meaning and need no words.
 *
 * @param piles - The piles this spec is about
 * @returns The player's card state
 */
export function ownedCards(piles?: Partial<OwnedCardState>): OwnedCardState {
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

/**
 * An opponent's card piles as a seat sees them: hand and awaiting card hidden,
 * the public piles real.
 *
 * `inHand` and `awaitingPlay` hold the `'hidden'` sentinel rather than cards,
 * so a hidden hand of three is `['hidden', 'hidden', 'hidden']`.
 *
 * @param piles - The piles this spec is about
 * @returns The opponent's card state
 */
export function hiddenCards(piles?: Partial<HiddenCardState>): HiddenCardState {
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

/**
 * An authoritative card state from up to two players' piles, black first.
 *
 * Authoritative because that is the state an engine creates; a seat's or a
 * spectator's view is derived from it by `projectGameForVisibility`, not built.
 * A side left out starts empty.
 *
 * @param black - Black's piles
 * @param white - White's piles
 * @returns The authoritative card state
 */
export function cardState(
  black?: OwnedCardState,
  white?: OwnedCardState,
): AuthoritativeCardState {
  return {
    black: black ?? ownedCards(),
    visibility: 'authoritative',
    white: white ?? ownedCards(),
  };
}
