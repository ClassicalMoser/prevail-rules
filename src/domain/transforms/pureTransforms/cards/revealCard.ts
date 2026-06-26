import type { OwnedCardState } from '@entities';

/**
 * Moves a player's card from awaitingPlay to inPlay.
 * Pure function operating on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @returns New owned card state with the card moved from awaitingPlay to inPlay
 * @throws Error if player has no card awaiting play
 */
export function revealCard(owned: OwnedCardState): OwnedCardState {
  const awaitingCard = owned.awaitingPlay;

  if (!awaitingCard) {
    throw new Error('Player has no card awaiting play');
  }

  return {
    ...owned,
    awaitingPlay: null,
    inPlay: awaitingCard,
  };
}
