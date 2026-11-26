import type { CommandCard } from '@entities';
import { tempCommandCards } from '@sampleValues';

/**
 * Gets cards from the tempCommandCards array by their indices.
 */
export function getCards(...indices: number[]): CommandCard[] {
  // Asking for no cards is an empty hand, not a mistake.
  if (indices.length === 0) {
    return [];
  }

  // Each index names a stand-in card; one past the catalog is a spec's
  // mistake, so it throws rather than dealing a gap.
  const cards: CommandCard[] = [];
  for (const index of indices) {
    if (index < 0 || index >= tempCommandCards.length) {
      throw new Error(
        `Command card index ${index} is out of bounds. Available cards: 0-${tempCommandCards.length - 1}`,
      );
    }
    cards.push(tempCommandCards[index]);
  }

  // The cards in the order asked, the catalog's own copies.
  return cards;
}
