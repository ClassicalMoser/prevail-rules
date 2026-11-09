import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { createMoveContext } from './moveContext';

/**
 * A move's budget and start are settled once, where it begins (§5.1.4).
 */
describe('createMoveContext function', () => {
  it("the budget is the unit's current Speed and Flexibility", () => {
    // A black unit with Speed 3 and Flexibility 5 (a catalog pair).
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

    expect(context.totalSpeed).toBe(3);
    expect(context.totalFlexibility).toBe(5);
  });

  it("the start is the unit's placement", () => {
    // A black unit on E-5 facing northEast.
    const gameState = createGameState([['E-5', 'black', 'northEast']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    const context = createMoveContext(gameState, unit, 'retreat');

    expect(context.start).toStrictEqual({
      coordinate: 'E-5',
      facing: 'northEast',
    });
  });

  it('a move that is neither an advance nor a retreat is refused', () => {
    // A black unit on E-5 facing north.
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    // The type forbids this value; a caller outside the type system (a wire
    // payload) could still send it, and the context must refuse it.
    const sideways = 'sideways' as 'advance';

    expect(() => createMoveContext(gameState, unit, sideways)).toThrow(
      'Invalid direction',
    );
  });
});
