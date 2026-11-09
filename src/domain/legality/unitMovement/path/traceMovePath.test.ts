import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { getLegalUnitMoves } from '../getLegalUnitMoves';
import { traceMovePath } from './traceMovePath';

/**
 * A submitted path is legal exactly when the move rules allow each of its
 * steps and turns, and its ending (§5–§6, A11).
 */
describe('traceMovePath function', () => {
  it('an empty path stands the unit in place', () => {
    // A lone black unit on E-5 facing north.
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    const trace = traceMovePath(gameState, unit, [], 'advance');

    expect(trace).toStrictEqual({
      ending: {
        flexibilityUsed: 0,
        path: [],
        placement: { coordinate: 'E-5', facing: 'north' },
        speedUsed: 0,
      },
      result: true,
    });
  });

  it('a turn and a step reach the space diagonally ahead', () => {
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    // A 45° turn to the right, then a step on the diagonal.
    const trace = traceMovePath(
      gameState,
      unit,
      ['turnRight', 'step'],
      'advance',
    );

    expect(trace.result && trace.ending.placement).toStrictEqual({
      coordinate: 'D-6',
      facing: 'northEast',
    });
  });

  it('a retreat may not open with an about-turn', () => {
    // §9.1.4: a retreat never begins by facing the other way.
    const gameState = createGameState([['E-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    const trace = traceMovePath(
      gameState,
      unit,
      ['turnAbout', 'step'],
      'retreat',
    );

    expect(trace).toStrictEqual({
      errorReason: 'Move 1 (turnAbout) is not a turn the unit may make there',
      result: false,
    });
  });

  it('a step off the board is refused', () => {
    // A unit on the northern edge, facing off it.
    const gameState = createGameState([['A-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'A-5',
    );

    const trace = traceMovePath(gameState, unit, ['step'], 'advance');

    expect(trace).toStrictEqual({
      errorReason: 'Move 1 (step) is not a step the unit may take there',
      result: false,
    });
  });

  describe('closing on an enemy from the front', () => {
    // A black attacker on E-4 facing northEast; a white defender on D-5
    // facing south, so E-4 is one of its corner front spaces.
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
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-4',
    );

    it('the path must record the squaring turn', () => {
      // §6.2.3: the step arrives 45° off head-on; a turn left squares it.
      const trace = traceMovePath(
        gameState,
        unit,
        ['step', 'turnLeft'],
        'advance',
      );

      expect(trace).toStrictEqual({
        ending: {
          flexibilityUsed: 1,
          path: ['step', 'turnLeft'],
          placement: { coordinate: 'D-5', facing: 'north' },
          speedUsed: 1,
        },
        result: true,
      });
    });

    it('a path that leaves the squaring turn out is refused', () => {
      const trace = traceMovePath(gameState, unit, ['step'], 'advance');

      expect(trace).toStrictEqual({
        errorReason: 'Closing on D-5 from the front must end with turnLeft',
        result: false,
      });
    });

    it('a path that goes on past the engagement is refused', () => {
      // Squaring up and then trying to step on through the enemy.
      const trace = traceMovePath(
        gameState,
        unit,
        ['step', 'turnLeft', 'step'],
        'advance',
      );

      expect(trace.result).toBe(false);
    });
  });

  it('every path the move search offers is one the trace accepts', () => {
    // A unit with room to manoeuvre, beside a friend and facing an enemy:
    // open ground, passing through, and an engagement are all on offer.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
      ['E-6', 'black', 'north'],
      ['C-5', 'white', 'south'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    // Each ending the search finds must trace back to that same ending.
    const moves = [...getLegalUnitMoves(unit, gameState)];
    const traced = moves.map((move) =>
      traceMovePath(gameState, unit, move.path, 'advance'),
    );

    expect(moves.length).toBeGreaterThan(10);
    expect(traced).toStrictEqual(
      moves.map((move) => ({ ending: move, result: true })),
    );
  });
});
