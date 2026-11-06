import { getPlayerUnitWithPosition } from '@queries';
import { placed } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import { createBoardWithUnits } from './boardWithUnits';

/**
 * CreateBoardWithUnits: Creates a board with units at specified positions.
 */
describe('createBoardWithUnits function', () => {
  it('given place multiple units on board', () => {
    const unit1 = createTestUnit('black');
    const unit2 = createTestUnit('white');
    const board = createBoardWithUnits([
      placed(unit1, 'E-5', 'north'),
      placed(unit2, 'E-6', 'south'),
    ]);
    expect(board.boardType).toBe('standard');
    const atE5 = getPlayerUnitWithPosition(board, 'E-5', 'black');
    const atE6 = getPlayerUnitWithPosition(board, 'E-6', 'white');
    expect(atE5?.unit).toBe(unit1);
    expect(atE6?.unit).toBe(unit2);
  });

  it('given no units, returns empty board', () => {
    const board = createBoardWithUnits([]);
    expect(board.boardType).toBe('standard');
  });
});
