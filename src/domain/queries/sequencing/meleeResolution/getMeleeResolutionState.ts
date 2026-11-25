import type { GameState, MeleeResolutionState } from '@game';
import { isNone, isPending } from '@utils';

/**
 * Gets the melee resolution state from the resolve melee phase.
 * Assumes we're in resolveMelee phase with a melee resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The melee resolution state
 * @throws Error if not in resolveMelee phase or melee resolution state is missing
 */
export function getMeleeResolutionState<S extends GameState>(
  state: S,
): MeleeResolutionState {
  const phaseState = state.currentRoundState.currentPhaseState;
  // `'none'` and any other phase are both "not resolve melee".
  // TODO(composition): repeats the descent in `findMeleeResolutionState`
  // rather than insisting on it, and on `'none'` throws its own message where
  // `getCurrentCommandResolutionState` lets `getCurrentPhaseState` throw. Settle
  // one shape for the twin getters, keeping each message as specific.
  if (isNone(phaseState) || phaseState.phase !== 'resolveMelee') {
    throw new Error('Not in resolveMelee phase');
  }

  // Between melees the first player has still to choose the next space, so
  // there is no melee to read.
  if (isPending(phaseState.currentMeleeResolutionState)) {
    throw new Error('No current melee resolution state');
  }

  // The melee being fought.
  return phaseState.currentMeleeResolutionState;
}
