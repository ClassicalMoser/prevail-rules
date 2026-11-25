import { createTestUnit } from '@testing';

import { hasUnitInArray } from './hasUnitInArray';

/**
 * Whether a list holds a unit, by who it is: the units already commanded this
 * round, for one, which an order may not name again (§4.3.6).
 */
describe('hasUnitInArray function', () => {
  it('finds a separate copy of a unit among others', () => {
    // Black's first unit, listed beside White's and Black's second.
    const listed = createTestUnit('black', { instanceNumber: 1 });
    const array = [
      createTestUnit('white'),
      listed,
      createTestUnit('black', { instanceNumber: 2 }),
    ];
    // The same unit, as an event would carry it.
    const copy = createTestUnit('black', { instanceNumber: 1 });

    expect(hasUnitInArray(array, copy)).toBe(true);
  });

  it('fails for a unit not listed, and for an empty list', () => {
    // Black's second copy, when only the first is listed.
    const array = [createTestUnit('black', { instanceNumber: 1 })];
    expect(
      hasUnitInArray(array, createTestUnit('black', { instanceNumber: 2 })),
    ).toBe(false);

    // Nobody commanded yet.
    expect(hasUnitInArray([], createTestUnit('black'))).toBe(false);
  });
});
