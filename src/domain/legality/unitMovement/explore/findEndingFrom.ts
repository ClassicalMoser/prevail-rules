import type { MoveContext } from './moveContext';
import type { MoveResult } from './moveResult';
import type { MoveState } from './moveState';
import { walkMoveEndings } from './walkMoveEndings';

/**
 * A place the move may legally end, reachable from a point in it, or
 * `undefined` when there is none. A part of a move is worth offering only if
 * the move can still be finished after it, so this is asked of the point each
 * candidate step or turn would reach.
 *
 * @param context - What the whole move is bound by
 * @param from - The point the move would be at
 * @returns One legal ending from there, or `undefined` if the move would be stranded
 */
export function findEndingFrom(
  context: MoveContext,
  from: MoveState,
): MoveResult | undefined {
  // Keep the first ending the walk reports, and stop it there: one is
  // enough to show the move can be finished. Its callers ask only whether
  // there is one (`findLegalMoveDeltas`), so which ending is kept does not
  // matter; stopping early only saves the rest of the walk.
  let found: MoveResult | undefined;
  walkMoveEndings(context, from, (ending) => {
    found = ending;
    return true;
  });

  // An ending, or `undefined` when every way on from here is a dead end.
  return found;
}
