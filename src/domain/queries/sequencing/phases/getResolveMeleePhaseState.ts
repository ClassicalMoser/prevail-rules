import type { GameState, ResolveMeleePhaseState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the resolve melee phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The resolve melee phase state
 * @throws Error if not in resolveMelee phase or phase state is missing
 */
export function getResolveMeleePhaseState<S extends GameState>(
  state: S,
): ResolveMeleePhaseState {
  // The phase the round is in; before the round begins there is none.
  const phaseState = getCurrentPhaseState(state);

  // A caller reading Phase 4, where every engaged space fights (§4.4) outside it has asked out of turn.
  if (phaseState.phase !== 'resolveMelee') {
    throw new Error(`Expected resolveMelee phase, got ${phaseState.phase}`);
  }

  // The resolve melee phase, with its step and what it holds.
  return phaseState;
}
