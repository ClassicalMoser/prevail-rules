import { createTestUnit } from '@testing';

import { hasUnitInSet } from './hasUnitInSet';

/**
 * HasUnitInSet: membership test for UnitInstance in a Set using value equality (not reference identity).
 */
describe('hasUnitInSet function', () => {
  it('returns true when the set contains the same instance', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([
      createTestUnit('white'),
      unit,
      createTestUnit('black', { instanceNumber: 2 }),
    ]);
    expect(hasUnitInSet(set, unit)).toBe(true);
  });

  it('returns true when a set member equals the argument by value', () => {
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    expect(hasUnitInSet(set, sameValue)).toBe(true);
  });

  it('returns false when no member matches', () => {
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    expect(
      hasUnitInSet(set, createTestUnit('black', { instanceNumber: 2 })),
    ).toBe(false);
  });

  it('returns false for an empty set', () => {
    expect(hasUnitInSet(new Set(), createTestUnit('black'))).toBe(false);
  });
});
