import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
  replaceBoard,
} from '@testing';
import { createEmptyGameState } from '@factories';
import { addUnitToBoard } from '@transforms';

import { getPlayerUnitsOnBoard } from './getPlayerUnitsOnBoard';

/**
 * The units a side has on the board, engaged or not: the units the support
 * check must find a place for after a rally (§10.4.4), and the ones whose
 * loss ends the game (§11.4).
 */
describe('getPlayerUnitsOnBoard function', () => {
  it("gives one side's units and none of the other's", () => {
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

    // White's two, and not Black's.
    expect(getPlayerUnitsOnBoard(state, 'white')).toStrictEqual(
      new Set([white1, white2]),
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

    expect(getPlayerUnitsOnBoard(state, 'black').size).toBe(0);
  });

  it('counts a unit locked in an engagement, on either side of it', () => {
    // Black has walked into White on E-5; another black unit stands alone
    // beside the fight on F-5.
    const blackEngaged = createTestUnit('black', {
      attack: 3,
      instanceNumber: 1,
    });
    const whiteEngaged = createTestUnit('white', { attack: 3 });
    const blackAlone = createTestUnit('black', {
      attack: 3,
      instanceNumber: 2,
    });
    const engaged = createBoardWithEngagedUnits(
      blackEngaged,
      whiteEngaged,
      'E-5',
      'north',
    );
    const board = addUnitToBoard(engaged, placed(blackAlone, 'F-5', 'south'));
    const state = replaceBoard(createEmptyGameState('standard'), board);

    // Black's engaged unit and its lone one …
    expect(getPlayerUnitsOnBoard(state, 'black')).toStrictEqual(
      new Set([blackEngaged, blackAlone]),
    );
    // … and White's engaged unit, though it is not the one that moved in.
    expect(getPlayerUnitsOnBoard(state, 'white')).toStrictEqual(
      new Set([whiteEngaged]),
    );
  });
});
