import type { CommandCard } from '@entities';
import type { HiddenCardState } from '@game';

/**
 * Takes one card out of a hand this view cannot see, when the card is shown.
 * A commitment is face up (§8), so a seat that cannot read the committing
 * player's hand still sees which card was spent: one `'hidden'` placeholder
 * leaves the hand, and the shown card lies on the discard pile.
 *
 * @param hidden - The card piles of a player this view cannot see
 * @param shown - The card the player showed
 * @returns The piles with one placeholder removed and the shown card discarded
 * @throws Error when the hand holds no card to take out
 */
export function discardShownCardFromHiddenHand(
  hidden: HiddenCardState,
  shown: CommandCard,
): HiddenCardState {
  if (hidden.inHand.length === 0) {
    throw new Error('No hidden card available in hand to discard');
  }

  return {
    ...hidden,
    discarded: [...hidden.discarded, shown],
    inHand: hidden.inHand.slice(1),
  };
}
