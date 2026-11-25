import type { Coordinate } from '@ruleValues';
import type { MoveContext } from './moveContext';

/**
 * Whether a space lies within the ground this move may use. An advance may
 * go anywhere its steps can reach; a retreat must stay behind the rank it
 * started on, both in the spaces it passes through and the one it ends in
 * (§9.1.2).
 *
 * @param context - What the whole move is bound by
 * @param coordinate - The space in question
 * @returns Whether the move may pass through or end on that space
 */
export function isWithinMoveBounds(
  context: MoveContext,
  coordinate: Coordinate,
): boolean {
  // An ordered advance is bound only by its allowances and the ground.
  if (context.direction === 'advance') {
    return true;
  }

  // A retreat falls back into the half of the board behind its starting
  // rank (§2.3.3), which `createMoveContext` worked out once for the move.
  const isBehindStartingRank = context.retreatSpaces.has(coordinate);

  // Whether the retreat may use this space, to pass through or to end on.
  return isBehindStartingRank;
}
