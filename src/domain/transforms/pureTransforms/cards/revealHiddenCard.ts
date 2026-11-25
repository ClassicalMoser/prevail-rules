import type { CommandCard } from '@entities';
import type { HiddenCardState } from '@game';

/**
 * Promotes an opponent's hidden awaitingPlay slot to a public inPlay card.
 * Pure function operating on a single player's hidden card state.
 * The revealed identity comes from the event payload, not from prior state.
 *
 * The face-down card is turned over and is in play for the round (§4.1.2).
 * `revealBothAwaitingCards` calls it for each hand this view cannot see.
 *
 * @param hidden - The opponent's current hidden card state
 * @param card - The revealed card from the event payload
 * @returns New hidden card state with awaitingPlay cleared and inPlay set
 * @throws Error if player has no card awaiting play (`null`)
 */
export function revealHiddenCard(
  hidden: HiddenCardState,
  card: CommandCard,
): HiddenCardState {
  // Both players choose before the reveal (§4.1.1); a player with nothing
  // face down means the reveal came too early.
  if (hidden.awaitingPlay === null) {
    throw new Error('Player has no card awaiting play');
  }

  // This view never knew which card lay face down, so the event's copy is
  // the only one there is, and it stays face up until Cleanup.
  const revealed: HiddenCardState = {
    ...hidden,
    awaitingPlay: null,
    inPlay: card,
  };
  return revealed;
}
