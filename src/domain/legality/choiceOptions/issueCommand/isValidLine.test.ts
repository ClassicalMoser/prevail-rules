import type {
  Board,
  Coordinate,
  Line,
  UnitFacing,
  UnitWithPlacement,
} from '@entities';
import { createEmptyStandardBoard } from '@factories';
import { createTestUnit } from '@testing';

import { isValidLine } from './isValidLine';

/**
 * A line of one side, along a row, each unit facing `facing`.
 * `isValidLine` reads the coordinates and facings, not the board's occupants.
 */
function lineAlong(
  coordinates: readonly Coordinate[],
  facing: UnitFacing,
  playerSide: 'black' | 'white' = 'black',
): Line {
  const unitPlacements = coordinates.map((coordinate, index) => {
    const unit = createTestUnit(playerSide, {
      attack: 3,
      instanceNumber: index + 1,
    });
    const withPlacement: UnitWithPlacement = {
      placement: { coordinate, facing },
      unit,
    };
    return withPlacement;
  });
  const line: Line = { unitPlacements };
  return line;
}

function pair(first: UnitWithPlacement, second: UnitWithPlacement): Line {
  const line: Line = {
    unitPlacements: [first, second],
  };
  return line;
}

/**
 * A line holds one to eight units of one side, contiguous on the perpendicular
 * of their facing, each facing that way or the opposite.
 */
describe(isValidLine, () => {
  const board: Board = createEmptyStandardBoard();

  it('one unit is a valid line', () => {
    const line = lineAlong(['E-5'], 'north');

    expect(isValidLine(board, line)).toStrictEqual({ result: true });
  });

  it('two units facing the same way are a valid line', () => {
    const line = lineAlong(['E-5', 'E-6'], 'north');

    expect(isValidLine(board, line)).toStrictEqual({ result: true });
  });

  it('two units facing opposite ways are a valid line', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const line = pair(
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'south' }, unit: second },
    );

    expect(isValidLine(board, line)).toStrictEqual({ result: true });
  });

  it('eight units in a row are a valid line', () => {
    const line = lineAlong(
      ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8'],
      'north',
    );

    expect(isValidLine(board, line)).toStrictEqual({ result: true });
  });

  it('two units on the perpendicular of a diagonal facing are a valid line', () => {
    // North-east facing lines up north-west to south-east. D-4 is one step north-west of E-5.
    const line = lineAlong(['E-5', 'D-4'], 'northEast');

    expect(isValidLine(board, line)).toStrictEqual({ result: true });
  });

  it('a unit facing the opposite way on that diagonal is a valid line', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const line = pair(
      { placement: { coordinate: 'E-5', facing: 'northEast' }, unit: first },
      { placement: { coordinate: 'D-4', facing: 'southWest' }, unit: second },
    );

    expect(isValidLine(board, line)).toStrictEqual({ result: true });
  });

  it('an empty line is invalid', () => {
    const line: Line = { unitPlacements: [] };

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Line length is invalid',
      result: false,
    });
  });

  it('nine units is longer than a line', () => {
    const line = lineAlong(
      ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'],
      'north',
    );

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Line length is invalid',
      result: false,
    });
  });

  it('units on different sides are invalid', () => {
    const black = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const white = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const line = pair(
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: black },
      { placement: { coordinate: 'E-6', facing: 'north' }, unit: white },
    );

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Units are not on the same side',
      result: false,
    });
  });

  it('a unit facing east is an invalid partner for a unit facing north', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const line = pair(
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'east' }, unit: second },
    );

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Invalid facings present',
      result: false,
    });
  });

  it('a gap between units is invalid', () => {
    const line = lineAlong(['E-5', 'E-7'], 'north');

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Units are not contiguous',
      result: false,
    });
  });

  it('a unit straight ahead is not beside its neighbor', () => {
    const line = lineAlong(['E-5', 'F-5'], 'north');

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Units are not contiguous',
      result: false,
    });
  });

  it('a diagonal facing rejects a neighbor off the perpendicular', () => {
    // North-east flanking spaces of E-5 are D-4 and F-6. D-5 is not one of them.
    const line = lineAlong(['E-5', 'D-5'], 'northEast');

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Units are not contiguous',
      result: false,
    });
  });

  it('a malformed coordinate is an invalid line, not a throw', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const line = pair(
      {
        // The type forbids this row; getFlankingSpaces throws, and the catch maps it.
        placement: { coordinate: 'R-12' as Coordinate, facing: 'north' },
        unit: first,
      },
      {
        placement: { coordinate: 'E-6', facing: 'north' },
        unit: second,
      },
    );

    expect(isValidLine(board, line)).toStrictEqual({
      errorReason: 'Invalid row: R',
      result: false,
    });
  });
});
