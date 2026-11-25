import { createEmptyGameState } from '@factories';
import { createTestUnit } from '@testing';
import { addUnitsToCommandedUnits } from '@transforms';

import { getCommandedUnitsForPlayer } from './getCommandedUnitsForPlayer';

/** A unit is ordered at most once a round (§4.3.6); each player has their own. */
describe('getCommandedUnitsForPlayer function', () => {
  it('reads only the units one player has ordered, in the order they were ordered', () => {
    // Black ordered one unit, then white one, then black another; the two
    // black units are of different types, so they are told apart.
    const blackFirst = createTestUnit('black', {
      attack: 3,
      instanceNumber: 1,
    });
    const white = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const blackSecond = createTestUnit('black', {
      attack: 2,
      instanceNumber: 1,
    });
    const state = addUnitsToCommandedUnits(createEmptyGameState('standard'), [
      blackFirst,
      white,
      blackSecond,
    ]);

    // Black's two, in the order they were ordered, without white's.
    expect(getCommandedUnitsForPlayer(state, 'black')).toStrictEqual([
      blackFirst,
      blackSecond,
    ]);

    // White's one, without black's.
    expect(getCommandedUnitsForPlayer(state, 'white')).toStrictEqual([white]);
  });
});
