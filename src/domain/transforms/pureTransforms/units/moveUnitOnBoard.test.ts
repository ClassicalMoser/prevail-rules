import { createTestUnit, createBoardWithUnits, placed } from '@testing';
import { getPositionOfUnit, getBoardSpace } from '@queries';

import { moveUnitOnBoard } from './moveUnitOnBoard';

describe('moveUnitOnBoard function', () => {
  it('sets the unit down where it is sent, and leaves the space it stood in empty', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    // The unit steps one space north.
    const moved = moveUnitOnBoard(board, unit, {
      coordinate: 'D-5',
      facing: 'north',
    });

    expect(getPositionOfUnit(moved, unit)).toStrictEqual({
      coordinate: 'D-5',
      facing: 'north',
    });
    expect(getBoardSpace(moved, 'E-5').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
  });

  it('turns a unit where it stands when sent to its own space with another facing', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    // A reverse turns the unit about without it going anywhere.
    const turned = moveUnitOnBoard(board, unit, {
      coordinate: 'E-5',
      facing: 'south',
    });

    expect(getPositionOfUnit(turned, unit)).toStrictEqual({
      coordinate: 'E-5',
      facing: 'south',
    });
  });

  it('sets down the unit the board held, however the unit was named', () => {
    // The board holds a unit with Attack 3; it is named claiming Attack 99.
    const onBoard = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);
    const claimed = {
      ...onBoard,
      unitType: {
        ...onBoard.unitType,
        stats: { ...onBoard.unitType.stats, attack: 99 },
      },
    };

    const moved = moveUnitOnBoard(board, claimed, {
      coordinate: 'D-5',
      facing: 'north',
    });

    // The unit at the new space is the one the board held.
    expect(getBoardSpace(moved, 'D-5').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit: onBoard,
    });
  });

  it('does not change the board it was given', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    moveUnitOnBoard(board, unit, { coordinate: 'D-5', facing: 'north' });

    expect(getPositionOfUnit(board, unit)).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
  });

  it('throws when the unit is not on the board', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([]);

    expect(() =>
      moveUnitOnBoard(board, unit, { coordinate: 'D-5', facing: 'north' }),
    ).toThrow('Unit not found on board');
  });
});
