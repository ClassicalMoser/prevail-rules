import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import type { MoveState } from './moveState';
import { createMoveContext } from './createMoveContext';
import { findEndingFrom } from './findEndingFrom';

/**
 * A point in a move is worth leading a player to only if the move can still
 * be finished from it.
 */
describe('findEndingFrom function', () => {
  // A black unit on E-5 facing north with two points of Speed, and friendly
  // units on D-5 and C-5 it may pass through but not stop on.
  const gameState = createGameState([
    {
      coord: 'E-5',
      facing: 'north',
      flexibility: 4,
      player: 'black',
      speed: 2,
    },
    {
      coord: 'D-5',
      facing: 'north',
      flexibility: 4,
      player: 'black',
      speed: 2,
    },
    {
      coord: 'C-5',
      facing: 'north',
      flexibility: 4,
      player: 'black',
      speed: 2,
    },
  ]);
  const unit = getSingleUnitWithPlacementAtCoordinate(
    gameState.boardState,
    'E-5',
  );
  const context = createMoveContext(gameState, unit, 'advance');

  it('finds an ending from the space just passed through, by turning aside', () => {
    // On D-5 with one Speed and all its Flexibility left, the unit can turn
    // and step to an empty space.
    const onFriend: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'D-5',
      facing: 'north',
      path: ['step'],
      remainingFlexibility: 4,
      remainingSpeed: 1,
    };
    expect(findEndingFrom(context, onFriend)).toBeDefined();
  });

  it('finds none from the second friend’s space with the Speed spent', () => {
    // On C-5 with no Speed left it cannot stop on a friend, and it cannot
    // move on.
    const stranded: MoveState = {
      cameFrom: 'D-5',
      coordinate: 'C-5',
      facing: 'north',
      path: ['step', 'step'],
      remainingFlexibility: 4,
      remainingSpeed: 0,
    };
    expect(findEndingFrom(context, stranded)).toBeUndefined();
  });
});
