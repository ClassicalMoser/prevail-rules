import {
  createBoardWithUnits,
  createTestUnit,
  placed,
  replaceBoard,
} from '@testing';
import { createEmptyGameState } from '@factories';

import { getPlayerUnitsWithPlacementOnBoard } from './getPlayerUnitsWithPlacementOnBoard';

/**
 * A side's units on the board with where each stands and which way it
 * faces, for a caller that must place or order them: who an order may name,
 * and which units routed at the support check stood where.
 */
describe('getPlayerUnitsWithPlacementOnBoard function', () => {
  it("gives each of one side's units with its space and facing, and none of the other's", () => {
    // Two white units and a black one, each alone in its space.
    const white1 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const white2 = createTestUnit('white', { attack: 3, instanceNumber: 2 });
    const black = createTestUnit('black', { attack: 3 });
    const state = replaceBoard(
      createEmptyGameState('standard'),
      createBoardWithUnits([
        placed(white1, 'E-5', 'north'),
        placed(white2, 'F-5', 'south'),
        placed(black, 'G-5', 'east'),
      ]),
    );

    // White's two, each where it was placed and facing the way it was set.
    expect(getPlayerUnitsWithPlacementOnBoard(state, 'white')).toStrictEqual(
      new Set([
        { placement: { coordinate: 'E-5', facing: 'north' }, unit: white1 },
        { placement: { coordinate: 'F-5', facing: 'south' }, unit: white2 },
      ]),
    );
  });

  it('gives an empty set for a side with no unit on the board', () => {
    // Only White has a unit standing.
    const state = replaceBoard(
      createEmptyGameState('standard'),
      createBoardWithUnits([
        placed(createTestUnit('white', { attack: 3 }), 'E-5', 'north'),
      ]),
    );

    expect(getPlayerUnitsWithPlacementOnBoard(state, 'black').size).toBe(0);
  });
});
