import type { CommandCard, UnitCount } from '@entities';
import { tempCommandCards } from './tempCommandCards';

/**
 * Whether an army fielding these units can ever meet a card's unit support.
 * At a rally's support check a card holds only units its support names
 * (§10.4), so a card naming a unit type or trait the army never fields
 * holds nobody.
 */
function canHoldAUnit(card: CommandCard, units: UnitCount[]): boolean {
  const support = card.unitSupport;

  // Any unit will do for a generic card.
  if (support.supportType === 'generic') {
    return true;
  }

  // A card for a trait holds a unit of any type that has it.
  if (support.supportType === 'trait') {
    const fieldsTrait = units.some(({ unitType }) =>
      unitType.traits.includes(support.trait),
    );
    return fieldsTrait;
  }

  // A card for a unit type holds only units of that type.
  const fieldsType = units.some(
    ({ unitType }) => unitType.id === support.unitTypeId,
  );
  return fieldsType;
}

/**
 * Takes the first `count` sample cards at a given initiative whose unit
 * support the army can meet. Throws when the catalog is short, so a sample
 * reshuffle cannot silently unbalance an army's cards-per-initiative.
 *
 * @param initiative - The initiative value the cards must have
 * @param count - How many cards to take
 * @param units - The units the army fields, which every card's support must
 * be able to name
 * @returns The first `count` such sample cards at that initiative
 * @throws Error when the catalog holds fewer than `count` such cards at that initiative
 */
export function cardsAtInitiative(
  initiative: number,
  count: number,
  units: UnitCount[],
): CommandCard[] {
  // Starter armies balance the deck by initiative value, not by printed
  // card name, and hold no card whose support names nobody they field.
  const atInitiative = tempCommandCards.filter(
    (card) => card.initiative === initiative && canHoldAUnit(card, units),
  );
  // A short catalog would leave a side short of the mode's cards-per-initiative.
  if (atInitiative.length < count) {
    throw new Error(
      `Need at least ${count} sample cards at initiative ${initiative}, found ${atInitiative.length}`,
    );
  }

  // The first that many, in catalog order, so an army built from them is stable.
  const cards = atInitiative.slice(0, count);
  return cards;
}
