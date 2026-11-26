import { findPlayerUnitWithPosition } from '@queries';
import { createBoard } from './createBoard';

describe('createBoard function', () => {
  it('given defaults, creates a board with units using tuple syntax', () => {
    const board = createBoard([
      ['E-5', 'black'],
      ['E-6', 'white'],
    ]);
    expect(board.boardType).toBe('standard');
    const blackUnit = findPlayerUnitWithPosition(board, 'E-5', 'black');
    const whiteUnit = findPlayerUnitWithPosition(board, 'E-6', 'white');
    expect(blackUnit).toBeDefined();
    expect(whiteUnit).toBeDefined();
  });

  it('given defaults, creates a board with units using object syntax', () => {
    const board = createBoard([
      { attack: 3, coord: 'E-5', player: 'black' },
      { coord: 'E-6', flexibility: 2, player: 'white' },
    ]);
    const blackUnit = findPlayerUnitWithPosition(board, 'E-5', 'black');
    const whiteUnit = findPlayerUnitWithPosition(board, 'E-6', 'white');
    expect(blackUnit).toBeDefined();
    expect(whiteUnit).toBeDefined();
  });

  it('given no units provided, creates an empty board', () => {
    const board = createBoard([]);
    expect(board.boardType).toBe('standard');
  });
});
