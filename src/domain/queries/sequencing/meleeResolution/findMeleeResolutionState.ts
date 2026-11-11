import type { GameState, MeleeResolutionState } from '@game';

/**
 * The melee being fought, or `undefined` when none is. The order of the
 * melees is chosen between them (§4.4.2), so outside Phase 4, and in it
 * between one melee and the next, none is under way. `getMeleeResolutionState`
 * is the twin that insists.
 *
 * @param state - The game state
 * @returns The melee resolution, or `undefined`
 */
export function findMeleeResolutionState(
  state: GameState,
): MeleeResolutionState | undefined {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'resolveMelee') {
    return undefined;
  }
  const melee = phaseState.currentMeleeResolutionState;
  if (melee === 'pending') {
    return undefined;
  }
  return melee;
}
