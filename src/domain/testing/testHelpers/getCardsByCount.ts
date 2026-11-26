import type { CommandCard } from '@entities';
import { tempCommandCards } from '@sampleValues';

/**
 * Gets a specified number of cards from the tempCommandCards array, starting from the beginning.
 */
export function getCardsByCount(count: number = 1): CommandCard[] {
  // A hand of so many cards: none is fair, fewer than none or more than the
  // catalog holds is a spec's mistake.
  if (count < 0) {
    throw new Error(`Count must be non-negative, got ${count}`);
  }
  if (count > tempCommandCards.length) {
    throw new Error(
      `Requested ${count} cards but only ${tempCommandCards.length} are available`,
    );
  }

  // The first cards of the catalog. They are fungible, so which ones they
  // are does not matter to a spec that asks by count.
  const cards = tempCommandCards.slice(0, count);

  // The hand, the catalog's own copies.
  return cards;
}
