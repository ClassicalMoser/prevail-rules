import type { CommandCard } from '@entities';
import type { ValidationResult } from '@utils';

/**
 * Whether two cards are the same card: the card's id names one card in an
 * army, wherever it lies and however it was written out. Compared by value,
 * not by reference: two copies of one card are the same card.
 *
 * This says nothing about whether the two copies agree on the card's stats;
 * {@link isSameCardValue} answers that.
 *
 * @param card1 - The first card
 * @param card2 - The second card
 * @returns A passing result when both name the same card, with the two ids otherwise
 */
export function isSameCard(
  card1: CommandCard,
  card2: CommandCard,
): ValidationResult {
  if (card1.id !== card2.id) {
    return {
      errorReason: `Cards ${card1.id} and ${card2.id} are different cards`,
      result: false,
    };
  }
  return { result: true };
}
