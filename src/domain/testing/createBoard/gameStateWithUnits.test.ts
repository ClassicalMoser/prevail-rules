import { findPlayerUnitWithPosition } from '@queries';
import { placed } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';
import { createGameStateWithUnits } from './gameStateWithUnits';

describe('createGameStateWithUnits function', () => {
  it('given context, returns game state with multiple units', () => {
    const unit1 = createTestUnit('black');
    const unit2 = createTestUnit('white');
    const state = createGameStateWithUnits([
      placed(unit1, 'E-5', 'north'),
      placed(unit2, 'E-6', 'south'),
    ]);
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-5', 'black'),
    ).toBeDefined();
    expect(
      findPlayerUnitWithPosition(state.boardState, 'E-6', 'white'),
    ).toBeDefined();
  });
});
