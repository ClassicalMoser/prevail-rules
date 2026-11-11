import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';

import { getUnitWithPlacementOnBoard } from './getUnitWithPlacementOnBoard';

describe('getUnitWithPlacementOnBoard function', () => {
  it('returns the unit the board holds, with where it stands', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    const held = getUnitWithPlacementOnBoard(board, unit);

    expect(held).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit,
    });
  });

  it('returns the board’s unit when it is named with other stats than it has', () => {
    // The board holds a unit with Attack 3. A client names the same unit
    // (same side, type and number) claiming Attack 99.
    const onBoard = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);
    const claimed = {
      ...onBoard,
      unitType: {
        ...onBoard.unitType,
        stats: { ...onBoard.unitType.stats, attack: 99 },
      },
    };

    const held = getUnitWithPlacementOnBoard(board, claimed);

    // Who it is is what the name gave; what it is is what the board holds.
    expect(held.unit.unitType.stats.attack).toBe(3);
  });

  it('returns the secondary unit of an engagement facing opposite the primary', () => {
    const primary = createTestUnit('white', { attack: 3 });
    const secondary = createTestUnit('black', { attack: 3 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );

    const held = getUnitWithPlacementOnBoard(board, secondary);

    // Engaged units face one another: the secondary faces opposite the primary.
    expect(held.placement).toStrictEqual({
      coordinate: 'E-5',
      facing: 'south',
    });
  });

  it('throws when the unit is not on the board', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([]);

    expect(() => getUnitWithPlacementOnBoard(board, unit)).toThrow(
      'Unit not found on board',
    );
  });
});
