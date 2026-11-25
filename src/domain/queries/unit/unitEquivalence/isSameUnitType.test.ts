import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@factories';

import { isSameUnitType } from './isSameUnitType';

/**
 * Whether two units are of one type, by the type's id. It says nothing about
 * side or number: `isSameUnitInstance` asks those too.
 */
describe('isSameUnitType function', () => {
  // Two different catalog types, told apart by their Flexibility.
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('holds for one type, whatever the side or number', () => {
    const unit = createUnitInstance('black', flexibility1UnitType, 1);

    // Another copy in the same army.
    const secondCopy = createUnitInstance('black', flexibility1UnitType, 3);
    expect(isSameUnitType(unit, secondCopy)).toBe(true);

    // The same type fielded by the other army.
    const enemy = createUnitInstance('white', flexibility1UnitType, 1);
    expect(isSameUnitType(unit, enemy)).toBe(true);
  });

  it('fails for different types', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);

    expect(isSameUnitType(unit1, unit2)).toBe(false);
  });
});
