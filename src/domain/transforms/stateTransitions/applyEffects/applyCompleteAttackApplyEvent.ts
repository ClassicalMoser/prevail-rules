import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  RangedAttackResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
} from '@queries';

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
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);

    if (!rangedAttackState.attackApplyState) {
      throw new Error(
        'No attack apply state found in ranged attack resolution',
      );
    }

    const newAttackApplyState = {
      ...rangedAttackState.attackApplyState,
      completed: true,
    };

    const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
      ...rangedAttackState,
      attackApplyState: newAttackApplyState,
    };

    const newPhaseState: IssueCommandsPhaseState<TBoard> = {
      ...issueCommandsPhaseState,
      currentCommandResolutionState: newRangedAttackState,
    };

    return {
      ...state,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Find which player's attack apply state needs to be completed
    // The expected event query determines which one is active
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
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        completed: true,
      };

      const newMeleeState: MeleeResolutionState<TBoard> = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };

      const newPhaseState: ResolveMeleePhaseState<TBoard> = {
        ...resolveMeleePhaseState,
        currentMeleeResolutionState: newMeleeState,
      };

      return {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: newPhaseState,
        },
      };
    }

    // Check second player's attack apply state
    if (secondPlayerAttackApply && !secondPlayerAttackApply.completed) {
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        completed: true,
      };

      const newMeleeState: MeleeResolutionState<TBoard> = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };

      const newPhaseState: ResolveMeleePhaseState<TBoard> = {
        ...resolveMeleePhaseState,
        currentMeleeResolutionState: newMeleeState,
      };

      return {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: newPhaseState,
        },
      };
    }

    throw new Error(
      'No incomplete attack apply state found in melee resolution',
    );
  }

  throw new Error(
    `Complete attack apply not expected in phase: ${phaseState.phase}`,
  );
}
