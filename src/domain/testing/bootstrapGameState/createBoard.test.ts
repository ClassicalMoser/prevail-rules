import { findPlayerUnitWithPosition } from '@queries';
import { createBoard } from './createBoard';

/** The board half of `createGameState`: the units a spec lists, on a standard board. */
describe('createBoard function', () => {
  it('stands each listed unit on its space on a standard board', () => {
    const board = createBoard([
      ['E-5', 'black'],
      { coord: 'E-6', facing: 'south', player: 'white' },
    ]);

    expect(board.boardType).toBe('standard');
    expect(
      findPlayerUnitWithPosition(board, 'E-5', 'black')?.placement,
    ).toStrictEqual({ coordinate: 'E-5', facing: 'north' });
    expect(
      findPlayerUnitWithPosition(board, 'E-6', 'white')?.placement,
    ).toStrictEqual({ coordinate: 'E-6', facing: 'south' });
  });

  it('chooses an object’s unit by the stats it asks for', () => {
    const board = createBoard([
      { coord: 'E-6', flexibility: 2, player: 'white' },
    ]);

    expect(
      findPlayerUnitWithPosition(board, 'E-6', 'white')?.unit.unitType.stats
        .flexibility,
    ).toBe(2);
  });

  it('with no units, is an empty standard board', () => {
    const board = createBoard([]);

    expect(board.boardType).toBe('standard');
    expect(
      Object.values(board.board).every(
        (space) => space?.unitPresence.presenceType === 'none',
      ),
    ).toBe(true);
  });
});
