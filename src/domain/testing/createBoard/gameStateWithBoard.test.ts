import { findUnitWithPlacementOnBoard } from '@queries';
import { createBoardWithUnits } from './boardWithUnits';
import { placed } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import { createGameStateWithBoard } from './gameStateWithBoard';

/** A board a spec built, put into a new standard game that can find what stands on it. */
describe('createGameStateWithBoard function', () => {
  it('files each unit on the board so the game finds it there', () => {
    // Black's unit on D-4, facing west.
    const unit = createTestUnit('black');
    const board = createBoardWithUnits([placed(unit, 'D-4', 'west')]);

    const state = createGameStateWithBoard(board);

    expect(state.boardState).toBe(board);
    expect(findUnitWithPlacementOnBoard(state, unit)?.placement).toStrictEqual({
      coordinate: 'D-4',
      facing: 'west',
    });
  });
});
