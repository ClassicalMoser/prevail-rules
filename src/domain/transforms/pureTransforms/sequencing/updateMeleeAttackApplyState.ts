import type {
  AttackApplyState,
  Board,
  GameState,
  PlayerSide,
  ResolveMeleePhaseState,
} from '@entities';
import {
  getAttackApplyStateFromMelee,
  getMeleeResolutionState,
  getResolveMeleePhaseState,
} from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Creates a new game state with the attack apply state updated for a specific player in melee resolution.
 * Uses queries internally to navigate to the attack apply state.
 *
 * @param state - The current game state
 * @param player - The player whose attack apply state to update ('white' or 'black')
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 *
 * @example
 * ```ts
 * const newState = updateMeleeAttackApplyState(state, 'white', {
 *   ...getAttackApplyStateFromMelee(state, 'white'),
 *   completed: true,
 * });
 * ```
 */
export function updateMeleeAttackApplyState<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
  attackApplyState: AttackApplyState<TBoard>,
): GameState<TBoard> {
  const resolveMeleePhaseState = getResolveMeleePhaseState(state);
  const meleeState = getMeleeResolutionState(state);

  // Validate that the player's attack apply state exists
  const currentAttackApplyState = getAttackApplyStateFromMelee(state, player);

  const newMeleeState = {
    ...meleeState,
    ...(player === 'white'
      ? { whiteAttackApplyState: attackApplyState }
      : { blackAttackApplyState: attackApplyState }),
  };

  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...resolveMeleePhaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
