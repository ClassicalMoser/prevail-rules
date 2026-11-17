import type { MoveResult } from '../explore';
import { compareMoveSize } from './compareMoveSize';

/** A move to E-5 facing north at a given cost; the path is not read. */
function moveCosting(flexibilityUsed: number, speedUsed: number): MoveResult {
  return {
    flexibilityUsed,
    path: [],
    placement: { coordinate: 'E-5', facing: 'north' },
    speedUsed,
  };
}

describe('compareMoveSize function', () => {
  it('counts the move with fewer turns as smaller, whatever its steps', () => {
    // One turn and two steps is smaller than two turns and no step (§9.1.3).
    expect(compareMoveSize(moveCosting(1, 2), moveCosting(2, 0))).toBeLessThan(
      0,
    );
  });

  it('counts the move with fewer steps as smaller when the turns tie', () => {
    expect(
      compareMoveSize(moveCosting(1, 2), moveCosting(1, 1)),
    ).toBeGreaterThan(0);
  });

  it('counts two moves as the same size when both turns and steps tie', () => {
    expect(compareMoveSize(moveCosting(1, 1), moveCosting(1, 1))).toBe(0);
  });
});
