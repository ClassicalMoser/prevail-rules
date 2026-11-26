import { findPlayerUnitWithPosition } from '@queries';

import { createGameStateWithSingleUnit } from './gameStateWithSingleUnit';

/** A new standard game with one unit on its board, chosen as `createBoardWithSingleUnit` chooses it. */
describe('createGameStateWithSingleUnit function', () => {
  it('stands the one unit on its space in a new standard game', () => {
    const state = createGameStateWithSingleUnit('E-5', 'black', {
      facing: 'east',
    });

    expect(state.boardState.boardType).toBe('standard');
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black')?.placement,
    ).toStrictEqual({ coordinate: 'E-5', facing: 'east' });
  });
});
