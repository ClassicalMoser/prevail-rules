import { getUnitByStatValue } from '@testing';

import { createUnitInstance } from './createUnitInstance';

/**
 * CreateUnitInstance: Creates a unit instance with the specified properties.
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
