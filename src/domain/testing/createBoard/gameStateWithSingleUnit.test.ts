import { findPlayerUnitWithPosition } from '@queries';
import { createGameStateWithSingleUnit } from './gameStateWithSingleUnit';

/**
 * CreateGameStateWithSingleUnit: Creates a game state with a single unit at a coordinate.
 */
describe('createGameStateWithSingleUnit function', () => {
  it('given context, returns game state with single unit on board', () => {
    const state = createGameStateWithSingleUnit('E-5', 'black');
    expect(state.boardState.boardType).toBe('standard');
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black'),
    ).toBeDefined();
  });
});
