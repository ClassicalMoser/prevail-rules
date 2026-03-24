import { createBoardWithSingleUnit } from '@testing';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';

/**
 * getSingleUnitWithPlacementAtCoordinate: unit + placement when presence is exactly one unit; throws otherwise.
 */
describe('getSingleUnitWithPlacementAtCoordinate', () => {
  it('given single-unit presence, returns unit and placement', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      facing: 'south',
    });
    const u = getSingleUnitWithPlacementAtCoordinate(board, 'E-5');
    expect(u.placement.coordinate).toBe('E-5');
    expect(u.placement.facing).toBe('south');
    expect(u.unit.playerSide).toBe('white');
  });

  it('given empty or non-single presence, throws', () => {
    const board = createEmptyStandardBoard();
    expect(() => getSingleUnitWithPlacementAtCoordinate(board, 'E-5')).toThrow(
      'Expected exactly one unit at coordinate',
    );
  });
});
