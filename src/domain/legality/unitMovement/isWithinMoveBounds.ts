import type { Coordinate } from '@entities';
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
  if (context.direction === 'advance') {
    return true;
  }
  const isBehindStartingRank = context.retreatSpaces.has(coordinate);
  return isBehindStartingRank;
}
