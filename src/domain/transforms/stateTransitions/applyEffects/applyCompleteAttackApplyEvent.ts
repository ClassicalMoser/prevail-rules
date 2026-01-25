import type { AttackApplyState, Board, GameState } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getMeleeResolutionState,
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
 * @param event - The complete attack apply event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply state marked as completed
 */
export function applyCompleteAttackApplyEvent<TBoard extends Board>(
  event: CompleteAttackApplyEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const currentAttackApplyState = getAttackApplyStateFromRangedAttack(state);

    const newAttackApplyState: AttackApplyState<TBoard> = {
      ...currentAttackApplyState,
      completed: true,
    };

    return updateAttackApplyState(state, newAttackApplyState);
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    const firstPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.whiteAttackApplyState
        : meleeState.blackAttackApplyState;
    const secondPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.blackAttackApplyState
        : meleeState.whiteAttackApplyState;

    // Check first player's attack apply state
    if (firstPlayerAttackApply && !firstPlayerAttackApply.completed) {
      const newAttackApplyState: AttackApplyState<TBoard> = {
        ...firstPlayerAttackApply,
        completed: true,
      };

      return updateMeleeAttackApplyState(
        state,
        firstPlayer,
        newAttackApplyState,
      );
    }

    // Check second player's attack apply state
    if (secondPlayerAttackApply && !secondPlayerAttackApply.completed) {
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const newAttackApplyState: AttackApplyState<TBoard> = {
        ...secondPlayerAttackApply,
        completed: true,
      };

      return updateMeleeAttackApplyState(
        state,
        secondPlayer,
        newAttackApplyState,
      );
    }

    throw new Error(
      'No incomplete attack apply state found in melee resolution',
    );
  }

  throw new Error(
    `Complete attack apply not expected in phase: ${phaseState.phase}`,
  );
}
