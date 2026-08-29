import type { HiddenCardState } from '@game';

/**
 * Removes one `'hidden'` placeholder from an unowned seat's hand.
 * Discard pile stays unchanged — card identity is unknown on seen views.
 */
export function discardHiddenCardFromHand(
  hidden: HiddenCardState,
): HiddenCardState {
  if (hidden.inHand.length === 0) {
    throw new Error('No hidden card available in hand to discard');
  }

  return {
    ...hidden,
    inHand: hidden.inHand.slice(1),
  };
}
