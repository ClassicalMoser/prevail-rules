import {
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyGameState, createUnitIndexKey } from '@factories';
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
    const state = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);

    // The unit steps one space north.
    const moved = moveUnitOnBoard(state, unit, {
      coordinate: 'D-5',
      facing: 'north',
    });

    // It stands at D-5 facing north, and E-5 is empty.
    expect(getBoardSpace(moved.boardState, 'D-5').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit,
    });
    expect(getBoardSpace(moved.boardState, 'E-5').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    // Its entry in the index moved with it, in the same write.
    expect(moved.index.units[createUnitIndexKey(unit)]).toBe('D-5');
  });

  it('turns a unit where it stands when sent to its own space with another facing', () => {
    // Black's unit at E-5, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const state = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);

    // A reverse turns the unit about without it going anywhere.
    const turned = moveUnitOnBoard(state, unit, {
      coordinate: 'E-5',
      facing: 'south',
    });

    // Still at E-5, now facing south.
    expect(getBoardSpace(turned.boardState, 'E-5').unitPresence).toStrictEqual({
      facing: 'south',
      presenceType: 'single',
      unit,
    });
  });

  it('sets a unit still engaged back with its enemy, as a reverse that turns nobody does', () => {
    // Black's unit on E-5 facing north, engaged with White's facing south.
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(black, white, 'E-5', 'north');

    // White's unit, still engaged, keeps its facing (§7.5.5).
    const held = moveUnitOnBoard(state, white, {
      coordinate: 'E-5',
      facing: 'south',
    });

    // The two still stand engaged on E-5, as they were.
    expect(getBoardSpace(held.boardState, 'E-5').unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: black,
      secondaryUnit: white,
    });
  });

  it('sets down the unit the board held, however the unit was named', () => {
    // The board holds a unit with Attack 3; it is named claiming Attack 99.
    const onBoard = createTestUnit('black', { attack: 3 });
    const state = createGameStateWithUnits([placed(onBoard, 'E-5', 'north')]);
    const claimed = {
      ...onBoard,
      unitType: {
        ...onBoard.unitType,
        stats: { ...onBoard.unitType.stats, attack: 99 },
      },
    };

    const moved = moveUnitOnBoard(state, claimed, {
      coordinate: 'D-5',
      facing: 'north',
    });

    // The unit at the new space is the one the board held.
    expect(getBoardSpace(moved.boardState, 'D-5').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit: onBoard,
    });
  });

  it('does not change the state it was given', () => {
    // Black's unit at E-5, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const state = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);

    moveUnitOnBoard(state, unit, { coordinate: 'D-5', facing: 'north' });

    // The state it was given still has the unit at E-5 facing north, and
    // filed there.
    expect(getBoardSpace(state.boardState, 'E-5').unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit,
    });
    expect(state.index.units[createUnitIndexKey(unit)]).toBe('E-5');
  });

  it('throws when the unit is not on the board', () => {
    // An empty board: the unit named stands nowhere.
    const unit = createTestUnit('black', { attack: 3 });
    const state = createEmptyGameState('standard');

    expect(() =>
      moveUnitOnBoard(state, unit, { coordinate: 'D-5', facing: 'north' }),
    ).toThrow('Unit not found on board');
  });
});
