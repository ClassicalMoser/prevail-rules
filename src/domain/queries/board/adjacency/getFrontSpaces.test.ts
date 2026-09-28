import type { Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getFrontSpaces } from './getFrontSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetFrontSpaces: the three spaces in the unit's front arc (two flanking diagonals + forward), clipped to the board.
 */
describe('getFrontSpaces function', () => {
  it('the front arc of a north-facing unit at E-5 is the three spaces to the north', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['D-4', 'D-6', 'D-5']),
    );
  });

  it('the front arc of an east-facing unit at E-5 is the three spaces to the east', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'east')).toStrictEqual(
      new Set(['D-6', 'F-6', 'E-6']),
    );
  });

  it('the front arc of a south-facing unit at E-5 is the three spaces to the south', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'south')).toStrictEqual(
      new Set(['F-6', 'F-4', 'F-5']),
    );
  });

  it('the front arc of a west-facing unit at E-5 is the three spaces to the west', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'west')).toStrictEqual(
      new Set(['F-4', 'D-4', 'E-4']),
    );
  });

  it('the front arc of a northEast-facing unit at E-5 is the three spaces to the northEast', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['D-5', 'E-6', 'D-6']),
    );
  });

  it('the front arc of a southEast-facing unit at E-5 is the three spaces to the southEast', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'southEast')).toStrictEqual(
      new Set(['E-6', 'F-5', 'F-6']),
    );
  });

  it('the front arc of a southWest-facing unit at E-5 is the three spaces to the southWest', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'southWest')).toStrictEqual(
      new Set(['F-5', 'E-4', 'F-4']),
    );
  });

  it('the front arc of a northWest-facing unit at E-5 is the three spaces to the northWest', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'northWest')).toStrictEqual(
      new Set(['E-4', 'D-5', 'D-4']),
    );
  });

  it('the front arc of a south-facing unit at corner A-1 clips to the two in-bounds spaces', () => {
    expect(getFrontSpaces(standardBoard, 'A-1', 'south')).toStrictEqual(
      new Set(['B-2', 'B-1']),
    );
  });

  it('the front arc of an east-facing unit at corner A-1 clips to the two in-bounds spaces', () => {
    expect(getFrontSpaces(standardBoard, 'A-1', 'east')).toStrictEqual(
      new Set(['B-2', 'A-2']),
    );
  });

  it('the front arc of a north-facing unit at corner L-18 clips to the two in-bounds spaces', () => {
    expect(getFrontSpaces(standardBoard, 'L-18', 'north')).toStrictEqual(
      new Set(['K-17', 'K-18']),
    );
  });

  it('the front arc of a west-facing unit at corner L-18 clips to the two in-bounds spaces', () => {
    expect(getFrontSpaces(standardBoard, 'L-18', 'west')).toStrictEqual(
      new Set(['K-17', 'L-17']),
    );
  });

  it('a north-facing unit at A-5 has its front arc off the board', () => {
    expect(getFrontSpaces(standardBoard, 'A-5', 'north').size).toBe(0);
  });

  it('an east-facing unit at E-18 has its front arc off the board', () => {
    expect(getFrontSpaces(standardBoard, 'E-18', 'east').size).toBe(0);
  });

  it('row beyond board edge is rejected', () => {
    // Intentionally bad assertion to test the error message
    expect(() =>
      getFrontSpaces(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('column beyond board edge is rejected', () => {
    // Intentionally bad assertion to test the error message
    expect(() =>
      getFrontSpaces(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('invalid facing is rejected', () => {
    // Intentionally bad assertion to test the error message
    expect(() =>
      getFrontSpaces(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
