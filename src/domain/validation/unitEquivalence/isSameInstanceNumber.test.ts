import type { UnitInstance } from '@entities';
import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { isSameInstanceNumber } from './isSameInstanceNumber';

/**
 * isSameInstanceNumber: Determines whether two unit instances have the same instance number.
 */
describe('isSameInstanceNumber', () => {
  it('given both units have the same instance number, returns true', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 4, instanceNumber: 1 });
    const { result } = isSameInstanceNumber(unit1, unit2);
    expect(result).toBe(true);
  });

  it('given units have different instance numbers, returns false', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const { result } = isSameInstanceNumber(unit1, unit2);
    expect(result).toBe(false);
  });

  it('given comparing a unit to itself, returns true', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const { result } = isSameInstanceNumber(unit, unit);
    expect(result).toBe(true);
  });

  it('given different sides with same instance number, returns true', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const { result } = isSameInstanceNumber(unit1, unit2);
    expect(result).toBe(true);
  });

  it('given different instance numbers even with same type, returns false', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 3 });
    const { result } = isSameInstanceNumber(unit1, unit2);
    expect(result).toBe(false);
  });

  it('given comparing a unit to undefined, returns false', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    // Intentional type error to test the function
    const { result } = isSameInstanceNumber(
      unit,
      undefined as unknown as UnitInstance,
    );
    expect(result).toBe(false);
  });
});
