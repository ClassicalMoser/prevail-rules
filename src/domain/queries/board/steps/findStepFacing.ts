import type { Board, Coordinate, UnitFacing } from '@entities';
import { unitFacings } from '@entities';
import { findForwardSpace } from './findForwardSpace';

/**
 * The way a unit must face to step from one space into a neighbouring one.
 * A unit only ever steps straight ahead (§5.1.3), so the facing a step
 * arrives with is fixed by where it came from and where it went — which is
 * why the rules that judge a step need only the two spaces, never a facing.
 *
 * TODO(composition): this tries all eight facings, a full step each, to find
 * one. The sign of the row and column difference between the two spaces
 * names the facing outright; settle whether that arithmetic replaces the
 * search.
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
  // The one facing whose step from the first space lands on the second.
  const facing = unitFacings.find(
    (candidate) => findForwardSpace(board, from, candidate) === to,
  );

  // That facing, or none when no single step joins the two.
  return facing;
}
