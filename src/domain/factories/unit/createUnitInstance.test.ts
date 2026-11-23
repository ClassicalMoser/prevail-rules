import { getUnitByStatValue } from '@testing';

import { createUnitInstance } from './createUnitInstance';

/**
 * A unit is the side that fields it, its type, and its number among that
 * side's units of the type; the factory holds exactly those three.
 */
describe('createUnitInstance function', () => {
  it('carries the side, unit type and instance number it is given', () => {
    // Any unit type will do: the factory carries it through unchanged.
    const unitType = getUnitByStatValue('attack', 3);

    const unit = createUnitInstance('black', unitType, 1);

    expect(unit.playerSide).toBe('black');
    expect(unit.unitType).toBe(unitType);
    expect(unit.instanceNumber).toBe(1);
  });
});
