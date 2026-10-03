import type { Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getBackSpaces } from './getBackSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetBackSpaces: the three spaces in the unit's rear arc (mirror of front arc for the opposite facing).
 */
describe('getBackSpaces function', () => {
  it('the rear arc of a north-facing unit at E-5 is the three spaces to the south', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['F-6', 'F-4', 'F-5']),
    );
  });

  it('the rear arc of an east-facing unit at E-5 is the three spaces to the west', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'east')).toStrictEqual(
      new Set(['F-4', 'D-4', 'E-4']),
    );
  });

  it('the rear arc of a south-facing unit at E-5 is the three spaces to the north', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'south')).toStrictEqual(
      new Set(['D-4', 'D-6', 'D-5']),
    );
  });

  it('the rear arc of a west-facing unit at E-5 is the three spaces to the east', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'west')).toStrictEqual(
      new Set(['D-6', 'F-6', 'E-6']),
    );
  });

  it('the rear arc of a northEast-facing unit at E-5 is the three spaces to the southWest', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['F-5', 'E-4', 'F-4']),
    );
  });

  it('the rear arc of a southEast-facing unit at E-5 is the three spaces to the northWest', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'southEast')).toStrictEqual(
      new Set(['E-4', 'D-5', 'D-4']),
    );
  });

  it('the rear arc of a southWest-facing unit at E-5 is the three spaces to the northEast', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'southWest')).toStrictEqual(
      new Set(['D-5', 'E-6', 'D-6']),
    );
  });

  it('the rear arc of a northWest-facing unit at E-5 is the three spaces to the southEast', () => {
    expect(getBackSpaces(standardBoard, 'E-5', 'northWest')).toStrictEqual(
      new Set(['E-6', 'F-5', 'F-6']),
    );
  });

  it('the rear arc of a north-facing unit at corner A-1 clips to the two in-bounds spaces', () => {
    expect(getBackSpaces(standardBoard, 'A-1', 'north')).toStrictEqual(
      new Set(['B-2', 'B-1']),
    );
  });

  it('the rear arc of a south-facing unit at corner L-18 clips to the two in-bounds spaces', () => {
    expect(getBackSpaces(standardBoard, 'L-18', 'south')).toStrictEqual(
      new Set(['K-17', 'K-18']),
    );
  });

  it('the rear arc is empty when the unit is at a corner and facing the center', () => {
    expect(getBackSpaces(standardBoard, 'A-1', 'southEast')).toStrictEqual(
      new Set(),
    );
  });

  it('row beyond board edge is rejected', () => {
    // Intentionally bad type cast to test error path
    expect(() =>
      getBackSpaces(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('column beyond board edge is rejected', () => {
    // Intentionally bad type cast to test error path
    expect(() =>
      getBackSpaces(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('invalid facing is rejected', () => {
    // Intentionally bad type cast to test error path
    expect(() =>
      getBackSpaces(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
