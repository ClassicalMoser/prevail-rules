import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';

import { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';
import { addUnitToBoard } from '@transforms';

/**
 * GetBoardCoordinatesWithEngagedUnits: set of coordinates where the space has an engagement (two units).
 */
describe(getBoardCoordinatesWithEngagedUnits, () => {
  it('returns an empty set when the board has no engagements', () => {
    const state = createEmptyGameState();
    expect(getBoardCoordinatesWithEngagedUnits(state.boardState).size).toBe(0);
  });

  it('includes the coordinate of the one engaged space', () => {
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(black, white, 'E-5');

    const coords = getBoardCoordinatesWithEngagedUnits(state.boardState);

    expect(coords.size).toBe(1);
    expect(coords.has('E-5')).toBe(true);
  });

  it('excludes the coordinates of units that are not engaged', () => {
    const engagedBlack = createTestUnit('black', { attack: 3 });
    const engagedWhite = createTestUnit('white', { attack: 3 });
    const unengagedBlack = createTestUnit('black', { attack: 3 });
    const unengagedWhite = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(
      engagedBlack,
      engagedWhite,
      'E-5',
    );
    const boardWithUnengagedBlack = addUnitToBoard(state.boardState, {
      placement: { coordinate: 'E-6', facing: 'north' },
      unit: unengagedBlack,
    });
    const boardWithUnengagedWhite = addUnitToBoard(boardWithUnengagedBlack, {
      placement: { coordinate: 'E-8', facing: 'north' },
      unit: unengagedWhite,
    });

    const newState = {
      ...state,
      boardState: boardWithUnengagedWhite,
    };
    const coords = getBoardCoordinatesWithEngagedUnits(newState.boardState);

    expect(coords.size).toBe(1);
    expect(coords.has('E-5')).toBe(true);
  });
});
