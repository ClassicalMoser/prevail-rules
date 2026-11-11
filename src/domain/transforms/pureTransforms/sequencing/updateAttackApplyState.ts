import type { AttackApplyState, GameState } from '@game';
import { getCurrentPhaseState, getRangedAttackResolutionState } from '@queries';
import { updateCommandResolutionState } from './updateCommandResolutionState';
import { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';

/**
 * Creates a new game state with the attack apply state updated.
 * Attack apply only occurs in ranged attack resolution (issueCommands) or melee resolution (resolveMelee).
 *
 * @param state - The current game state
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 */
export function updateAttackApplyState<S extends GameState>(
  state: S,
  attackApplyState: AttackApplyState,
): S {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const ranged = getRangedAttackResolutionState(state);
    if (ranged.attackApplyState === 'pending') {
      throw new Error(
        'No attack apply state found in ranged attack resolution state',
      );
    }
    return updateCommandResolutionState(state, { ...ranged, attackApplyState });
  }

  if (phaseState.phase === 'resolveMelee') {
    // The slots are named for whose unit holds the result, so the owner
    // picks the slot.
    return updateMeleeAttackApplyState(
      state,
      attackApplyState.defendingUnit.playerSide,
      attackApplyState,
    );
  }

  throw new Error(
    `Attack apply state update not expected in phase: ${phaseState.phase}`,
  );
}
