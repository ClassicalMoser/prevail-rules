import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { createMoveContext } from './createMoveContext';
import { getStartState } from './getStartState';

/**
 * A move begins where the unit stands, its whole budget unspent (§5.1.4).
 */
describe('getStartState function', () => {
  it('the move begins in place, nothing spent and nothing on its path', () => {
    // A unit with Speed 3 and Flexibility 5 (a catalog pair) on E-5.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 5,
        player: 'black',
        speed: 3,
      },
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    const context = createMoveContext(gameState, unit, 'advance');

    expect(getStartState(context)).toStrictEqual({
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      path: [],
      remainingFlexibility: 5,
      remainingSpeed: 3,
    });
  });
});
