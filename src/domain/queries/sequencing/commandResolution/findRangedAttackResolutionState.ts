import type { GameState, RangedAttackResolutionState } from '@game';
import { findCurrentCommandResolutionState } from './findCurrentCommandResolutionState';

/**
 * The shot being taken, or `undefined` when the order in progress is not a
 * shot or none is. `getRangedAttackResolutionState` is the twin that insists.
 *
 * @param state - The game state
 * @returns The ranged attack resolution, or `undefined`
 */
export function findRangedAttackResolutionState(
  state: GameState,
): RangedAttackResolutionState | undefined {
  const resolution = findCurrentCommandResolutionState(state);
  if (
    resolution === undefined ||
    resolution.commandResolutionType !== 'rangedAttack'
  ) {
    return undefined;
  }
  return resolution;
}
