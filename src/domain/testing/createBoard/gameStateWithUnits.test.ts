import { findUnitWithPlacementOnBoard } from '@queries';
import { placed } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import { createGameStateWithUnits } from './gameStateWithUnits';

/** A new standard game whose board holds the units given, and whose index finds them. */
describe('createGameStateWithUnits function', () => {
  it('lets the game find each unit where the spec put it', () => {
    const black = createTestUnit('black');
    const white = createTestUnit('white');

    const state = createGameStateWithUnits([
      placed(black, 'E-5', 'north'),
      placed(white, 'E-6', 'south'),
    ]);

    expect(findUnitWithPlacementOnBoard(state, black)?.placement).toStrictEqual(
      {
        coordinate: 'E-5',
        facing: 'north',
      },
    );
    expect(findUnitWithPlacementOnBoard(state, white)?.placement).toStrictEqual(
      {
        coordinate: 'E-6',
        facing: 'south',
      },
    );
  });
});
