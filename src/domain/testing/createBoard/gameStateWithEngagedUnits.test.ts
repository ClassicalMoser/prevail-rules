import { createTestUnit } from '@testing/unitHelpers';

import { createGameStateWithEngagedUnits } from './gameStateWithEngagedUnits';

/** A new standard game with two enemy units engaged in one space. */
describe('createGameStateWithEngagedUnits function', () => {
  it('locks the two units in the space it names', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');

    const state = createGameStateWithEngagedUnits(primary, secondary, 'D-4');

    expect(state.boardState.board['D-4']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: primary,
      secondaryUnit: secondary,
    });
  });
});
