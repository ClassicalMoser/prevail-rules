import { createBoardWithSingleUnit, createTestUnit } from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';
import { addUnitToBoard } from '@transforms';

/**
 * GetSingleUnitWithPlacementAtCoordinate: unit + placement when presence is exactly one unit; throws otherwise.
 */
describe(getSingleUnitWithPlacementAtCoordinate, () => {
  it('returns the unit and its placement when one unit occupies the space', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      facing: 'south',
    });
    const u = getSingleUnitWithPlacementAtCoordinate(board, 'E-5');
    expect(u.placement.coordinate).toBe('E-5');
    expect(u.placement.facing).toBe('south');
    expect(u.unit.playerSide).toBe('white');
  });

  it('throws when the space is empty', () => {
    const board = createEmptyStandardBoard();
    expect(() => getSingleUnitWithPlacementAtCoordinate(board, 'E-5')).toThrow(
      'Expected exactly one unit at coordinate',
    );
  });

  it('throws when the space has multiple units', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      facing: 'south',
    });
    const boardWithMultipleUnits = addUnitToBoard(board, {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: createTestUnit('black', { attack: 3 }),
    });
    expect(() =>
      getSingleUnitWithPlacementAtCoordinate(boardWithMultipleUnits, 'E-5'),
    ).toThrow('Expected exactly one unit at coordinate');
  });
});
