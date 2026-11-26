import type { CommandCard, UnitCount } from '@entities';
import { cardsAtInitiative } from './cardsAtInitiative';
import { tempCommandCards } from './tempCommandCards';
import { tempUnits } from './tempUnits';

/** Every sample unit type, one of each: an army that can meet any support. */
const everyType: UnitCount[] = tempUnits.map((unitType) => ({
  count: 1,
  unitType,
}));

/** The first sample card whose support names one unit type. */
const typeCard = tempCommandCards.find(
  (card) => card.unitSupport.supportType === 'unitType',
);

/**
 * A starter army must hold the same number of cards at every initiative
 * (§3.1.7), so it is built by taking that many sample cards at each value,
 * leaving out any whose support names nobody the army fields (§10.4).
 */
describe('cardsAtInitiative function', () => {
  it('takes cards that all carry the initiative asked for', () => {
    // Three cards, every one at initiative 2.
    const cards = cardsAtInitiative(2, 3, everyType);

    expect(cards).toHaveLength(3);
    expect(cards.every((card) => card.initiative === 2)).toBe(true);
  });

  it('takes the same cards each time, so an army built from them is stable', () => {
    // Two calls with the same request give the same cards in the same order.
    expect(cardsAtInitiative(3, 2, everyType)).toStrictEqual(
      cardsAtInitiative(3, 2, everyType),
    );
  });

  it('takes a card for a unit type only for an army that fields that type', () => {
    // The catalog has such a card; at its initiative, an army fielding every
    // type but that one never gets it.
    expect(typeCard).toBeDefined();
    const card = typeCard as CommandCard;
    const supportedId =
      card.unitSupport.supportType === 'unitType'
        ? card.unitSupport.unitTypeId
        : '';
    const withoutType = everyType.filter(
      ({ unitType }) => unitType.id !== supportedId,
    );
    const atItsInitiative = tempCommandCards.filter(
      (each) => each.initiative === card.initiative,
    ).length;

    // Fielding every type, the army can take every card at that initiative;
    // without the named type, it cannot take them all.
    const withIt = cardsAtInitiative(
      card.initiative,
      atItsInitiative,
      everyType,
    );
    expect(withIt).toContain(card);
    expect(() =>
      cardsAtInitiative(card.initiative, atItsInitiative, withoutType),
    ).toThrow(`Need at least ${atItsInitiative} sample cards`);
  });

  it('throws when the catalog holds fewer cards at that initiative than asked for', () => {
    // No catalog holds 99 cards at one initiative; a short catalog must not
    // quietly unbalance an army.
    expect(() => cardsAtInitiative(1, 99, everyType)).toThrow(
      'Need at least 99 sample cards at initiative 1',
    );
  });
});
