import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@factories';

import { isSameUnitInstance } from './isSameUnitInstance';

/**
 * A unit is named by who it is: its side, its type, and its number among that
 * type's copies. An event carries a copy, and this is how the game finds its
 * own.
 */
describe('isSameUnitInstance function', () => {
  // Two different catalog types, told apart by their Flexibility.
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  it('holds for two separate copies of the same unit', () => {
    // Black's first copy of the type, built twice.
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 1);

    // Different objects, the same unit.
    expect(unit1).not.toBe(unit2);
    expect(isSameUnitInstance(unit1, unit2)).toBe(true);
  });

  it('fails for the same type and number in the other army', () => {
    // Both armies may field the same type; their units are still enemies.
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('white', flexibility1UnitType, 1);

    expect(isSameUnitInstance(unit1, unit2)).toBe(false);
  });

  it('fails for another type with the same number', () => {
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility2UnitType, 1);

    expect(isSameUnitInstance(unit1, unit2)).toBe(false);
  });

  it('fails for another copy of the same type', () => {
    // Black's first and second copies of one type.
    const unit1 = createUnitInstance('black', flexibility1UnitType, 1);
    const unit2 = createUnitInstance('black', flexibility1UnitType, 2);

    expect(isSameUnitInstance(unit1, unit2)).toBe(false);
  });
});
