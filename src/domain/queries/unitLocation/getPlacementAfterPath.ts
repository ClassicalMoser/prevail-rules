import type { Board, MoveDelta, UnitPlacement } from '@entities';
import { findForwardSpace, findRearwardSpace } from '../board/steps';
import { getTurnedFacing } from '../facings/getTurnedFacing';

/**
 * Where a path of steps and turns leaves a unit: the space it ends on and
 * the way it faces. This is geometry only — a step goes one space ahead
 * (or behind, in a retreat) and a turn changes the facing (§5.1–§5.2) —
 * and it does not ask whether the rules allow the path. A move event is
 * validated before it is applied, so the transform that carries it out
 * reads the destination here rather than judging the move again.
 *
 * @param board - The board the path is walked on
 * @param start - Where and how the unit stood when the move began
 * @param path - The steps and turns, in order
 * @param direction - Whether a step goes ahead (advance) or behind (retreat)
 * @returns The placement after the last step or turn; `undefined` if a step would leave the board
 */
export function getPlacementAfterPath(
  board: Board,
  start: UnitPlacement,
  path: readonly MoveDelta[],
  direction: 'advance' | 'retreat',
): UnitPlacement | undefined {
  const getSpaceInDirection =
    direction === 'advance' ? findForwardSpace : findRearwardSpace;
  let { coordinate, facing } = start;

  for (const delta of path) {
    if (delta !== 'step') {
      facing = getTurnedFacing(facing, delta);
      continue;
    }
    const next = getSpaceInDirection(board, coordinate, facing);
    // Off the edge of the board: no such placement.
    if (next === undefined) {
      return undefined;
    }
    coordinate = next;
  }

  const end: UnitPlacement = { coordinate, facing };
  return end;
}
