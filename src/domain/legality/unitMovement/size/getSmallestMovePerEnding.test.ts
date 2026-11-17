import { createGameState } from '@testing';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { getLegalUnitMoves } from '../getLegalUnitMoves';
import { getSmallestMovePerEnding } from './getSmallestMovePerEnding';

describe('getSmallestMovePerEnding function', () => {
  // A white unit at E-5 facing north, free to step twice and turn three
  // times. Among its legal moves, standing still and turning left then right
  // both end where it began (§5.2.2).
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
  const moves = getLegalUnitMoves(unit, state);

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

  it('keeps the way with no wasted turn: standing still, not turning and turning back', () => {
    const smallest = getSmallestMovePerEnding(moves);

    // The unit's own space and facing are reached by the empty path.
    const stayingPut = smallest.find(
      (move) =>
        move.placement.coordinate === 'E-5' &&
        move.placement.facing === 'north',
    );
    expect(stayingPut?.path).toStrictEqual([]);
  });

  it('keeps the fewest turns to a new facing: one turn left, not two left and one right', () => {
    const smallest = getSmallestMovePerEnding(moves);

    // Facing north-west from where it stands takes one 45° turn (§5.2.1).
    const turnedLeft = smallest.find(
      (move) =>
        move.placement.coordinate === 'E-5' &&
        move.placement.facing === 'northWest',
    );
    expect(turnedLeft?.path).toStrictEqual(['turnLeft']);
  });
});
