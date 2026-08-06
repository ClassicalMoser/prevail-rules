import type { Card, HiddenCardState } from '@entities';

/**
 * Promotes an opponent's hidden awaitingPlay slot to a public inPlay card.
 * Pure function operating on a single player's hidden card state.
 * The revealed identity comes from the event payload, not from prior state.
 *
 * @param hidden - The opponent's current hidden card state
 * @param card - The revealed card from the event payload
 * @returns New hidden card state with awaitingPlay cleared and inPlay set
 * @throws Error if player has no card awaiting play (`null`)
 */
export function revealHiddenCard(
  hidden: HiddenCardState,
  card: Card,
): HiddenCardState {
  if (hidden.awaitingPlay === null) {
    throw new Error('Player has no card awaiting play');
  }

  return {
    ...hidden,
    awaitingPlay: null,
    inPlay: card,
  };
}
