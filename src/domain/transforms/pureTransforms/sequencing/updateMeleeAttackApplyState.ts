import type { PlayerSide } from '@entities';
import type { AttackApplyState, GameState } from '@game';
import {
  getMeleeResolutionState,
  getResolveMeleePhaseState,
  hasInitiative,
} from '@queries';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the apply of the attack on one player's unit updated in melee resolution.
 * Uses queries internally to navigate to the attack apply state.
 *
 * @param state - The current game state
 * @param defendingPlayer - The player whose unit takes the attack
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 *
 * @example
 * ```ts
 * const newState = updateMeleeAttackApplyState(state, 'white', {
 *   ...getMeleeAttackApplyState(state, 'white'),
 *   completed: true,
 * });
 * ```
 */
export function updateMeleeAttackApplyState<S extends GameState>(
  state: S,
  defendingPlayer: PlayerSide,
  attackApplyState: AttackApplyState,
): S {
  const resolveMeleePhaseState = getResolveMeleePhaseState(state);
  const meleeState = getMeleeResolutionState(state);

  const newMeleeState = {
    ...meleeState,
    ...(hasInitiative(state, defendingPlayer)
      ? { attackOnFirstPlayerApplyState: attackApplyState }
      : { attackOnSecondPlayerApplyState: attackApplyState }),
  };

  const newPhaseState = {
    ...resolveMeleePhaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
