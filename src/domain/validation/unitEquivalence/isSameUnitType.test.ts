import type { UnitInstance } from '@entities';
import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isSameUnitType } from './isSameUnitType';

describe('isSameUnitType', () => {
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('should return true when both units have the same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitType(unit1, unit2);
    expect(result).toBe(true);
  });

  it('should return false when units have different unit types', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);
    const { result } = isSameUnitType(unit1, unit2);
    expect(result).toBe(false);
  });

  it('should return true when comparing a unit to itself', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitType(unit, unit);
    expect(result).toBe(true);
  });

  it('should return true for different sides with same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);
    const { result } = isSameUnitType(unit1, unit2);
    expect(result).toBe(true);
  });

  it('should return true for different instance numbers with same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 3);
    const { result } = isSameUnitType(unit1, unit2);
    expect(result).toBe(true);
  });

  it('should return false when comparing a unit to undefined', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    // Intentional type error to test the function
    const { result } = isSameUnitType(
      unit,
      undefined as unknown as UnitInstance,
    );
    expect(result).toBe(false);
  });
});
