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
  // Melees are only fought in Phase 4, one at a time; asked elsewhere, or
  // between melees, these throw.
  // TODO(composition): this rebuilds `updateMeleeResolutionState` by hand
  // (phase state, spread, `updatePhaseState`). Swapping it in moves the
  // first throw outside Phase 4 from `getResolveMeleePhaseState`'s message
  // to `getMeleeResolutionState`'s, so it is left for the read. The
  // owner-to-slot choice below is one of the `@transforms` copies of the
  // ternary that `getMeleeAttackApplyState`'s mark counts.
  const resolveMeleePhaseState = getResolveMeleePhaseState(state);
  const meleeState = getMeleeResolutionState(state);

  // Both units strike at once and both may take results (§7.2.1), so each
  // has its own apply. The slots are named for whose unit takes the blow:
  // the first player's unit, or the second's.
  const newMeleeState = {
    ...meleeState,
    ...(hasInitiative(state, defendingPlayer)
      ? { attackOnFirstPlayerApplyState: attackApplyState }
      : { attackOnSecondPlayerApplyState: attackApplyState }),
  };

  // The melee, with that side's results, back in Phase 4.
  const newPhaseState = {
    ...resolveMeleePhaseState,
    currentMeleeResolutionState: newMeleeState,
  };
  const updated = updatePhaseState(state, newPhaseState);

  // Phase 4 with that unit's results as they now stand.
  return updated;
}
