import type { UnitInstance } from '@entities';
import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isSameUnitInstance } from './isSameUnitInstance';

describe('isSameUnitInstance', () => {
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('should return true when both units are the same instance (all properties match)', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(true);
  });

  it('should return true when comparing a unit to itself', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit, unit);
    expect(result).toBe(true);
  });

  it('should return false when units have different player sides', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('should return false when units have different unit types', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('should return false when units have different instance numbers', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('should return true for units with same properties but different object references', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    // Create a new unit with same properties (different reference)
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);
    expect(unit1 !== unit2).toBe(true); // Different references
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(true); // But same by value
  });

  it('should return false when only one property differs', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('should return false when comparing a unit to undefined', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    // Intentional type error to test the function
    const { result } = isSameUnitInstance(
      unit,
      undefined as unknown as UnitInstance,
    );
    expect(result).toBe(false);
  });
});
