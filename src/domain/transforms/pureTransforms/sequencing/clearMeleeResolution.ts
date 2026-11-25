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
  // Melees are only fought in Phase 4; asked elsewhere, this throws.
  const phaseState = getResolveMeleePhaseState(state);

  // The first player resolves one engagement completely before choosing the
  // next (§4.4.2). The slot goes back to `'pending'`, which is how
  // `openMeleeResolution` knows a new one may be chosen; the engagements
  // still waiting are left as they are.
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentMeleeResolutionState: 'pending',
  });

  // Phase 4 with no melee being fought, waiting for the first player's next
  // choice, or for the phase to end when none are left (§4.4.4).
  return updated;
}
