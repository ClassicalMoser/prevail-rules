import type { Board, MoveDelta, UnitPlacement } from '@entities';
import { findPlacementAfterPath } from './findPlacementAfterPath';

/**
 * Where a validated path leaves a unit: the space it ends on and the way it
 * faces. A move or retreat is checked before it is applied, so its path
 * stays on the board; the transform carrying it out reads the destination
 * here. A path that runs off the board is a fault, not a refusal.
 *
 * @param board - The board the path is walked on
 * @param start - Where and how the unit stood when the move began
 * @param path - The steps and turns, in order
 * @param direction - Whether a step goes ahead (advance) or behind (retreat)
 * @returns The placement after the last step or turn
 * @throws Error when a step would leave the board
 */
export function getPlacementAfterPath(
  board: Board,
  start: UnitPlacement,
  path: readonly MoveDelta[],
  direction: 'advance' | 'retreat',
): UnitPlacement {
  // The same walk as the finder; only a missing answer differs.
  const end = findPlacementAfterPath(board, start, path, direction);
  if (end === undefined) {
    throw new Error(`The ${direction} path leaves the board`);
  }
  return end;
}
