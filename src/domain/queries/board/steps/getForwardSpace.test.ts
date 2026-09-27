import type { Board, Coordinate, UnitFacing } from '@entities';
import { createEmptySmallBoard, createEmptyStandardBoard } from '@factories';

import { getForwardSpace } from './getForwardSpace';

const standardBoard: Board = createEmptyStandardBoard();
const smallBoard: Board = createEmptySmallBoard();

/**
 * GetForwardSpace: one step forward along facing using the active board’s layout;
 * undefined off that board’s edge; throws on malformed coord / invalid facing.
 */
describe(getForwardSpace, () => {
  describe('standard board', () => {
    it('returns B-1 when facing south from A-1', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'south')).toBe('B-1');
    });

    it('returns A-2 when facing east from A-1', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'east')).toBe('A-2');
    });

    it('returns E-4 when facing west from E-5', () => {
      expect(getForwardSpace(standardBoard, 'E-5', 'west')).toBe('E-4');
    });

    it('returns F-10 when facing north from G-10', () => {
      expect(getForwardSpace(standardBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('returns B-2 when facing southEast from A-1', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'southEast')).toBe('B-2');
    });

    it('returns E-3 when facing southWest from D-4', () => {
      expect(getForwardSpace(standardBoard, 'D-4', 'southWest')).toBe('E-3');
    });

    it('returns J-12 when facing northEast from K-11', () => {
      expect(getForwardSpace(standardBoard, 'K-11', 'northEast')).toBe('J-12');
    });

    it('returns K-17 when facing northWest from L-18', () => {
      expect(getForwardSpace(standardBoard, 'L-18', 'northWest')).toBe('K-17');
    });

    it('returns undefined when facing north from A-1', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'north')).toBeUndefined();
    });

    it('returns undefined when facing west from F-1', () => {
      expect(getForwardSpace(standardBoard, 'F-1', 'west')).toBeUndefined();
    });

    it('returns undefined when facing south from L-5', () => {
      expect(getForwardSpace(standardBoard, 'L-5', 'south')).toBeUndefined();
    });

    it('returns undefined when facing east from E-18', () => {
      expect(getForwardSpace(standardBoard, 'E-18', 'east')).toBeUndefined();
    });

    it('returns undefined when facing northWest from A-1', () => {
      expect(
        getForwardSpace(standardBoard, 'A-1', 'northWest'),
      ).toBeUndefined();
    });

    it('returns undefined when facing northEast from A-18', () => {
      expect(
        getForwardSpace(standardBoard, 'A-18', 'northEast'),
      ).toBeUndefined();
    });

    it('returns undefined when facing southWest from L-1', () => {
      expect(
        getForwardSpace(standardBoard, 'L-1', 'southWest'),
      ).toBeUndefined();
    });

    it('returns undefined when facing southEast from L-18', () => {
      expect(
        getForwardSpace(standardBoard, 'L-18', 'southEast'),
      ).toBeUndefined();
    });

    it('returns undefined when facing northWest from F-1', () => {
      expect(
        getForwardSpace(standardBoard, 'F-1', 'northWest'),
      ).toBeUndefined();
    });

    it('returns undefined when facing northEast from E-18', () => {
      expect(
        getForwardSpace(standardBoard, 'E-18', 'northEast'),
      ).toBeUndefined();
    });

    it('returns undefined when facing southWest from L-5', () => {
      expect(
        getForwardSpace(standardBoard, 'L-5', 'southWest'),
      ).toBeUndefined();
    });

    it('returns undefined when facing northWest from E-1', () => {
      expect(
        getForwardSpace(standardBoard, 'E-1', 'northWest'),
      ).toBeUndefined();
    });

    it('throws when the coordinate is missing its dash', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'invalid' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid coordinate: invalid'));
    });

    it('throws when the row letter is invalid', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'R-12' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: R'));
    });

    it('throws when the column is invalid', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'A-19' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 19'));
    });

    it('throws when the facing is invalid', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });

  describe('small board', () => {
    it('returns B-1 when facing south from A-1', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'south')).toBe('B-1');
    });

    it('returns A-2 when facing east from A-1', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'east')).toBe('A-2');
    });

    it('returns E-4 when facing west from E-5', () => {
      expect(getForwardSpace(smallBoard, 'E-5', 'west')).toBe('E-4');
    });

    it('returns F-10 when facing north from G-10', () => {
      expect(getForwardSpace(smallBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('returns B-2 when facing southEast from A-1', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'southEast')).toBe('B-2');
    });

    it('returns E-3 when facing southWest from D-4', () => {
      expect(getForwardSpace(smallBoard, 'D-4', 'southWest')).toBe('E-3');
    });

    it('returns G-12 when facing northEast from H-11', () => {
      expect(getForwardSpace(smallBoard, 'H-11', 'northEast')).toBe('G-12');
    });

    it('returns G-11 when facing northWest from H-12', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'northWest')).toBe('G-11');
    });

    it('returns undefined when facing south from H-5', () => {
      expect(getForwardSpace(smallBoard, 'H-5', 'south')).toBeUndefined();
    });

    it('returns undefined when facing southEast from H-10', () => {
      expect(getForwardSpace(smallBoard, 'H-10', 'southEast')).toBeUndefined();
    });

    it('returns undefined when facing southWest from H-3', () => {
      expect(getForwardSpace(smallBoard, 'H-3', 'southWest')).toBeUndefined();
    });

    it('returns undefined when facing east from E-12', () => {
      expect(getForwardSpace(smallBoard, 'E-12', 'east')).toBeUndefined();
    });

    it('returns undefined when facing northEast from A-12', () => {
      expect(getForwardSpace(smallBoard, 'A-12', 'northEast')).toBeUndefined();
    });

    it('returns undefined when facing southEast from D-12', () => {
      expect(getForwardSpace(smallBoard, 'D-12', 'southEast')).toBeUndefined();
    });

    it('returns undefined when facing south from H-12', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'south')).toBeUndefined();
    });

    it('returns undefined when facing east from H-12', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'east')).toBeUndefined();
    });

    it('returns undefined when facing southEast from H-12', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'southEast')).toBeUndefined();
    });

    it('returns undefined when facing north from A-1', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'north')).toBeUndefined();
    });

    it('returns undefined when facing west from F-1', () => {
      expect(getForwardSpace(smallBoard, 'F-1', 'west')).toBeUndefined();
    });

    it('returns undefined when facing northWest from A-1', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'northWest')).toBeUndefined();
    });

    it('returns undefined when facing southWest from H-1', () => {
      expect(getForwardSpace(smallBoard, 'H-1', 'southWest')).toBeUndefined();
    });

    it('throws when the coordinate is missing its dash', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'E5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid coordinate: E5'));
    });

    it('throws on the small board when the row is standard-only I', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'I-5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: I'));
    });

    it('throws on the small board when the row is standard-only L', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'L-5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: L'));
    });

    it('throws on the small board when the column is standard-only 13', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'A-13' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 13'));
    });

    it('throws on the small board when the column is standard-only 18', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'A-18' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 18'));
    });

    it('throws when the facing is invalid', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });
});
