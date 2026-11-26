import { createEmptyStandardBoard, createSingleUnitPresence } from '@factories';
import { getBoardSpace } from '@queries';
import { createTestUnit } from '@testing';
import { replaceBoardSpace } from './replaceBoardSpace';

/** One space of a board replaced, the rest left as they were. */
describe('replaceBoardSpace function', () => {
  it('puts the new space at its coordinate', () => {
    const board = createEmptyStandardBoard();
    const unit = createTestUnit('black');
    const space = {
      ...getBoardSpace(board, 'E-5'),
      unitPresence: createSingleUnitPresence(unit, 'north'),
    };

    const replaced = replaceBoardSpace(board, 'E-5', space);

    expect(getBoardSpace(replaced, 'E-5')).toBe(space);
  });

  it('leaves every other space as it was, and the board given untouched', () => {
    const board = createEmptyStandardBoard();
    const space = {
      ...getBoardSpace(board, 'E-5'),
      commanders: ['white' as const],
    };

    const replaced = replaceBoardSpace(board, 'E-5', space);

    expect(getBoardSpace(replaced, 'E-6')).toBe(getBoardSpace(board, 'E-6'));
    expect(getBoardSpace(board, 'E-5').commanders).toStrictEqual([]);
    expect(replaced.boardType).toBe('standard');
  });
});
