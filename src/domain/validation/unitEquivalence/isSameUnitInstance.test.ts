import type { UnitInstance } from '@entities';
import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isSameUnitInstance } from './isSameUnitInstance';

/**
 * isSameUnitInstance: Determines whether two unit instances are the same unit.
 */
describe('isSameUnitInstance', () => {
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('given both units are the same instance (all properties match), returns true', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(true);
  });

  it('given comparing a unit to itself, returns true', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit, unit);
    expect(result).toBe(true);
  });

  it('given units have different player sides, returns false', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('given units have different unit types, returns false', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('given units have different instance numbers, returns false', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('given units with same properties but different object references, returns true', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    // Create a new unit with same properties (different reference)
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);
    expect(unit1 !== unit2).toBe(true); // Different references
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(true); // But same by value
  });

  it('given only one property differs, returns false', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('given comparing a unit to undefined, returns false', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    // Intentional type error to test the function
    const { result } = isSameUnitInstance(
      unit,
      undefined as unknown as UnitInstance,
    );
    expect(result).toBe(false);
  });
});
