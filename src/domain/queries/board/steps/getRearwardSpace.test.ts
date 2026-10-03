import type { Board, Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getRearwardSpace } from './getRearwardSpace';

const standardBoard: Board = createEmptyStandardBoard();

/**
 * GetRearwardSpace: one step backward from a coordinate along the facing (opposite forward); undefined off board;
 * throws on invalid coordinate or facing.
 */
describe('getRearwardSpace function', () => {
  it('f-5 is one step backward from E-5 when facing north', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'north')).toBe('F-5');
  });

  it('e-4 is one step backward from E-5 when facing east', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'east')).toBe('E-4');
  });

  it('d-5 is one step backward from E-5 when facing south', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'south')).toBe('D-5');
  });

  it('e-6 is one step backward from E-5 when facing west', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'west')).toBe('E-6');
  });

  it('f-4 is one step backward from E-5 when facing northEast', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'northEast')).toBe('F-4');
  });

  it('d-4 is one step backward from E-5 when facing southEast', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'southEast')).toBe('D-4');
  });

  it('d-6 is one step backward from E-5 when facing southWest', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'southWest')).toBe('D-6');
  });

  it('f-6 is one step backward from E-5 when facing northWest', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'northWest')).toBe('F-6');
  });

  it('there is no rearward space from A-1 when facing south', () => {
    expect(getRearwardSpace(standardBoard, 'A-1', 'south')).toBeUndefined();
  });

  it('there is no rearward space from F-1 when facing east', () => {
    expect(getRearwardSpace(standardBoard, 'F-1', 'east')).toBeUndefined();
  });

  it('there is no rearward space from L-5 when facing north', () => {
    expect(getRearwardSpace(standardBoard, 'L-5', 'north')).toBeUndefined();
  });

  it('there is no rearward space from E-18 when facing west', () => {
    expect(getRearwardSpace(standardBoard, 'E-18', 'west')).toBeUndefined();
  });

  it('there is no rearward space from A-1 when facing southWest', () => {
    expect(getRearwardSpace(standardBoard, 'A-1', 'southWest')).toBeUndefined();
  });

  it('there is no rearward space from A-18 when facing southEast', () => {
    expect(
      getRearwardSpace(standardBoard, 'A-18', 'southEast'),
    ).toBeUndefined();
  });

  it('there is no rearward space from L-1 when facing northWest', () => {
    expect(getRearwardSpace(standardBoard, 'L-1', 'northWest')).toBeUndefined();
  });

  it('there is no rearward space from L-18 when facing northEast', () => {
    expect(
      getRearwardSpace(standardBoard, 'L-18', 'northEast'),
    ).toBeUndefined();
  });

  it('row beyond board edge is rejected', () => {
    expect(() =>
      getRearwardSpace(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('column beyond board edge is rejected', () => {
    expect(() =>
      getRearwardSpace(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('invalid facing is rejected', () => {
    expect(() =>
      getRearwardSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
