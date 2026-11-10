import { createEmptyGameState } from '@factories';
import { createUnitWithPlacement } from '@testing';

import { updateBoardState } from '../board/updateBoardState';
import { addCommanderToBoard } from './addCommanderToBoard';
import { defeatCommanderWithRoutedUnit } from './defeatCommanderWithRoutedUnit';

/**
 * A commander standing where one of its own units routs in combat is
 * defeated with it; an enemy commander in the same space is not (§4.2.8).
 */
describe('defeatCommanderWithRoutedUnit function', () => {
  // A white unit routing on E-5.
  const routing = createUnitWithPlacement({
    coordinate: 'E-5',
    playerSide: 'white',
  });

  it('fells the routing unit’s own commander standing with it', () => {
    // White's commander stands on E-5 with the unit.
    const base = createEmptyGameState('standard');
    const state = updateBoardState(
      base,
      addCommanderToBoard(base.boardState, 'white', 'E-5'),
    );

    const after = defeatCommanderWithRoutedUnit(state, routing);

    // It is off the board and recorded as lost.
    expect(after.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(after.lostCommanders).toStrictEqual(['white']);
  });

  it('leaves an enemy commander sharing the space where it is', () => {
    // Black's commander rode into E-5 with its own unit (§4.3.10, A4); white's
    // is there too.
    const base = createEmptyGameState('standard');
    const withWhite = addCommanderToBoard(base.boardState, 'white', 'E-5');
    const state = updateBoardState(
      base,
      addCommanderToBoard(withWhite, 'black', 'E-5'),
    );

    const after = defeatCommanderWithRoutedUnit(state, routing);

    // Only white's commander falls; black's is with its own unit.
    expect(after.boardState.board['E-5']?.commanders).toStrictEqual(['black']);
    expect(after.lostCommanders).toStrictEqual(['white']);
  });

  it('changes nothing when the routing unit’s commander is elsewhere', () => {
    // White's commander stands on A-1, far from the rout.
    const base = createEmptyGameState('standard');
    const state = updateBoardState(
      base,
      addCommanderToBoard(base.boardState, 'white', 'A-1'),
    );

    expect(defeatCommanderWithRoutedUnit(state, routing)).toBe(state);
  });
});
