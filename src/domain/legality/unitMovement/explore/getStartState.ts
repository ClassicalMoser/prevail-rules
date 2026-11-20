import type { MoveContext } from './moveContext';
import type { MoveState } from './moveState';

/**
 * The point a move begins from: the unit where it stands, facing as it
 * faces, with its whole budget unspent (§5.1.4), nothing yet on its path,
 * and its starting position the only one it has held.
 *
 * @param context - What the whole move is bound by
 * @returns The first point of the move
 */
export function getStartState(context: MoveContext): MoveState {
  const start: MoveState = {
    cameFrom: context.start.coordinate,
    coordinate: context.start.coordinate,
    facing: context.start.facing,
    // Where it starts is a position it holds: it may not come back to it.
    heldPositions: [context.start],
    path: [],
    remainingFlexibility: context.totalFlexibility,
    remainingSpeed: context.totalSpeed,
  };
  return start;
}
