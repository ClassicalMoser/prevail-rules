import type { CommandCard } from '@entities';
import { tempCommandCards } from '@sampleValues';

/**
 * Gets a specified number of cards from the tempCommandCards array, starting from the beginning.
 */
export function getCardsByCount(count: number = 1): CommandCard[] {
  if (count < 0) {
    throw new Error(`Count must be non-negative, got ${count}`);
  }
  if (count > tempCommandCards.length) {
    throw new Error(
      `Requested ${count} cards but only ${tempCommandCards.length} are available`,
    );
  }
  const cards = tempCommandCards.slice(0, count);
  return cards;
}
