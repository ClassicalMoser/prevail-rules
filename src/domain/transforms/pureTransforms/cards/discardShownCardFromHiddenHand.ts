import type { CommandCard } from '@entities';
import type { HiddenCardState } from '@game';

/**
 * Takes one card out of a hand this view cannot see, when the card is shown.
 * A commitment is face up (§8), so a seat that cannot read the committing
 * player's hand still sees which card was spent: one `'hidden'` placeholder
 * leaves the hand, and the shown card lies on the discard pile.
 *
 * The commitment applies call it once, and `applyChooseRoutDiscardEvent`
 * once per card paid for a rout (§9.3.2), which is also face up.
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
  // A card is only ever discarded from hand (§10.2); an empty hand has none
  // to give, so the event is at fault.
  if (hidden.inHand.length === 0) {
    throw new Error('No hidden card available in hand to discard');
  }

  // The hand is face down, so any one placeholder stands for the card spent.
  // The event's card is the only copy this view has, so it is the one laid
  // on the pile.
  const discarded: HiddenCardState = {
    ...hidden,
    discarded: [...hidden.discarded, shown],
    inHand: hidden.inHand.slice(1),
  };
  return discarded;
}
