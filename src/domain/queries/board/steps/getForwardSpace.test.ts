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
    it('b-1 is one step forward from A-1 when facing south', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'south')).toBe('B-1');
    });

    it('a-2 is one step forward from A-1 when facing east', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'east')).toBe('A-2');
    });

    it('e-4 is one step forward from E-5 when facing west', () => {
      expect(getForwardSpace(standardBoard, 'E-5', 'west')).toBe('E-4');
    });

    it('f-10 is one step forward from G-10 when facing north', () => {
      expect(getForwardSpace(standardBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('b-2 is one step forward from A-1 when facing southEast', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'southEast')).toBe('B-2');
    });

    it('e-3 is one step forward from D-4 when facing southWest', () => {
      expect(getForwardSpace(standardBoard, 'D-4', 'southWest')).toBe('E-3');
    });

    it('j-12 is one step forward from K-11 when facing northEast', () => {
      expect(getForwardSpace(standardBoard, 'K-11', 'northEast')).toBe('J-12');
    });

    it('k-17 is one step forward from L-18 when facing northWest', () => {
      expect(getForwardSpace(standardBoard, 'L-18', 'northWest')).toBe('K-17');
    });

    it('there is no forward space from A-1 when facing north', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'north')).toBeUndefined();
    });

    it('there is no forward space from F-1 when facing west', () => {
      expect(getForwardSpace(standardBoard, 'F-1', 'west')).toBeUndefined();
    });

    it('there is no forward space from L-5 when facing south', () => {
      expect(getForwardSpace(standardBoard, 'L-5', 'south')).toBeUndefined();
    });

    it('there is no forward space from E-18 when facing east', () => {
      expect(getForwardSpace(standardBoard, 'E-18', 'east')).toBeUndefined();
    });

    it('there is no forward space from A-1 when facing northWest', () => {
      expect(
        getForwardSpace(standardBoard, 'A-1', 'northWest'),
      ).toBeUndefined();
    });

    it('there is no forward space from A-18 when facing northEast', () => {
      expect(
        getForwardSpace(standardBoard, 'A-18', 'northEast'),
      ).toBeUndefined();
    });

    it('there is no forward space from L-1 when facing southWest', () => {
      expect(
        getForwardSpace(standardBoard, 'L-1', 'southWest'),
      ).toBeUndefined();
    });

    it('there is no forward space from L-18 when facing southEast', () => {
      expect(
        getForwardSpace(standardBoard, 'L-18', 'southEast'),
      ).toBeUndefined();
    });

    it('there is no forward space from F-1 when facing northWest', () => {
      expect(
        getForwardSpace(standardBoard, 'F-1', 'northWest'),
      ).toBeUndefined();
    });

    it('there is no forward space from E-18 when facing northEast', () => {
      expect(
        getForwardSpace(standardBoard, 'E-18', 'northEast'),
      ).toBeUndefined();
    });

    it('there is no forward space from L-5 when facing southWest', () => {
      expect(
        getForwardSpace(standardBoard, 'L-5', 'southWest'),
      ).toBeUndefined();
    });

    it('there is no forward space from E-1 when facing northWest', () => {
      expect(
        getForwardSpace(standardBoard, 'E-1', 'northWest'),
      ).toBeUndefined();
    });

    it('a coordinate without a dash is rejected', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'invalid' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid coordinate: invalid'));
    });

    it('row beyond board edge is rejected', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'R-12' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: R'));
    });

    it('column beyond board edge is rejected', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'A-19' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 19'));
    });

    it('invalid facing is rejected', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });

  describe('small board', () => {
    it('b-1 is one step forward from A-1 when facing south', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'south')).toBe('B-1');
    });

    it('a-2 is one step forward from A-1 when facing east', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'east')).toBe('A-2');
    });

    it('e-4 is one step forward from E-5 when facing west', () => {
      expect(getForwardSpace(smallBoard, 'E-5', 'west')).toBe('E-4');
    });

    it('f-10 is one step forward from G-10 when facing north', () => {
      expect(getForwardSpace(smallBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('b-2 is one step forward from A-1 when facing southEast', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'southEast')).toBe('B-2');
    });

    it('e-3 is one step forward from D-4 when facing southWest', () => {
      expect(getForwardSpace(smallBoard, 'D-4', 'southWest')).toBe('E-3');
    });

    it('g-12 is one step forward from H-11 when facing northEast', () => {
      expect(getForwardSpace(smallBoard, 'H-11', 'northEast')).toBe('G-12');
    });

    it('g-11 is one step forward from H-12 when facing northWest', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'northWest')).toBe('G-11');
    });

    it('there is no forward space from H-5 when facing south', () => {
      expect(getForwardSpace(smallBoard, 'H-5', 'south')).toBeUndefined();
    });

    it('there is no forward space from H-10 when facing southEast', () => {
      expect(getForwardSpace(smallBoard, 'H-10', 'southEast')).toBeUndefined();
    });

    it('there is no forward space from H-3 when facing southWest', () => {
      expect(getForwardSpace(smallBoard, 'H-3', 'southWest')).toBeUndefined();
    });

    it('there is no forward space from E-12 when facing east', () => {
      expect(getForwardSpace(smallBoard, 'E-12', 'east')).toBeUndefined();
    });

    it('there is no forward space from A-12 when facing northEast', () => {
      expect(getForwardSpace(smallBoard, 'A-12', 'northEast')).toBeUndefined();
    });

    it('there is no forward space from D-12 when facing southEast', () => {
      expect(getForwardSpace(smallBoard, 'D-12', 'southEast')).toBeUndefined();
    });

    it('there is no forward space from H-12 when facing south', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'south')).toBeUndefined();
    });

    it('there is no forward space from H-12 when facing east', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'east')).toBeUndefined();
    });

    it('there is no forward space from H-12 when facing southEast', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'southEast')).toBeUndefined();
    });

    it('there is no forward space from A-1 when facing north', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'north')).toBeUndefined();
    });

    it('there is no forward space from F-1 when facing west', () => {
      expect(getForwardSpace(smallBoard, 'F-1', 'west')).toBeUndefined();
    });

    it('there is no forward space from A-1 when facing northWest', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'northWest')).toBeUndefined();
    });

    it('there is no forward space from H-1 when facing southWest', () => {
      expect(getForwardSpace(smallBoard, 'H-1', 'southWest')).toBeUndefined();
    });

    it('a coordinate without a dash is rejected', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'E5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid coordinate: E5'));
    });

    it('row I is rejected on the small board', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'I-5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: I'));
    });

    it('row L is rejected on the small board', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'L-5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: L'));
    });

    it('column 13 is rejected on the small board', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'A-13' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 13'));
    });

    it('column 18 is rejected on the small board', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'A-18' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 18'));
    });

    it('invalid facing is rejected', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });
});
