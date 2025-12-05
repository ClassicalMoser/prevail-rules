import type { UnitInstance } from '@entities';
import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@utils/createUnitInstance';
import { describe, expect, it } from 'vitest';
import { isSameUnitType } from './isSameUnitType';

describe('isSameUnitType', () => {
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('should return true when both units have the same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    expect(isSameUnitType(unit1, unit2)).toBe(true);
  });

  it('should return false when units have different unit types', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);
    expect(isSameUnitType(unit1, unit2)).toBe(false);
  });

  it('should return true when comparing a unit to itself', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    expect(isSameUnitType(unit, unit)).toBe(true);
  });

  it('should return true for different sides with same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);
    expect(isSameUnitType(unit1, unit2)).toBe(true);
  });

  it('should return true for different instance numbers with same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 3);
    expect(isSameUnitType(unit1, unit2)).toBe(true);
  });

  it('should return false when comparing a unit to undefined', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    // Intentional type error to test the function
    expect(isSameUnitType(unit, undefined as unknown as UnitInstance)).toBe(
      false,
    );
  });
});
