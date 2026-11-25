import type { HiddenCard } from '@entities';
import type { HiddenCardState } from '@game';

/**
 * A face-down card, standing for whichever card it replaces: once a card is
 * back in a hand this view cannot see, only its presence is known.
 *
 * @returns The hidden-card placeholder
 */
function hiddenPlaceholder(): HiddenCard {
  // Every face-down card looks the same.
  const placeholder: HiddenCard = 'hidden';
  return placeholder;
}

/**
 * Returns remaining played and discarded cards to an unowned player's hand.
 * Those piles are public, but once they re-enter the hand their identities
 * become {@link HiddenCard} placeholders. Existing hand placeholders stay first.
 *
 * The seat-view twin of `returnCardsToHand`: a rally takes the played pile,
 * less the burnt card, and the discard pile back into hand (§10.3.2), and a
 * hand is secret (§1.4). `applyResolveRallyEvent` calls it after
 * `burnHiddenCardFromPlayed`.
 *
 * @param hidden - The opponent's current hidden card state
 * @returns New hidden card state with played and discarded emptied into the hand
 */
export function returnHiddenCardsToHand(
  hidden: HiddenCardState,
): HiddenCardState {
  // Each returning card turns face down as it joins the hand: the seat saw
  // which cards they were, but no longer sees where they lie in the hand.
  const playedPlaceholders = hidden.played.map(hiddenPlaceholder);
  const discardedPlaceholders = hidden.discarded.map(hiddenPlaceholder);
  const inHand = [
    ...hidden.inHand,
    ...playedPlaceholders,
    ...discardedPlaceholders,
  ];

  // Both piles are empty after a rally; the burnt pile never returns.
  const next: HiddenCardState = {
    ...hidden,
    discarded: [],
    inHand,
    played: [],
  };
  return next;
}
