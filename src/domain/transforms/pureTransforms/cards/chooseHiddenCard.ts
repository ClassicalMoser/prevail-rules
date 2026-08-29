import type { HiddenCardState } from '@game';

/**
 * Moves one `'hidden'` placeholder from hand to awaitingPlay for an unowned seat.
 */
export function chooseHiddenCard(hidden: HiddenCardState): HiddenCardState {
  if (hidden.awaitingPlay !== null) {
    throw new Error('Hidden player already has a card awaiting play');
  }
  if (hidden.inHand.length === 0) {
    throw new Error('No hidden card available in hand');
  }

  return {
    ...hidden,
    awaitingPlay: 'hidden',
    inHand: hidden.inHand.slice(1),
  };
}
