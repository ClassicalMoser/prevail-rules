import type { CommandCard } from '@entities';
import { tempCommandCards } from './tempCommandCards';

/**
 * Takes the first `count` sample cards at a given initiative.
 * Throws when the catalog is short, so a sample reshuffle cannot silently
 * unbalance an army's cards-per-initiative.
 *
 * @param initiative - The initiative value the cards must have
 * @param count - How many cards to take
 * @returns The first `count` sample cards at that initiative
 * @throws Error when the catalog holds fewer than `count` at that initiative
 */
export function cardsAtInitiative(
  initiative: number,
  count: number,
): CommandCard[] {
  // Starter armies balance the deck by initiative value, not by printed card name.
  const atInitiative = tempCommandCards.filter(
    (card) => card.initiative === initiative,
  );
  // A short catalog would leave a side short of the mode's cards-per-initiative.
  if (atInitiative.length < count) {
    throw new Error(
      `Need at least ${count} sample cards at initiative ${initiative}, found ${atInitiative.length}`,
    );
  }
  const cards = atInitiative.slice(0, count);
  return cards;
}
