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
  const resolution = findCurrentCommandResolutionState(state);
  if (
    resolution === undefined ||
    resolution.commandResolutionType !== 'movement'
  ) {
    return undefined;
  }
  return resolution;
}
