import { createTestUnit } from '@testing';

import { hasUnitInArray } from './hasUnitInArray';

/**
 * HasUnitInArray: membership test for UnitInstance in an array using value equality (not reference identity).
 */
describe('hasUnitInArray function', () => {
  it('returns true when the array contains the same instance', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const array = [
      createTestUnit('white'),
      unit,
      createTestUnit('black', { instanceNumber: 2 }),
    ];
    expect(hasUnitInArray(array, unit)).toBe(true);
  });

  it('returns true when an array member equals the argument by value', () => {
    const array = [createTestUnit('black', { instanceNumber: 1 })];
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    expect(hasUnitInArray(array, sameValue)).toBe(true);
  });

  it('returns false when no member matches', () => {
    const array = [createTestUnit('black', { instanceNumber: 1 })];
    expect(
      hasUnitInArray(array, createTestUnit('black', { instanceNumber: 2 })),
    ).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(hasUnitInArray([], createTestUnit('black'))).toBe(false);
  });
});
