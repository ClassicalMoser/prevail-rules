import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import type { MoveState } from './moveState';
import { createMoveContext } from './createMoveContext';
import { getStepOption } from './getStepOption';

/**
 * A step costs 1 Speed and goes straight ahead, or straight back for a
 * retreat (§5.1.2–§5.1.3); an enemy's space may be stepped into but not
 * through (§5.4.3).
 */
describe('getStepOption function', () => {
  it('an advance steps into the space it faces', () => {
    // A lone black unit on E-5 facing north.
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Stand on the start space with 2 Speed and 1 Flexibility left.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      remainingFlexibility: 1,
      remainingSpeed: 2,
    };

    const option = getStepOption(context, state);

    expect(option).toStrictEqual({
      mayContinue: true,
      next: {
        cameFrom: 'E-5',
        coordinate: 'D-5',
        facing: 'north',
        remainingFlexibility: 1,
        remainingSpeed: 1,
      },
    });
  });

  it('a retreat steps into the space behind it', () => {
    // A lone black unit on E-5 facing north.
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    // Build the context of a retreat begun on E-5.
    const context = createMoveContext(gameState, unit, 'retreat');
    // Stand on the start space, still facing north.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      remainingFlexibility: 1,
      remainingSpeed: 2,
    };

    const option = getStepOption(context, state);

    expect(option).toStrictEqual({
      mayContinue: true,
      next: {
        cameFrom: 'E-5',
        coordinate: 'F-5',
        facing: 'north',
        remainingFlexibility: 1,
        remainingSpeed: 1,
      },
    });
  });

  it('a unit with no Speed left cannot step', () => {
    // A lone black unit on E-5 facing north.
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Stand on the start space with the Speed spent.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      remainingFlexibility: 1,
      remainingSpeed: 0,
    };

    const option = getStepOption(context, state);

    expect(option).toBeUndefined();
  });

  it('a unit at the edge of the board cannot step off it', () => {
    // A lone black unit on the northern edge, facing north.
    const gameState = createGameState([['A-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'A-5',
    );
    // Build the context of an advance begun on A-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Stand on the start space with Speed to spare.
    const state: MoveState = {
      cameFrom: 'A-5',
      coordinate: 'A-5',
      facing: 'north',
      remainingFlexibility: 1,
      remainingSpeed: 2,
    };

    const option = getStepOption(context, state);

    expect(option).toBeUndefined();
  });

  it('a step into an enemy space is offered but the move may not go on from it', () => {
    // A black unit on E-5 facing a white unit on D-5. The white unit's
    // facing does not matter: an enemy is never passed through.
    const gameState = createGameState([
      ['E-5', 'black', 'north'],
      ['D-5', 'white', 'south'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Stand on the start space with Speed to spare.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      remainingFlexibility: 1,
      remainingSpeed: 2,
    };

    const option = getStepOption(context, state);

    expect(option).toStrictEqual({
      mayContinue: false,
      next: {
        cameFrom: 'E-5',
        coordinate: 'D-5',
        facing: 'north',
        remainingFlexibility: 1,
        remainingSpeed: 1,
      },
    });
  });

  it('a diagonal step between two enemies on its corner spaces is refused', () => {
    // A black unit on E-5 facing northEast, with white units on D-5 and
    // E-6: the two corner spaces flanking the diagonal step to D-6.
    const gameState = createGameState([
      ['E-5', 'black', 'northEast'],
      ['D-5', 'white', 'south'],
      ['E-6', 'white', 'north'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Stand on the start space, facing the diagonal.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'northEast',
      remainingFlexibility: 1,
      remainingSpeed: 2,
    };

    const option = getStepOption(context, state);

    expect(option).toBeUndefined();
  });
});
