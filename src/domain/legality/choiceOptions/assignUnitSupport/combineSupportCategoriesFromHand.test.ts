import { createTestCard } from '@testing';

import { combineSupportCategoriesFromHand } from './combineSupportCategoriesFromHand';

/**
 * After a rally the player's cards are added up into stacks of places
 * (§10.4.3): cards naming the same kind of unit stack into one, and cards
 * naming different kinds stay separate. Each case's cards are stand-ins,
 * read only for their unit support.
 */
describe('combineSupportCategoriesFromHand function', () => {
  it('an empty hand holds no stacks', () => {
    // No cards, so nothing holds any unit on the field.
    expect(combineSupportCategoriesFromHand([])).toStrictEqual([]);
  });

  it('a card holding no place begins no stack', () => {
    // A card the schema would refuse, since every card holds at least one
    // place (§10.4.2); the guard against it is marked in the subject.
    const noPlace = createTestCard({
      unitSupport: { count: 0, supportType: 'generic' },
    });

    expect(combineSupportCategoriesFromHand([noPlace])).toStrictEqual([]);
  });

  it('two cards naming the same unit type stack into one, holding both their places', () => {
    // One card holds one place for this unit type, the other two.
    const unitTypeId = '00000000-0000-4000-8000-000000000001';
    const categories = combineSupportCategoriesFromHand([
      createTestCard({
        unitSupport: { count: 1, supportType: 'unitType', unitTypeId },
      }),
      createTestCard({
        unitSupport: { count: 2, supportType: 'unitType', unitTypeId },
      }),
    ]);

    // One stack of three places for that type.
    expect(categories).toStrictEqual([
      { count: 3, supportType: 'unitType', unitTypeId },
    ]);
  });

  it('cards naming a unit type, a trait and any unit stay three stacks, in hand order', () => {
    // Three cards, each naming a different kind of unit.
    const unitTypeId = '00000000-0000-4000-8000-000000000002';
    const categories = combineSupportCategoriesFromHand([
      createTestCard({
        unitSupport: { count: 1, supportType: 'unitType', unitTypeId },
      }),
      createTestCard({
        unitSupport: { count: 2, supportType: 'trait', trait: 'formation' },
      }),
      createTestCard({
        unitSupport: { count: 1, supportType: 'generic' },
      }),
    ]);

    // Different kinds do not stack, and each keeps its own places.
    expect(categories).toStrictEqual([
      { count: 1, supportType: 'unitType', unitTypeId },
      { count: 2, supportType: 'trait', trait: 'formation' },
      { count: 1, supportType: 'generic' },
    ]);
  });

  it('two generic cards stack into one stack for any unit', () => {
    // Every generic card holds one place for any unit at all.
    const categories = combineSupportCategoriesFromHand([
      createTestCard({
        unitSupport: { count: 1, supportType: 'generic' },
      }),
      createTestCard({
        unitSupport: { count: 1, supportType: 'generic' },
      }),
    ]);

    // One generic stack of two places.
    expect(categories).toStrictEqual([{ count: 2, supportType: 'generic' }]);
  });
});
