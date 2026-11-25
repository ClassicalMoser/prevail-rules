import type { MoveResult } from '../explore';
import { createGameState } from '@testing';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { exploreUnitMoves } from '../explore';
import { getSmallestMovePerEnding } from './getSmallestMovePerEnding';

/**
 * Where a move ends is what a player chooses, so the legal options offer one
 * way to each ending: the fewest turns, then the fewest steps.
 */
describe('getSmallestMovePerEnding function', () => {
  // A white unit at E-5 facing north, free to step twice and turn three
  // times. The walk finds every legal path, so some endings come more than
  // one way: facing west on E-5, for one, by two turns left, or by three
  // turns, two right and one about. No path may come back to a position it held
  // (§5.2.4), so standing still is the only way to stay where it began.
  const state = createGameState([
    {
      coord: 'E-5',
      facing: 'north',
      flexibility: 3,
      player: 'white',
      speed: 2,
    },
  ]);
  const unit = getSingleUnitWithPlacementAtCoordinate(state.boardState, 'E-5');
  const moves = exploreUnitMoves(state, unit, 'advance');

  it('keeps the fewest turns to a new facing: two turns left, not three', () => {
    const smallest = getSmallestMovePerEnding(moves);

    // Facing west from where it stands takes two 45° turns left (§5.2.1);
    // two right and one about gets there too, for three.
    const facingWest = smallest.filter(
      (move) =>
        move.placement.coordinate === 'E-5' && move.placement.facing === 'west',
    );
    expect(facingWest.map((move) => move.path)).toStrictEqual([
      ['turnLeft', 'turnLeft'],
    ]);
  });

  describe('written by hand, so only the costs and endings are read', () => {
    // Ways to end on D-5: the path is a label here, not a walk the rules
    // checked, since this rule compares only what each way costs.
    const facingNorth = (
      flexibilityUsed: number,
      speedUsed: number,
      path: MoveResult['path'],
    ): MoveResult => ({
      flexibilityUsed,
      path,
      placement: { coordinate: 'D-5', facing: 'north' },
      speedUsed,
    });

    it('a smaller way found later replaces the one kept', () => {
      // Two turns and a step, then the plain step: the plain step is kept.
      const smallest = getSmallestMovePerEnding([
        facingNorth(2, 1, ['turnLeft', 'step', 'turnRight']),
        facingNorth(0, 1, ['step']),
      ]);

      expect(smallest.map((move) => move.path)).toStrictEqual([['step']]);
    });

    it('of two equally small ways, the first found is kept', () => {
      const smallest = getSmallestMovePerEnding([
        facingNorth(2, 1, ['turnLeft', 'step', 'turnRight']),
        facingNorth(2, 1, ['turnRight', 'step', 'turnLeft']),
      ]);

      expect(smallest.map((move) => move.path)).toStrictEqual([
        ['turnLeft', 'step', 'turnRight'],
      ]);
    });

    it('the same space faced two ways is two endings', () => {
      // A facing is part of where a move ends: both are kept, in the order
      // they first appear.
      const facingEast: MoveResult = {
        flexibilityUsed: 2,
        path: ['step', 'turnRight', 'turnRight'],
        placement: { coordinate: 'D-5', facing: 'east' },
        speedUsed: 1,
      };
      const smallest = getSmallestMovePerEnding([
        facingEast,
        facingNorth(0, 1, ['step']),
      ]);

      expect(smallest.map((move) => move.placement)).toStrictEqual([
        { coordinate: 'D-5', facing: 'east' },
        { coordinate: 'D-5', facing: 'north' },
      ]);
    });
  });
});
