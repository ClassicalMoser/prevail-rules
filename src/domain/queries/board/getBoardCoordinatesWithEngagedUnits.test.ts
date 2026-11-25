import { createEmptyGameState } from '@factories';
import {
  createGameStateWithEngagedUnits,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard } from '@transforms';

import { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';

/**
 * Every space where two enemy units stand engaged. Each of these fights in
 * Phase 4 (§4.4.1); a lone unit is not a fight.
 */
describe('getBoardCoordinatesWithEngagedUnits function', () => {
  it('is no space on a board with no engagement', () => {
    // A new standard game, nobody on the board.
    const state = createEmptyGameState('standard');

    const engagements = getBoardCoordinatesWithEngagedUnits(state.boardState);

    // There is nothing to fight.
    expect(engagements).toStrictEqual(new Set());
  });

  it('is the engaged space alone, leaving out units standing on their own', () => {
    // A black and a white unit engaged on E-5.
    const engaged = createGameStateWithEngagedUnits(
      createTestUnit('black'),
      createTestUnit('white'),
      'E-5',
    );
    // A black unit alone on E-6, beside the fight, and a white one alone on
    // E-8.
    const withBlack = addUnitToBoard(
      engaged.boardState,
      placed(createTestUnit('black', { instanceNumber: 2 }), 'E-6', 'north'),
    );
    const board = addUnitToBoard(
      withBlack,
      placed(createTestUnit('white', { instanceNumber: 2 }), 'E-8', 'north'),
    );

    const engagements = getBoardCoordinatesWithEngagedUnits(board);

    // Only E-5 holds a fight.
    expect(engagements).toStrictEqual(new Set(['E-5']));
  });
});
