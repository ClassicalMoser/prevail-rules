import type { Board } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
} from '@queries';
import {
  updateAttackApplyState,
  updateMeleeAttackApplyState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteAttackApplyEvent to the game state.
 * Marks the attack apply state as completed.
 * Can be in ranged attack resolution (issueCommands phase) or melee resolution (resolveMelee phase).
 *
 * Melee uses {@link getAttackApplyStateFromMelee}; ranged uses
 * {@link getAttackApplyStateFromRangedAttack}. Remaining `attackType` exhaustiveness is a
 * schema / replay guard only.
 *
 * @param event - The complete attack apply event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply state marked as completed
 */
export function applyCompleteAttackApplyEvent<TBoard extends Board>(
  event: CompleteAttackApplyEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  if (event.attackType === 'ranged') {
    const currentAttackApplyState = getAttackApplyStateFromRangedAttack(state);

    const newAttackApplyState: AttackApplyState<TBoard> = {
      ...currentAttackApplyState,
      completed: true,
    };

    return updateAttackApplyState(state, newAttackApplyState);
  }

  if (event.attackType === 'melee') {
    const current = getAttackApplyStateFromMelee(state, event.defendingPlayer);

    const newAttackApplyState: AttackApplyState<TBoard> = {
      ...current,
      completed: true,
    };

    // Update the melee attack apply state
    return updateMeleeAttackApplyState(
      state,
      event.defendingPlayer,
      newAttackApplyState,
    );
  }

  // Should not occur, but convenient and inexpensive to check for type safety anyway.
  const _exhaustive: never = event.attackType;
  throw new Error(
    `Unknown attack type for completeAttackApply: ${_exhaustive}`,
  );
}
