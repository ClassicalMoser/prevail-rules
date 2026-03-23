import { createBoardWithSingleUnit } from '@testing';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';

describe('getSingleUnitWithPlacementAtCoordinate', () => {
  it('returns unit with placement when space has a single unit', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      facing: 'south',
    });
    const u = getSingleUnitWithPlacementAtCoordinate(board, 'E-5');
    expect(u.placement.coordinate).toBe('E-5');
    expect(u.placement.facing).toBe('south');
    expect(u.unit.playerSide).toBe('white');
  });

  it('throws when space is not single-unit presence', () => {
    const board = createEmptyStandardBoard();
    expect(() => getSingleUnitWithPlacementAtCoordinate(board, 'E-5')).toThrow(
      'Expected exactly one unit at coordinate',
    );
  });
});
