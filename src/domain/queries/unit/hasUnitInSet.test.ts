import { createTestUnit } from '@testing';

import { hasUnitInSet } from './hasUnitInSet';

/**
 * Whether a set holds a unit, by who it is rather than by the object the set
 * holds.
 */
describe('hasUnitInSet function', () => {
  it('finds a separate copy of a unit among others', () => {
    // Black's first unit, held beside White's and Black's second.
    const held = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([
      createTestUnit('white'),
      held,
      createTestUnit('black', { instanceNumber: 2 }),
    ]);
    // The same unit, as an event would carry it.
    const copy = createTestUnit('black', { instanceNumber: 1 });

    expect(hasUnitInSet(set, copy)).toBe(true);
  });

  it('fails for a unit not held, and for an empty set', () => {
    // Black's second copy, when only the first is held.
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    expect(
      hasUnitInSet(set, createTestUnit('black', { instanceNumber: 2 })),
    ).toBe(false);

    expect(hasUnitInSet(new Set(), createTestUnit('black'))).toBe(false);
  });
});
