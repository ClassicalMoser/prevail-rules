import type { GameState } from '@game';
import { getResolveMeleePhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Ends the melee that was under way, so the next may be chosen (§4.4.2).
 *
 * @param state - The game state, resolving melees
 * @returns The game state with no melee under way
 */
export function clearMeleeResolution<S extends GameState>(state: S): S {
  const phaseState = getResolveMeleePhaseState(state);
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentMeleeResolutionState: 'pending',
  });
  return updated;
}
