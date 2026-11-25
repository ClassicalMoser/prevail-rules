import type { HiddenCardState } from '@game';

/**
 * Moves one `'hidden'` placeholder from hand to awaitingPlay for an unowned seat.
 *
 * In Phase 1 each player lays a card face down in secret (§4.1.1), so a seat
 * that cannot see the chooser's hand sees only that one card left it. The
 * projected `chooseCard` event carries `'hidden'` for that seat, and
 * `applyChooseCardEvent` calls this; `chooseCard` is the same step where the
 * hand is in view.
 *
 * @param hidden - The card piles of a player this view cannot see
 * @returns The piles with one card face down, waiting to be revealed
 * @throws Error when a card is already waiting, or the hand is empty
 */
export function chooseHiddenCard(hidden: HiddenCardState): HiddenCardState {
  // Each player lays down one card a round; a second choice is a fault.
  if (hidden.awaitingPlay !== null) {
    throw new Error('Hidden player already has a card awaiting play');
  }
  // An empty hand has already lost (§11.1), so it has no card to lay down.
  if (hidden.inHand.length === 0) {
    throw new Error('No hidden card available in hand');
  }

  // Which card left is secret, so any one placeholder stands for it.
  const chosen: HiddenCardState = {
    ...hidden,
    awaitingPlay: 'hidden',
    inHand: hidden.inHand.slice(1),
  };
  return chosen;
}
