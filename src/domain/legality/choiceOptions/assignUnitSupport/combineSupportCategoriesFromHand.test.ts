import { createTestCard } from '@testing';

import { combineSupportCategoriesFromHand } from './combineSupportCategoriesFromHand';

describe(combineSupportCategoriesFromHand, () => {
  it('given an empty hand, returns no categories', () => {
    expect(combineSupportCategoriesFromHand([])).toStrictEqual([]);
  });

  it('given count less than 1, skips that card', () => {
    expect(
      combineSupportCategoriesFromHand([
        createTestCard({ unitSupport: { count: 0, supportType: 'generic' } }),
      ]),
    ).toStrictEqual([]);
  });

  it('given two cards with the same unit type, sums counts into one category', () => {
    const unitTypeId = '00000000-0000-4000-8000-000000000001';
    const categories = combineSupportCategoriesFromHand([
      createTestCard({
        id: 'a',
        unitSupport: { count: 1, supportType: 'unitType', unitTypeId },
      }),
      createTestCard({
        id: 'b',
        unitSupport: { count: 2, supportType: 'unitType', unitTypeId },
      }),
    ]);
    expect(categories).toStrictEqual([
      { count: 3, supportType: 'unitType', unitTypeId },
    ]);
  });

  it('given distinct type, trait, and generic, keeps separate categories', () => {
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
    expect(categories).toStrictEqual([
      { count: 1, supportType: 'unitType', unitTypeId },
      { count: 2, supportType: 'trait', trait: 'formation' },
      { count: 1, supportType: 'generic' },
    ]);
  });

  it('given two generic cards, merges into one generic category', () => {
    expect(
      combineSupportCategoriesFromHand([
        createTestCard({
          id: 'g1',
          unitSupport: { count: 1, supportType: 'generic' },
        }),
        createTestCard({
          id: 'g2',
          unitSupport: { count: 1, supportType: 'generic' },
        }),
      ]),
    ).toStrictEqual([{ count: 2, supportType: 'generic' }]);
  });
});
