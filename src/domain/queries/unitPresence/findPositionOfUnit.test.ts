import type { Coordinate } from '@ruleValues';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createGameStateWithBoard,
  createTestUnit,
  placed,
  replaceBoard,
  withReservedUnits,
} from '@testing';
import {
  createEmptyGameState,
  createEmptyStandardBoard,
  createUnitIndexKey,
} from '@factories';

import { findPositionOfUnit } from './findPositionOfUnit';

/**
 * A unit can leave the board while it is still listed to act, so where it
 * stands has an answer for a unit that is gone: none.
 */
describe('findPositionOfUnit function', () => {
  it('finds a lone unit where it stands, facing as it was placed', () => {
    // A black unit alone at E-5, facing north.
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    expect(
      findPositionOfUnit(createGameStateWithBoard(board), unit),
    ).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
  });

  it('finds the primary of two engaged units facing as stored', () => {
    // Black stands at E-5 facing north; White has walked into it.
    const primary = createTestUnit('black', { attack: 3 });
    const secondary = createTestUnit('white', { attack: 3 });
    const coordinate: Coordinate = 'E-5';
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      coordinate,
      'north',
    );

    expect(
      findPositionOfUnit(createGameStateWithBoard(board), primary),
    ).toStrictEqual({
      coordinate,
      facing: 'north',
    });
  });

  it('finds the secondary of two engaged units facing opposite the primary', () => {
    // White stands at E-5 facing north; Black has walked into it, and the two
    // face one another.
    const primary = createTestUnit('white', { attack: 3 });
    const secondary = createTestUnit('black', { attack: 3 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );

    expect(
      findPositionOfUnit(createGameStateWithBoard(board), secondary),
    ).toStrictEqual({
      coordinate: 'E-5',
      facing: 'south',
    });
  });

  it('answers undefined for a unit that is not on the board', () => {
    // A routed unit has left the board; asking where it stands is not a fault.
    const gone = createTestUnit('black', { attack: 3 });

    expect(
      findPositionOfUnit(
        createGameStateWithBoard(createEmptyStandardBoard()),
        gone,
      ),
    ).toBeUndefined();
  });

  it('answers undefined for a same-side unit with a different instance number', () => {
    // Two units of one type are different units.
    const onBoard = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);

    expect(
      findPositionOfUnit(createGameStateWithBoard(board), other),
    ).toBeUndefined();
  });

  it('finds a separately built copy of the unit, by who it is', () => {
    // An event names a unit by side, type and number; the copy it carries is
    // never the board's own object.
    const onBoard = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const named = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);

    // Found where the board's copy stands.
    expect(
      findPositionOfUnit(createGameStateWithBoard(board), named),
    ).toStrictEqual({ coordinate: 'E-5', facing: 'north' });
  });

  it('answers undefined for a unit still waiting in reserve', () => {
    // Setup: the unit is in its army but not yet deployed.
    const unit = createTestUnit('black', { attack: 3 });
    const state = withReservedUnits(createEmptyGameState('standard'), [unit]);

    // Filed as reserved, so it stands nowhere on the board yet.
    expect(state.index.units[createUnitIndexKey(unit)]).toBe('reserved');
    expect(findPositionOfUnit(state, unit)).toBeUndefined();
  });

  it('answers undefined for a unit the index files as routed', () => {
    // The unit has routed: out of the game, off the board. The state is built
    // with it among the routed and its index worked out from that, rather
    // than routed in play, which would ask this subject where it stood.
    const unit = createTestUnit('black', { attack: 3 });
    const state = replaceBoard(
      { ...createEmptyGameState('standard'), routedUnits: [unit] },
      createEmptyStandardBoard(),
    );

    // Filed as routed, so it stands nowhere.
    expect(state.index.units[createUnitIndexKey(unit)]).toBe('routed');
    expect(findPositionOfUnit(state, unit)).toBeUndefined();
  });

  it('throws when the index puts a unit on a space that does not hold it', () => {
    // The board has the unit at E-5; an index written by hand says E-6.
    const unit = createTestUnit('black', { attack: 3 });
    const state = createGameStateWithBoard(
      createBoardWithUnits([placed(unit, 'E-5', 'north')]),
    );
    const key = createUnitIndexKey(unit);
    const misfiled = {
      ...state,
      index: { ...state.index, units: { [key]: 'E-6' as const } },
    };

    // Writes keep the two in step, so a disagreement is a fault, named.
    expect(() => findPositionOfUnit(misfiled, unit)).toThrow(
      `The index puts unit ${key} at E-6, but that space does not hold it`,
    );
  });

  it('throws when the index puts a unit on an engaged space it is not part of', () => {
    // Black and White are engaged at E-5; a third unit, black's second, is
    // filed there by an index written by hand.
    const state = createGameStateWithBoard(
      createBoardWithEngagedUnits(
        createTestUnit('black', { attack: 3 }),
        createTestUnit('white', { attack: 3 }),
        'E-5',
        'north',
      ),
    );
    const stray = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const key = createUnitIndexKey(stray);
    const misfiled = {
      ...state,
      index: { ...state.index, units: { [key]: 'E-5' as const } },
    };

    // Neither engaged unit is the one the index names: a fault, named.
    expect(() => findPositionOfUnit(misfiled, stray)).toThrow(
      `The index puts unit ${key} at E-5, but that space does not hold it`,
    );
  });
});
