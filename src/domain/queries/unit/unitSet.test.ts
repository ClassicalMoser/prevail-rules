import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { hasUnitInSet, setWithoutUnit } from './unitSet';

describe('hasUnitInSet', () => {
  it('should return true when set contains same unit by value', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([
      createTestUnit('white'),
      unit,
      createTestUnit('black', { instanceNumber: 2 }),
    ]);
    expect(hasUnitInSet(set, unit)).toBe(true);
  });

  it('should return true when set contains equal unit (different reference)', () => {
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    expect(hasUnitInSet(set, sameValue)).toBe(true);
  });

  it('should return false when set does not contain unit', () => {
    const set = new Set([createTestUnit('black', { instanceNumber: 1 })]);
    expect(
      hasUnitInSet(set, createTestUnit('black', { instanceNumber: 2 })),
    ).toBe(false);
  });

  it('should return false for empty set', () => {
    expect(hasUnitInSet(new Set(), createTestUnit('black'))).toBe(false);
  });
});

describe('setWithoutUnit', () => {
  it('should return new set without matching unit', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    const set = new Set([unit, other]);
    const result = setWithoutUnit(set, unit);
    expect(result.size).toBe(1);
    expect(hasUnitInSet(result, other)).toBe(true);
    expect(hasUnitInSet(result, unit)).toBe(false);
  });

  it('should match by value when removing', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([unit]);
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    const result = setWithoutUnit(set, sameValue);
    expect(result.size).toBe(0);
  });

  it('should leave set unchanged when unit not in set', () => {
    const set = new Set([createTestUnit('black')]);
    const result = setWithoutUnit(set, createTestUnit('white'));
    expect(result.size).toBe(1);
  });
});
