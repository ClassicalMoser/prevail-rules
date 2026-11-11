import type { CommandCard } from '@entities';

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
 * @returns True when both name the same card
 */
export function isSameCard(card1: CommandCard, card2: CommandCard): boolean {
  const same = card1.id === card2.id;
  return same;
}
