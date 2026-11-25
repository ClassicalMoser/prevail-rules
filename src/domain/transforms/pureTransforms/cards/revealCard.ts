import type { OwnedCardState } from '@game';

/**
 * Moves a player's card from awaitingPlay to inPlay.
 * Pure function operating on a single player's owned card state.
 *
 * The face-down card is turned over and is in play for the round (§4.1.2).
 * `revealBothAwaitingCards` calls it for each hand this view can see.
 *
 * @param owned - The player's current owned card state
 * @returns New owned card state with the card moved from awaitingPlay to inPlay
 * @throws Error if player has no card awaiting play
 */
export function revealCard(owned: OwnedCardState): OwnedCardState {
  // Both players choose before the reveal (§4.1.1); a player with nothing
  // face down means the reveal came too early.
  const awaitingCard = owned.awaitingPlay;

  if (!awaitingCard) {
    throw new Error('Player has no card awaiting play');
  }

  // The card stays face up in front of its owner until Cleanup (§4.1.2).
  const revealed: OwnedCardState = {
    ...owned,
    awaitingPlay: null,
    inPlay: awaitingCard,
  };
  return revealed;
}
