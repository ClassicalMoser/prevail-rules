import type { MoveContext } from './moveContext';
import type { MoveState } from './moveState';

/**
 * The point a move begins from: the unit where it stands, facing as it
 * faces, with its whole budget unspent (§5.1.4) and nothing yet on its path.
 *
 * @param context - What the whole move is bound by
 * @returns The first point of the move
 */
export function getStartState(context: MoveContext): MoveState {
  const start: MoveState = {
    cameFrom: context.start.coordinate,
    coordinate: context.start.coordinate,
    facing: context.start.facing,
    path: [],
    remainingFlexibility: context.totalFlexibility,
    remainingSpeed: context.totalSpeed,
  };
  return start;
}
