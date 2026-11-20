import { createGameState } from '@testing';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { exploreUnitMoves } from '../explore';
import { getSmallestMovePerEnding } from './getSmallestMovePerEnding';

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

  it('keeps one way to each space and facing', () => {
    const smallest = getSmallestMovePerEnding(moves);

    // Exactly one kept move for the unit's own space, still facing north.
    const stayingPut = smallest.filter(
      (move) =>
        move.placement.coordinate === 'E-5' &&
        move.placement.facing === 'north',
    );
    expect(stayingPut).toHaveLength(1);
  });

  it('keeps standing still as the way to stay where it began', () => {
    const smallest = getSmallestMovePerEnding(moves);

    // The unit's own space and facing are reached by the empty path.
    const stayingPut = smallest.find(
      (move) =>
        move.placement.coordinate === 'E-5' &&
        move.placement.facing === 'north',
    );
    expect(stayingPut?.path).toStrictEqual([]);
  });

  it('keeps the fewest turns to a new facing: two turns left, not three', () => {
    const smallest = getSmallestMovePerEnding(moves);

    // Facing west from where it stands takes two 45° turns left (§5.2.1);
    // two right and one about gets there too, for three.
    const facingWest = smallest.find(
      (move) =>
        move.placement.coordinate === 'E-5' && move.placement.facing === 'west',
    );
    expect(facingWest?.path).toStrictEqual(['turnLeft', 'turnLeft']);
  });
});
