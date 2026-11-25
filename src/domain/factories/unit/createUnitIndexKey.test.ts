import { getUnitByStatValue } from '@testing';

import { createUnitIndexKey } from './createUnitIndexKey';
import { createUnitInstance } from './createUnitInstance';

/**
 * A unit's key in the index names who it is: its side, its type and its
 * number. Two units share one only when they are the same unit.
 */
describe('createUnitIndexKey function', () => {
  // Any unit type will do: the key reads only its id.
  const unitType = getUnitByStatValue('attack', 3);

  it('joins the side, the type id and the number', () => {
    // White's second unit of this type.
    const unit = createUnitInstance('white', unitType, 2);

    // Named by side, type id and number, in that order.
    expect(createUnitIndexKey(unit)).toBe(`white-${unitType.id}-2`);
  });

  it('tells apart two units of one type by side and by number', () => {
    // White's first, white's second and black's first of the same type.
    const whiteFirst = createUnitInstance('white', unitType, 1);
    const whiteSecond = createUnitInstance('white', unitType, 2);
    const blackFirst = createUnitInstance('black', unitType, 1);

    // Each is a different unit, so each has its own key.
    const keys = new Set(
      [whiteFirst, whiteSecond, blackFirst].map((unit) =>
        createUnitIndexKey(unit),
      ),
    );
    expect(keys.size).toBe(3);
  });
});
