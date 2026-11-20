import {
  createBoardWithUnits,
  createGameStateWithBoard,
  createTestUnit,
  placed,
} from '@testing';
import { getBoardSpace } from '@queries';

import { moveUnitOnBoard } from './moveUnitOnBoard';

/**
 * A unit lifted from where it stands and set down at its new placement: the
 * same change to the board for a move, a retreat, a turn or a reverse.
 */
describe('moveUnitOnBoard function', () => {
  it('sets the unit down where it is sent, and leaves the space it stood in empty', () => {
    // Black's unit at E-5, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    // The unit steps one space north.
    const moved = moveUnitOnBoard(createGameStateWithBoard(board), unit, {
      coordinate: 'D-5',
      facing: 'north',
    });

    // It stands at D-5 facing north, and E-5 is empty.
    expect(getBoardSpace(moved, 'D-5').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit,
    });
    expect(getBoardSpace(moved, 'E-5').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
  });

  it('turns a unit where it stands when sent to its own space with another facing', () => {
    // Black's unit at E-5, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    // A reverse turns the unit about without it going anywhere.
    const turned = moveUnitOnBoard(createGameStateWithBoard(board), unit, {
      coordinate: 'E-5',
      facing: 'south',
    });

    // Still at E-5, now facing south.
    expect(getBoardSpace(turned, 'E-5').unitPresence).toStrictEqual({
      facing: 'south',
      presenceType: 'single',
      unit,
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

    const moved = moveUnitOnBoard(createGameStateWithBoard(board), claimed, {
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
    // Black's unit at E-5, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    moveUnitOnBoard(createGameStateWithBoard(board), unit, {
      coordinate: 'D-5',
      facing: 'north',
    });

    // The board it was given still has the unit at E-5 facing north.
    expect(getBoardSpace(board, 'E-5').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit,
    });
  });

  it('throws when the unit is not on the board', () => {
    // An empty board: the unit named stands nowhere.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([]);

    expect(() =>
      moveUnitOnBoard(createGameStateWithBoard(board), unit, {
        coordinate: 'D-5',
        facing: 'north',
      }),
    ).toThrow('Unit not found on board');
  });
});
