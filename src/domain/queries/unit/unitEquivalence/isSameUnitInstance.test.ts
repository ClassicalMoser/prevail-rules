import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@factories';

import { isSameUnitInstance } from './isSameUnitInstance';

/**
 * IsSameUnitInstance: Determines whether two unit instances are the same unit.
 */
describe('isSameUnitInstance function', () => {
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('returns true when both units are the same instance (all properties match)', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(true);
  });

  it('returns true when comparing a unit to itself', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit, unit);
    expect(result).toBe(true);
  });

  it('returns false when units have different player sides', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('returns false when units have different unit types', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('returns false when units have different instance numbers', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });

  it('returns true when two objects share side, type, and instance number', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    // Create a new unit with same properties (different reference)
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);
    expect(unit1).not.toBe(unit2); // Different references
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(true); // But same by value
  });

  it('returns false when the instance number is the only difference', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    const { result } = isSameUnitInstance(unit1, unit2);
    expect(result).toBe(false);
  });
});
