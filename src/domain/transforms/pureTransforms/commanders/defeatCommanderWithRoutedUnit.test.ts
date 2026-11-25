import { createGameStateWithUnits, createUnitWithPlacement } from '@testing';

import { defeatCommanderWithRoutedUnit } from './defeatCommanderWithRoutedUnit';
import { deployCommander } from './deployCommander';

/**
 * A commander standing where one of its own units routs in combat is
 * defeated with it; an enemy commander in the same space is not (§4.2.8).
 */
describe('defeatCommanderWithRoutedUnit function', () => {
  // A white unit routing on E-5, still on the board as it routs.
  const routing = createUnitWithPlacement({
    coordinate: 'E-5',
    playerSide: 'white',
  });
  const base = createGameStateWithUnits([routing]);

  it('fells the routing unit’s own commander standing with it', () => {
    // White's commander stands on E-5 with the unit.
    const state = deployCommander(base, 'white', 'E-5');

    const after = defeatCommanderWithRoutedUnit(state, routing);

    // It is off the board and recorded as lost.
    expect(after.boardState.board['E-5']?.commanders).toStrictEqual([]);
    expect(after.lostCommanders).toStrictEqual(['white']);
  });

  it('leaves an enemy commander sharing the space where it is', () => {
    // Black's commander rode into E-5 with its own unit (§4.3.10, A4); white's
    // is there too.
    // TODO(misleading): the rulebook appendix has no entry A4 any more; the
    // ride into an engagement is §4.3.10 alone. Settle by dropping "A4".
    const withWhite = deployCommander(base, 'white', 'E-5');
    const state = deployCommander(withWhite, 'black', 'E-5');

    const after = defeatCommanderWithRoutedUnit(state, routing);

    // Only white's commander falls; black's is with its own unit.
    expect(after.boardState.board['E-5']?.commanders).toStrictEqual(['black']);
    expect(after.lostCommanders).toStrictEqual(['white']);
  });

  it('changes nothing when the routing unit’s commander is elsewhere', () => {
    // White's commander stands on A-1, far from the rout.
    const state = deployCommander(base, 'white', 'A-1');

    // The very same state comes back: the commander is not touched.
    expect(defeatCommanderWithRoutedUnit(state, routing)).toBe(state);
  });
});
