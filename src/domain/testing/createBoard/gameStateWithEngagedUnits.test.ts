import { createTestUnit } from '@testing/unitHelpers';
import { createGameStateWithEngagedUnits } from './gameStateWithEngagedUnits';

describe('createGameStateWithEngagedUnits function', () => {
  it('given context, returns game state with engaged units', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');
    const state = createGameStateWithEngagedUnits(primary, secondary);
    expect(state.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'engaged',
    );
  });
});
