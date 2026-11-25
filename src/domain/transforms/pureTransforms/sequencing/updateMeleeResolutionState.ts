import type { GameState, MeleeResolutionState } from '@game';
import { getResolveMeleePhaseState } from '@queries';
import { isPending } from '@utils';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the melee resolution state updated in the resolve melee phase.
 * Uses queries internally to navigate to the melee resolution state.
 *
 * @param state - The current game state
 * @param meleeResolutionState - The new melee resolution state to set
 * @returns A new game state with the updated melee resolution state
 *
 * @example
 * ```ts
 * const newState = updateMeleeResolutionState(state, {
 *   ...getMeleeResolutionState(state),
 *   completed: true,
 * });
 * ```
 */
export function updateMeleeResolutionState<S extends GameState>(
  state: S,
  meleeResolutionState: MeleeResolutionState,
): S {
  // Melees are only fought in Phase 4; asked elsewhere, this throws.
  const resolveMeleePhaseState = getResolveMeleePhaseState(state);

  // This writer carries the melee being fought forward, so one must already
  // be under way; choosing the next is `openMeleeResolution`'s (§4.4.2).
  if (isPending(resolveMeleePhaseState.currentMeleeResolutionState)) {
    throw new Error('No current melee resolution state found');
  }

  // The melee, as it now stands, in place of the one before.
  const newPhaseState = {
    ...resolveMeleePhaseState,
    currentMeleeResolutionState: meleeResolutionState,
  };
  const updated = updatePhaseState(state, newPhaseState);

  // Phase 4 with that melee written.
  return updated;
}
