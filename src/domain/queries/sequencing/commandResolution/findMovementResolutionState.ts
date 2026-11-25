import type { GameState, MovementResolutionState } from '@game';
import { findCurrentCommandResolutionState } from './findCurrentCommandResolutionState';

/**
 * The movement being carried out, or `undefined` when the order in progress
 * is not a movement or none is. `getMovementResolutionState` is the twin that
 * insists.
 *
 * @param state - The game state
 * @returns The movement resolution, or `undefined`
 */
export function findMovementResolutionState(
  state: GameState,
): MovementResolutionState | undefined {
  // Whatever order is being carried out, if any.
  const resolution = findCurrentCommandResolutionState(state);

  // No order, or a Shoot: no unit is moving.
  if (
    resolution === undefined ||
    resolution.commandResolutionType !== 'movement'
  ) {
    return undefined;
  }

  // A Move order is being carried out.
  return resolution;
}
