import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@factories';

import { isSameUnitType } from './isSameUnitType';

/**
 * IsSameUnitType: Determines whether two unit instances have the same unit type.
 */
describe('isSameUnitType function', () => {
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('returns true when both units have the same unit type', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);
    expect(isSameUnitType(unit1, unit2)).toBe(true);
  });

  it('returns false when units have different unit types', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);
    expect(isSameUnitType(unit1, unit2)).toBe(false);
  });

  it('returns true when comparing a unit to itself', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);
    expect(isSameUnitType(unit, unit)).toBe(true);
  });

  it('returns true when the sides differ and the unit type matches', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);
    expect(isSameUnitType(unit1, unit2)).toBe(true);
  });

  it('returns true when the instance numbers differ and the unit type matches', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 3);
    expect(isSameUnitType(unit1, unit2)).toBe(true);
  });
});
