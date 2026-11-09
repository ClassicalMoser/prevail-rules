import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import type { MoveState } from './moveState';
import { createMoveContext } from './createMoveContext';
import { getTurnOptions } from './getTurnOptions';

/**
 * A turn costs 1 Flexibility and goes 45° either way or about (§5.2.1); a
 * retreat's opening turn is limited to 45° in all (§9.1.4).
 */
describe('getTurnOptions function', () => {
  // A lone black unit on E-5 facing north. Its own Speed and Flexibility are
  // irrelevant here: each case sets the Flexibility left in the state.
  const gameState = createGameState([['E-5', 'black', 'north']]);
  const unit = getSingleUnitWithPlacementAtCoordinate(
    gameState.boardState,
    'E-5',
  );

  it('an advancing unit with Flexibility left may turn 45° either way or about', () => {
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Stand on the start space, facing north, with Flexibility to spare.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      path: [],
      remainingFlexibility: 2,
      remainingSpeed: 2,
    };

    const options = getTurnOptions(context, state);

    expect(options).toStrictEqual(
      new Set(['turnLeft', 'turnRight', 'turnAbout']),
    );
  });

  it('a unit with no Flexibility left cannot turn', () => {
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Facing north again after turning left and back right, both points
    // spent.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      path: ['turnLeft', 'turnRight'],
      remainingFlexibility: 0,
      remainingSpeed: 2,
    };

    const options = getTurnOptions(context, state);

    expect(options).toStrictEqual(new Set());
  });

  it('a retreat opens by turning only 45° either way, never about', () => {
    // Build the context of a retreat begun on E-5 facing north.
    const context = createMoveContext(gameState, unit, 'retreat');
    // Still on the start space, facing as it started.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      path: [],
      remainingFlexibility: 2,
      remainingSpeed: 2,
    };

    const options = getTurnOptions(context, state);

    expect(options).toStrictEqual(new Set(['turnLeft', 'turnRight']));
  });

  it('a retreat that has made its opening turn may turn no further before stepping back', () => {
    // Build the context of a retreat begun on E-5 facing north.
    const context = createMoveContext(gameState, unit, 'retreat');
    // Still on the start space, already turned 45° from the starting facing.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'northEast',
      path: ['turnRight'],
      remainingFlexibility: 1,
      remainingSpeed: 2,
    };

    const options = getTurnOptions(context, state);

    expect(options).toStrictEqual(new Set());
  });

  it('a retreat that has stepped back turns 45° either way or about', () => {
    // Build the context of a retreat begun on E-5 facing north.
    const context = createMoveContext(gameState, unit, 'retreat');
    // One step back, now on F-5, facing as it started.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'F-5',
      facing: 'north',
      path: ['step'],
      remainingFlexibility: 2,
      remainingSpeed: 1,
    };

    const options = getTurnOptions(context, state);

    expect(options).toStrictEqual(
      new Set(['turnLeft', 'turnRight', 'turnAbout']),
    );
  });
});
