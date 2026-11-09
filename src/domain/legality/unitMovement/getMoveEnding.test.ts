import { throwIfUndefined } from '@utils';
import { getPlayerUnitWithPosition } from '@queries';
import { createGameState } from '@testing';

import type { MoveState } from './moveState';
import { createMoveContext } from './moveContext';
import { getMoveEnding } from './getMoveEnding';

/**
 * A move may stop where the ground allows (§5.3); an engagement from the
 * front ends squared up head-on at the cost of a Flexibility (§6.2.3); a
 * retreat must end behind its starting rank (§9.1.2).
 */
describe('getMoveEnding function', () => {
  it('an advance may end by standing in place, at no cost', () => {
    // A lone black unit on E-5 facing north, with Speed 2 and Flexibility 2
    // (a catalog pair; only the totals the state spends from matter here).
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-5', 'black'),
      'Unit not found',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Nothing spent yet, still on the start space.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      remainingFlexibility: 2,
      remainingSpeed: 2,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toStrictEqual({
      flexibilityUsed: 0,
      placement: { coordinate: 'E-5', facing: 'north' },
      speedUsed: 0,
    });
  });

  it('a retreat may not end on its starting space', () => {
    // A lone black unit on E-5 facing north.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-5', 'black'),
      'Unit not found',
    );
    // Build the context of a retreat begun on E-5.
    const context = createMoveContext(gameState, unit, 'retreat');
    // Nothing spent yet, still on the start space.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'E-5',
      facing: 'north',
      remainingFlexibility: 2,
      remainingSpeed: 2,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toBeUndefined();
  });

  it('an advance that has stepped away and back may not end on its starting space', () => {
    // A lone black unit on E-5 facing north.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-5', 'black'),
      'Unit not found',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // Back on E-5: a step out to D-5, an about-face for one Flexibility,
    // and a step home.
    const state: MoveState = {
      cameFrom: 'D-5',
      coordinate: 'E-5',
      facing: 'south',
      remainingFlexibility: 1,
      remainingSpeed: 0,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toBeUndefined();
  });

  it('open ground ahead is a legal ending, reporting what it cost', () => {
    // A lone black unit on E-5 facing north, with Speed 2 and Flexibility 2.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-5', 'black'),
      'Unit not found',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // A 45° turn to northEast, then a diagonal step onto empty D-6.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'D-6',
      facing: 'northEast',
      remainingFlexibility: 1,
      remainingSpeed: 1,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toStrictEqual({
      flexibilityUsed: 1,
      placement: { coordinate: 'D-6', facing: 'northEast' },
      speedUsed: 1,
    });
  });

  it("a friend's space is not a legal ending", () => {
    // A black unit on E-5 with a black friend on D-5.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
      ['D-5', 'black', 'north'],
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-5', 'black'),
      'Unit not found',
    );
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');
    // One step taken onto the friend's space.
    const state: MoveState = {
      cameFrom: 'E-5',
      coordinate: 'D-5',
      facing: 'north',
      remainingFlexibility: 2,
      remainingSpeed: 1,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toBeUndefined();
  });

  it('a frontal engagement approached obliquely ends squared head-on and spends one Flexibility', () => {
    // A black attacker on E-4 and a white defender on D-5 facing south, so
    // E-4 is one of the defender's front spaces.
    const gameState = createGameState([
      {
        coord: 'E-4',
        facing: 'northEast',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
      ['D-5', 'white', 'south'],
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-4', 'black'),
      'Unit not found',
    );
    // Build the context of an advance begun on E-4.
    const context = createMoveContext(gameState, unit, 'advance');
    // One diagonal step taken from E-4 onto the defender's space.
    const state: MoveState = {
      cameFrom: 'E-4',
      coordinate: 'D-5',
      facing: 'northEast',
      remainingFlexibility: 2,
      remainingSpeed: 1,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toStrictEqual({
      flexibilityUsed: 1,
      placement: { coordinate: 'D-5', facing: 'north' },
      speedUsed: 1,
    });
  });

  it('a frontal engagement approached obliquely may not end there with no Flexibility left', () => {
    // A black attacker on E-4 and a white defender on D-5 facing south.
    const gameState = createGameState([
      {
        coord: 'E-4',
        facing: 'northEast',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
      ['D-5', 'white', 'south'],
    ]);
    const unit = throwIfUndefined(
      getPlayerUnitWithPosition(gameState.boardState, 'E-4', 'black'),
      'Unit not found',
    );
    // Build the context of an advance begun on E-4.
    const context = createMoveContext(gameState, unit, 'advance');
    // The same diagonal step, with no Flexibility left to square up.
    const state: MoveState = {
      cameFrom: 'E-4',
      coordinate: 'D-5',
      facing: 'northEast',
      remainingFlexibility: 0,
      remainingSpeed: 1,
    };

    const ending = getMoveEnding(context, state);

    expect(ending).toBeUndefined();
  });
});
