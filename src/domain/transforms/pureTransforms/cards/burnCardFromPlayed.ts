import type { CommandCard } from '@entities';
import type { OwnedCardState } from '@game';
import { isSameCard } from '@queries';

/**
 * Burns a specific card from the player's played pile.
 * Pure function operating on a single player's owned card state.
 *
 * @param owned - The player's current owned card state
 * @param card - The card to burn
 * @returns New owned card state with the card burned
 * @throws Error if card is not in played pile
 */
export function burnCardFromPlayed(
  owned: OwnedCardState,
  card: CommandCard,
): OwnedCardState {
  const cardIndex = owned.played.findIndex((c) => isSameCard(c, card).result);
  if (cardIndex === -1) {
    throw new Error(
      `Command card ${card.id} not found in player's played cards`,
    );
  }

  const newPlayed = owned.played.filter((c) => !isSameCard(c, card).result);
  const newBurnt = [...owned.burnt, card];

  return {
    ...owned,
    burnt: newBurnt,
    played: newPlayed,
  };
}
