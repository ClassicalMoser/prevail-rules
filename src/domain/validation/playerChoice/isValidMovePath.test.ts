import { getLegalUnitMoves } from '@legality';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { isValidMovePath } from './isValidMovePath';

/**
 * A submitted path is valid when each of its moves is one the rules offer
 * at that point, and the move may stop where it ends (A11).
 */
describe('isValidMovePath function', () => {
  // A lone black unit on E-5 facing north, for the open-ground cases.
  const openGround = createGameState([['E-5', 'black', 'north']]);
  const loneUnit = getSingleUnitWithPlacementAtCoordinate(
    openGround.boardState,
    'E-5',
  );

  it('an empty path stands the unit in place', () => {
    expect(isValidMovePath(openGround, loneUnit, [], 'advance')).toStrictEqual({
      result: true,
    });
  });

  it('a turn and a step onto open ground is a move', () => {
    expect(
      isValidMovePath(openGround, loneUnit, ['turnRight', 'step'], 'advance'),
    ).toStrictEqual({ result: true });
  });

  it('a retreat may not open with an about-turn', () => {
    // §9.1.4: a retreat never begins by facing the other way.
    expect(
      isValidMovePath(openGround, loneUnit, ['turnAbout', 'step'], 'retreat'),
    ).toStrictEqual({
      errorReason: 'Move 1 (turnAbout) is not one the unit may make there',
      result: false,
    });
  });

  it('a step off the board is refused', () => {
    // A unit on the northern edge, facing off it.
    const edge = createGameState([['A-5', 'black', 'north']]);
    const unit = getSingleUnitWithPlacementAtCoordinate(edge.boardState, 'A-5');

    expect(isValidMovePath(edge, unit, ['step'], 'advance')).toStrictEqual({
      errorReason: 'Move 1 (step) is not one the unit may make there',
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

    it('a path that records the squaring turn is a move', () => {
      // §6.2.3: the step arrives 45° off head-on; a turn left squares it.
      expect(
        isValidMovePath(gameState, unit, ['step', 'turnLeft'], 'advance'),
      ).toStrictEqual({ result: true });
    });

    it('a path that leaves the squaring turn out may not stop there', () => {
      expect(
        isValidMovePath(gameState, unit, ['step'], 'advance'),
      ).toStrictEqual({
        errorReason: 'The move may not stop there; it may go on with turnLeft',
        result: false,
      });
    });

    it('a path that goes on past the engagement is refused', () => {
      // Squaring up, then trying to step on through the enemy.
      expect(
        isValidMovePath(
          gameState,
          unit,
          ['step', 'turnLeft', 'step'],
          'advance',
        ),
      ).toStrictEqual({
        errorReason: 'Move 3 (step) is not one the unit may make there',
        result: false,
      });
    });
  });

  it('every path the move search offers is valid', () => {
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

    // Every path the search finds must pass the validator unchanged.
    const moves = [...getLegalUnitMoves(unit, gameState)];
    const verdicts = moves.map((move) =>
      isValidMovePath(gameState, unit, move.path, 'advance'),
    );

    expect(moves.length).toBeGreaterThan(10);
    expect(verdicts.every((verdict) => verdict.result)).toBe(true);
  });
});
