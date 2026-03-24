import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { hasUnitInSet, setWithoutUnit } from './unitSet';

/**
 * hasUnitInSet: membership test for UnitInstance in a Set using value equality (not reference identity).
 */
describe('hasUnitInSet', () => {
  it('given set contains same instance, returns true', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([
      createTestUnit('white'),
      unit,
      createTestUnit('black', { instanceNumber: 2 }),
    ]);
    expect(hasUnitInSet(set, unit)).toBe(true);
  });

  it('given set member equals argument by value, returns true', () => {
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    expect(hasUnitInSet(set, sameValue)).toBe(true);
  });

  it('given no matching unit, returns false', () => {
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    expect(
      hasUnitInSet(set, createTestUnit('black', { instanceNumber: 2 })),
    ).toBe(false);
  });

  it('given empty set, returns false', () => {
    expect(hasUnitInSet(new Set(), createTestUnit('black'))).toBe(false);
  });
});

/**
 * setWithoutUnit: copy of the set without one unit (matched by value).
 */
describe('setWithoutUnit', () => {
  it('given unit present, returns new set without it', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    const set = new Set([unit, other]);
    const result = setWithoutUnit(set, unit);
    expect(result.size).toBe(1);
    expect(hasUnitInSet(result, other)).toBe(true);
    expect(hasUnitInSet(result, unit)).toBe(false);
  });

  it('given equal value different reference, removes matching unit', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([unit]);
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    const result = setWithoutUnit(set, sameValue);
    expect(result.size).toBe(0);
  });

  it('given unit not in set, leaves size unchanged', () => {
    const set = new Set([createTestUnit('black')]);
    const result = setWithoutUnit(set, createTestUnit('white'));
    expect(result.size).toBe(1);
  });
});
