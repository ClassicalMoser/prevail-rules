import type { Board, Coordinate, UnitFacing } from '@entities';
import { unitFacings } from '@entities';
import { findForwardSpace } from './findForwardSpace';

/**
 * The way a unit must face to step from one space into a neighbouring one.
 * A unit only ever steps straight ahead (§5.1.3), so the facing a step
 * arrives with is fixed by where it came from and where it went — which is
 * why the rules that judge a step need only the two spaces, never a facing.
 *
 * @param board - The board
 * @param from - The space the step leaves
 * @param to - The space the step enters
 * @returns The facing that steps from one into the other; `undefined` when the two are not neighbours
 */
export function findStepFacing(
  board: Board,
  from: Coordinate,
  to: Coordinate,
): UnitFacing | undefined {
  const facing = unitFacings.find(
    (candidate) => findForwardSpace(board, from, candidate) === to,
  );
  return facing;
}
