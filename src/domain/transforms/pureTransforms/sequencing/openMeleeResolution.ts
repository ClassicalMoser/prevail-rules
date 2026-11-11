import type { Coordinate } from '@entities';
import type { GameState } from '@game';
import { createOpenedMeleeResolutionState } from '@factories';
import { getResolveMeleePhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Begins fighting the melee at a space: it leaves the engagements still
 * waiting, and its resolution opens (§4.4.2). Melees are fought one at a
 * time, so none may already be under way.
 *
 * @param state - The game state, resolving melees
 * @param space - The engaged space chosen to be fought next
 * @returns The game state with that melee under way
 * @throws Error when another melee is already under way
 */
export function openMeleeResolution<S extends GameState>(
  state: S,
  space: Coordinate,
): S {
  const phaseState = getResolveMeleePhaseState(state);
  if (phaseState.currentMeleeResolutionState !== 'pending') {
    throw new Error('A melee is already being resolved');
  }
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentMeleeResolutionState: createOpenedMeleeResolutionState(space),
    remainingEngagements: phaseState.remainingEngagements.filter(
      (waiting) => waiting !== space,
    ),
  });
  return updated;
}
