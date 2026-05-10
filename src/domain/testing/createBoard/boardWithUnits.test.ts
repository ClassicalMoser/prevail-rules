import { getPlayerUnitWithPosition } from '@queries';
import { createTestUnit } from '@testing/unitHelpers';

import { createBoardWithUnits } from './boardWithUnits';

/**
 * CreateBoardWithUnits: Creates a board with units at specified positions.
 */
describe(createBoardWithUnits, () => {
  it('given place multiple units on board', () => {
    const unit1 = createTestUnit('black');
    const unit2 = createTestUnit('white');
    const board = createBoardWithUnits([
      { coordinate: 'E-5', facing: 'north', unit: unit1 },
      { coordinate: 'E-6', facing: 'south', unit: unit2 },
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
