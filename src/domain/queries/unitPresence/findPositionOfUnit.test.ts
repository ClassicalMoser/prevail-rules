import type { Coordinate } from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { findPositionOfUnit } from './findPositionOfUnit';

/**
 * A unit can leave the board while it is still listed to act, so where it
 * stands has an answer for a unit that is gone: none.
 */
describe('findPositionOfUnit function', () => {
  it('finds a lone unit where it stands, facing as it was placed', () => {
    const unit = createTestUnit('black', { attack: 3 });
    const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

    expect(findPositionOfUnit(board, unit)).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
  });

  it('finds the primary of two engaged units facing as stored', () => {
    const primary = createTestUnit('black', { attack: 3 });
    const secondary = createTestUnit('white', { attack: 3 });
    const coordinate: Coordinate = 'E-5';
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      coordinate,
      'north',
    );

    expect(findPositionOfUnit(board, primary)).toStrictEqual({
      coordinate,
      facing: 'north',
    });
  });

  it('finds the secondary of two engaged units facing opposite the primary', () => {
    const primary = createTestUnit('white', { attack: 3 });
    const secondary = createTestUnit('black', { attack: 3 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );

    expect(findPositionOfUnit(board, secondary)).toStrictEqual({
      coordinate: 'E-5',
      facing: 'south',
    });
  });

  it('answers undefined for a unit that is not on the board', () => {
    // A routed unit has left the board; asking where it stands is not a fault.
    const gone = createTestUnit('black', { attack: 3 });

    expect(
      findPositionOfUnit(createEmptyStandardBoard(), gone),
    ).toBeUndefined();
  });

  it('answers undefined for a same-side unit with a different instance number', () => {
    // Two units of one type are different units.
    const onBoard = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('black', { instanceNumber: 2 });
    const board = createBoardWithUnits([placed(onBoard, 'E-5', 'north')]);

    expect(findPositionOfUnit(board, other)).toBeUndefined();
  });
});
