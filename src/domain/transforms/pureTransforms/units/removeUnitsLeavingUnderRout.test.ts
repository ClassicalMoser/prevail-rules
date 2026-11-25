import { createUnitIndexKey } from '@factories';
import {
  createBoardWithCommander,
  createBoardWithUnits,
  createGameStateWithBoard,
  createGameStateWithUnits,
  createTestUnit,
  placed,
} from '@testing';

import { removeUnitsLeavingUnderRout } from './removeUnitsLeavingUnderRout';

/**
 * A unit routed in combat leaves the board as its rout opens, and its own
 * commander standing with it falls with it (§4.2.8, §9.3.5).
 */
describe('removeUnitsLeavingUnderRout function', () => {
  // Two of White's units.
  const routing = createTestUnit('white', { attack: 3 });
  const other = createTestUnit('white', { attack: 3, instanceNumber: 2 });

  it('takes the unit off the board and among the routed, and its own commander standing with it falls', () => {
    // White's unit on E-5, with White's commander in the same space.
    const board = createBoardWithCommander(
      'white',
      'E-5',
      createBoardWithUnits([placed(routing, 'E-5', 'north')]),
    );
    const state = createGameStateWithBoard(board);

    const after = removeUnitsLeavingUnderRout(state, [routing]);

    // E-5 is empty of both the unit and the commander.
    expect(after.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(after.boardState.board['E-5']?.commanders).toStrictEqual([]);
    // The unit is routed, and White's commander is lost.
    expect(after.routedUnits).toStrictEqual([routing]);
    expect(after.lostCommanders).toStrictEqual(['white']);
  });

  it('routs every unit it is given, each from the space it stands in', () => {
    // White's two units on E-5 and E-6; no commander near either.
    const state = createGameStateWithUnits([
      placed(routing, 'E-5', 'north'),
      placed(other, 'E-6', 'north'),
    ]);

    const after = removeUnitsLeavingUnderRout(state, [routing, other]);

    // Both spaces are empty, both units routed and filed as routed.
    expect(after.boardState.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(after.boardState.board['E-6']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(after.routedUnits).toStrictEqual([routing, other]);
    expect(after.index.units[createUnitIndexKey(other)]).toBe('routed');
  });

  it('throws for a unit that is not on the board', () => {
    // White's unit has already routed, and is named to rout again.
    const state = createGameStateWithUnits([placed(routing, 'E-5', 'north')]);
    const routedOnce = removeUnitsLeavingUnderRout(state, [routing]);

    // A unit that stands nowhere has no space to rout from.
    expect(() => removeUnitsLeavingUnderRout(routedOnce, [routing])).toThrow(
      'Unit not found on board',
    );
  });
});
