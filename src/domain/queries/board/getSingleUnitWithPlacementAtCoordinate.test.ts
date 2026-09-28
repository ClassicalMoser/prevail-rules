import { createBoardWithSingleUnit, createTestUnit } from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { getSingleUnitWithPlacementAtCoordinate } from './getSingleUnitWithPlacementAtCoordinate';
import { addUnitToBoard } from '@transforms';

/**
 * GetSingleUnitWithPlacementAtCoordinate: unit + placement when presence is exactly one unit; throws otherwise.
 */
describe(getSingleUnitWithPlacementAtCoordinate, () => {
  it('one unit on a space is found, including its placement', () => {
    const board = createBoardWithSingleUnit('E-5', 'white', {
      facing: 'south',
    });
    const u = getSingleUnitWithPlacementAtCoordinate(board, 'E-5');
    expect(u.placement.coordinate).toBe('E-5');
    expect(u.placement.facing).toBe('south');
    expect(u.unit.playerSide).toBe('white');
  });

  it('an empty space is rejected', () => {
    const board = createEmptyStandardBoard();
    expect(() => getSingleUnitWithPlacementAtCoordinate(board, 'E-5')).toThrow(
      'Expected exactly one unit at coordinate',
    );
  });

  it('multiple units on a space are rejected', () => {
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
