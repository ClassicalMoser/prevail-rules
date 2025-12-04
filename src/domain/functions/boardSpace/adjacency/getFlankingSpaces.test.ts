import type { StandardBoardCoordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard, getFlankingSpaces } from '@functions';
import { describe, expect, it } from 'vitest';

const standardBoard = createEmptyStandardBoard();

describe('getFlankingSpaces', () => {
  it('should return the flanking spaces for orthogonal facing directions', () => {
    // For north facing, flanking spaces are west and east (orthogonal to north)
    expect(getFlankingSpaces(standardBoard, 'E-5', 'north')).toEqual(
      new Set(['E-4', 'E-6']),
    );
    // For east facing, flanking spaces are north and south (orthogonal to east)
    expect(getFlankingSpaces(standardBoard, 'E-5', 'east')).toEqual(
      new Set(['D-5', 'F-5']),
    );
    // For south facing, flanking spaces are east and west (orthogonal to south)
    expect(getFlankingSpaces(standardBoard, 'E-5', 'south')).toEqual(
      new Set(['E-6', 'E-4']),
    );
    // For west facing, flanking spaces are south and north (orthogonal to west)
    expect(getFlankingSpaces(standardBoard, 'E-5', 'west')).toEqual(
      new Set(['F-5', 'D-5']),
    );
  });

  it('should return the flanking spaces for diagonal facing directions', () => {
    // For northEast facing, flanking spaces are northWest and southEast
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northEast')).toEqual(
      new Set(['D-4', 'F-6']),
    );
    // For southEast facing, flanking spaces are northEast and southWest
    expect(getFlankingSpaces(standardBoard, 'E-5', 'southEast')).toEqual(
      new Set(['D-6', 'F-4']),
    );
    // For southWest facing, flanking spaces are southEast and northWest
    expect(getFlankingSpaces(standardBoard, 'E-5', 'southWest')).toEqual(
      new Set(['F-6', 'D-4']),
    );
    // For northWest facing, flanking spaces are southWest and northEast
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northWest')).toEqual(
      new Set(['F-4', 'D-6']),
    );
  });

  it('should filter out out-of-bounds spaces', () => {
    // At corner A1 facing north, flanking spaces are west and east (west is out of bounds)
    expect(getFlankingSpaces(standardBoard, 'A-1', 'north')).toEqual(
      new Set(['A-2']),
    );
    // At corner A1 facing east, flanking spaces are north and south (north is out of bounds)
    expect(getFlankingSpaces(standardBoard, 'A-1', 'east')).toEqual(
      new Set(['B-1']),
    );
    // At corner L18 facing south, flanking spaces are east and west (east is out of bounds)
    expect(getFlankingSpaces(standardBoard, 'L-18', 'south')).toEqual(
      new Set(['L-17']),
    );
    // At corner L18 facing west, flanking spaces are south and north (south is out of bounds)
    expect(getFlankingSpaces(standardBoard, 'L-18', 'west')).toEqual(
      new Set(['K-18']),
    );
  });

  it('should return empty array if both flanking spaces are out of bounds', () => {
    expect(getFlankingSpaces(standardBoard, 'A-1', 'northWest')).toEqual(
      new Set([]),
    );
    expect(getFlankingSpaces(standardBoard, 'L-1', 'southWest')).toEqual(
      new Set([]),
    );
  });

  it('should throw an error if the row is invalid', () => {
    expect(() =>
      getFlankingSpaces(
        standardBoard,
        'R-12' as StandardBoardCoordinate,
        'north',
      ),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('should throw an error if the column is invalid', () => {
    expect(() =>
      getFlankingSpaces(
        standardBoard,
        'A-19' as StandardBoardCoordinate,
        'north',
      ),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('should throw an error if the facing is invalid', () => {
    expect(() =>
      getFlankingSpaces(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
