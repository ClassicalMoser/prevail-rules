import type { HiddenCard } from '@entities';
import type { HiddenCardState } from '@game';

function hiddenPlaceholder(): HiddenCard {
  return 'hidden';
}

/**
 * Returns remaining played and discarded cards to an unowned player's hand.
 * Those piles are public, but once they re-enter the hand their identities
 * become {@link HiddenCard} placeholders. Existing hand placeholders stay first.
 *
 * @param hidden - The opponent's current hidden card state
 * @returns New hidden card state with played and discarded emptied into the hand
 */
export function returnHiddenCardsToHand(
  hidden: HiddenCardState,
): HiddenCardState {
  const playedPlaceholders = hidden.played.map(hiddenPlaceholder);
  const discardedPlaceholders = hidden.discarded.map(hiddenPlaceholder);
  const inHand = [
    ...hidden.inHand,
    ...playedPlaceholders,
    ...discardedPlaceholders,
  ];
  const next: HiddenCardState = {
    ...hidden,
    discarded: [],
    inHand,
    played: [],
  };
  return next;
}
