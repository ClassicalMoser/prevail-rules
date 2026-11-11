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
  let found: MoveResult | undefined;
  walkMoveEndings(context, from, (ending) => {
    found = ending;
    return true;
  });
  return found;
}
