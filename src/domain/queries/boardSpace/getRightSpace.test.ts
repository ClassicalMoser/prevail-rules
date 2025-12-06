import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
} from '@entities';
import { describe, expect, it } from 'vitest';
import { createEmptyStandardBoard } from '../createEmptyBoard';
import { getRightSpace } from './getRightSpace';


const standardBoard: StandardBoard = createEmptyStandardBoard();

describe('getRightSpace', () => {
  it('should return the right space when facing north from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'north')).toBe('E-6');
  });
  it('should return the right space when facing east from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'east')).toBe('F-5');
  });
  it('should return the right space when facing south from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'south')).toBe('E-4');
  });
  it('should return the right space when facing west from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'west')).toBe('D-5');
  });

  it('should return the right space when facing northEast from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'northEast')).toBe('F-6');
  });
  it('should return the right space when facing southEast from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'southEast')).toBe('F-4');
  });
  it('should return the right space when facing southWest from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'southWest')).toBe('D-4');
  });
  it('should return the right space when facing northWest from E5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'northWest')).toBe('D-6');
  });

  it('should return undefined when facing north from E18 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'E-18', 'north')).toBeUndefined();
  });
  it('should return undefined when facing east from L5 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'L-5', 'east')).toBeUndefined();
  });
  it('should return undefined when facing south from E1 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'E-1', 'south')).toBeUndefined();
  });
  it('should return undefined when facing west from A5 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'A-5', 'west')).toBeUndefined();
  });

  it('should return undefined when facing northEast from L18 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'L-18', 'northEast')).toBeUndefined();
  });
  it('should return undefined when facing southEast from L1 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'L-1', 'southEast')).toBeUndefined();
  });
  it('should return undefined when facing southWest from A1 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'A-1', 'southWest')).toBeUndefined();
  });
  it('should return undefined when facing northWest from A18 (out of bounds)', () => {
    expect(getRightSpace(standardBoard, 'A-18', 'northWest')).toBeUndefined();
  });

  it('should throw an error if the row is invalid', () => {
    expect(() =>
      getRightSpace(standardBoard, 'R-12' as StandardBoardCoordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('should throw an error if the column is invalid', () => {
    expect(() =>
      getRightSpace(standardBoard, 'A-19' as StandardBoardCoordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('should throw an error if the facing is invalid', () => {
    expect(() =>
      getRightSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
