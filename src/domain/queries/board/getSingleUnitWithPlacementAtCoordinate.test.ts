import { createEmptyStandardBoard } from '@factories';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';

import { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';

/**
 * The lone unit on a space, with where it stands and the way it faces. An
 * engagement begins only on a space a single enemy holds (§6.1.1), so its
 * defender is read this way, and any other space here is a fault.
 */
describe('getSingleUnitWithPlacementAtCoordinate function', () => {
  it('is the lone unit on the space, with the way it faces', () => {
    // A white unit stands alone on E-5, facing south.
    const unit = createTestUnit('white');
    const board = createBoardWithUnits([placed(unit, 'E-5', 'south')]);

    const defender = getSingleUnitWithPlacementAtCoordinate(board, 'E-5');

    // That unit, on E-5, facing south.
    expect(defender).toStrictEqual({
      placement: { coordinate: 'E-5', facing: 'south' },
      unit,
    });
  });

  it('refuses an empty space', () => {
    // Nobody stands on E-5.
    const board = createEmptyStandardBoard();

    // There is no defender to read.
    expect(() => getSingleUnitWithPlacementAtCoordinate(board, 'E-5')).toThrow(
      'Expected exactly one unit at coordinate',
    );
  });

  it('refuses a space already engaged', () => {
    // A white unit and a black one engaged on E-5.
    const board = createBoardWithEngagedUnits(
      createTestUnit('white'),
      createTestUnit('black'),
      'E-5',
    );

    // An engaged space holds two units, not one defender.
    expect(() => getSingleUnitWithPlacementAtCoordinate(board, 'E-5')).toThrow(
      'Expected exactly one unit at coordinate',
    );
  });
});
