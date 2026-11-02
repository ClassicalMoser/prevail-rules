import type { GameState, MeleeResolutionState } from '@game';

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
  if (phaseState === 'none' || phaseState.phase !== 'resolveMelee') {
    throw new Error('Not in resolveMelee phase');
  }
  if (phaseState.currentMeleeResolutionState === 'pending') {
    throw new Error('No current melee resolution state');
  }
  return phaseState.currentMeleeResolutionState;
}
