import type {
  Board,
  GameState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import { getResolveMeleePhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

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
export function updateMeleeResolutionState<TBoard extends Board>(
  state: GameState<TBoard>,
  meleeResolutionState: MeleeResolutionState<TBoard>,
): GameState<TBoard> {
  const resolveMeleePhaseState = getResolveMeleePhaseState(state);

  if (!resolveMeleePhaseState.currentMeleeResolutionState) {
    throw new Error('No current melee resolution state found');
  }

  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...resolveMeleePhaseState,
    currentMeleeResolutionState: meleeResolutionState,
  };

  return updatePhaseState(state, newPhaseState);
}
