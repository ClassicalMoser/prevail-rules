import type { GameState, MeleeResolutionState } from '@game';
import { isNone, isPending } from '@utils';

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
  // Melees are fought only in Phase 4.
  if (isNone(phaseState) || phaseState.phase !== 'resolveMelee') {
    return undefined;
  }

  // Between melees the first player has still to choose the next space.
  const melee = phaseState.currentMeleeResolutionState;
  if (isPending(melee)) {
    return undefined;
  }

  // The melee being fought in the chosen space.
  return melee;
}
