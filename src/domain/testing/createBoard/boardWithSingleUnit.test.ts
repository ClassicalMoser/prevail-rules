import { findPlayerUnitWithPosition } from '@queries';
import { tempUnits } from '@sampleValues';

import { createBoardWithSingleUnit } from './boardWithSingleUnit';

/** One unit alone on a standard board, chosen by type or by one stat. */
describe('createBoardWithSingleUnit function', () => {
  it('stands the first stand-in of its side on the space, facing north', () => {
    const board = createBoardWithSingleUnit('E-5', 'black');

    const atE5 = findPlayerUnitWithPosition(board, 'E-5', 'black');
    expect(atE5?.placement).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
    expect(atE5?.unit.instanceNumber).toBe(1);
    // Asked for nothing, it is a stand-in of Attack 3.
    expect(atE5?.unit.unitType.stats.attack).toBe(3);
  });

  it('turns the unit as asked and chooses it by its Attack', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      attack: 2,
      facing: 'south',
    });

    const atE5 = findPlayerUnitWithPosition(board, 'E-5', 'white');
    expect(atE5?.placement.facing).toBe('south');
    expect(atE5?.unit.unitType.stats.attack).toBe(2);
  });

  it('chooses the unit by its Flexibility', () => {
    const board = createBoardWithSingleUnit('E-5', 'black', {
      flexibility: 1,
    });

    expect(
      findPlayerUnitWithPosition(board, 'E-5', 'black')?.unit.unitType.stats
        .flexibility,
    ).toBe(1);
  });

  it('takes a unit type the spec names outright', () => {
    // Any catalog row will do: the case is that the named type is used.
    const unitType = tempUnits[0];

    const board = createBoardWithSingleUnit('E-5', 'white', { unitType });

    expect(
      findPlayerUnitWithPosition(board, 'E-5', 'white')?.unit.unitType,
    ).toBe(unitType);
  });
});
