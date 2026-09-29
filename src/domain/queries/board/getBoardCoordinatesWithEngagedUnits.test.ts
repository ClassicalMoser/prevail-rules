import { createGameStateWithEngagedUnits, createTestUnit } from '@testing';

import { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';
import { addUnitToBoard } from '@transforms';

import { createEmptyGameState } from '@factories';
/**
 * GetBoardCoordinatesWithEngagedUnits: set of coordinates where the space has an engagement (two units).
 */
describe(getBoardCoordinatesWithEngagedUnits, () => {
  it('the board has no engagements', () => {
    const state = createEmptyGameState('standard');
    expect(getBoardCoordinatesWithEngagedUnits(state.boardState).size).toBe(0);
  });

  it('the one engaged space is included', () => {
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(black, white, 'E-5');

    const coords = getBoardCoordinatesWithEngagedUnits(state.boardState);

    expect(coords.size).toBe(1);
    expect(coords.has('E-5')).toBe(true);
  });

  it('unengaged units are excluded', () => {
    const engagedBlack = createTestUnit('black', { attack: 3 });
    const engagedWhite = createTestUnit('white', { attack: 3 });
    const unengagedBlack = createTestUnit('black', { attack: 3 });
    const unengagedWhite = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(
      engagedBlack,
      engagedWhite,
      'E-5',
    );

    // Add unengaged units to the board
    const boardWithUnengagedBlack = addUnitToBoard(state.boardState, {
      placement: { coordinate: 'E-6', facing: 'north' },
      unit: unengagedBlack,
    });
    const boardWithUnengagedWhite = addUnitToBoard(boardWithUnengagedBlack, {
      placement: { coordinate: 'E-8', facing: 'north' },
      unit: unengagedWhite,
    });

    // Get the coordinates with engaged units
    const coords = getBoardCoordinatesWithEngagedUnits(boardWithUnengagedWhite);

    expect(coords.size).toBe(1);
    expect(coords.has('E-5')).toBe(true);
  });
});
