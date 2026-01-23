import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
  RetreatState,
} from '@entities';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
} from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Creates a new game state with the retreat state updated.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses queries internally to navigate to the retreat state.
 *
 * @param state - The current game state
 * @param retreatState - The new retreat state to set
 * @returns A new game state with the updated retreat state
 *
 * @example
 * ```ts
 * const newState = updateRetreatState(state, {
 *   ...getRetreatStateFromRangedAttack(state),
 *   completed: true,
 * });
 * ```
 */
export function updateRetreatState<TBoard extends Board>(
  state: GameState<TBoard>,
  retreatState: RetreatState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);

    if (!attackApplyState.retreatState) {
      throw new Error('No retreat state found in attack apply state');
    }

    const newAttackApplyState = {
      ...attackApplyState,
      retreatState,
    };

    const newRangedAttackState = {
      ...rangedAttackState,
      attackApplyState: newAttackApplyState,
    };

    const newPhaseState: IssueCommandsPhaseState<TBoard> = {
      ...issueCommandsPhaseState,
      currentCommandResolutionState: newRangedAttackState,
    };

    return updatePhaseState(state, newPhaseState);
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Determine which player's retreat state this is
    const retreatingPlayer = retreatState.retreatingUnit.unit.playerSide;
    const isFirstPlayerRetreat = retreatingPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerRetreat) {
      const firstPlayerAttackApply = getAttackApplyStateFromMelee(
        state,
        firstPlayer,
      );
      if (!firstPlayerAttackApply.retreatState) {
        throw new Error('No retreat state found for first player');
      }
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        retreatState,
      };
      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };
    } else {
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const secondPlayerAttackApply = getAttackApplyStateFromMelee(
        state,
        secondPlayer,
      );
      if (!secondPlayerAttackApply.retreatState) {
        throw new Error('No retreat state found for second player');
      }
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        retreatState,
      };
      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };
    }

    const newPhaseState: ResolveMeleePhaseState<TBoard> = {
      ...resolveMeleePhaseState,
      currentMeleeResolutionState: newMeleeState,
    };

    return updatePhaseState(state, newPhaseState);
  }

  throw new Error(
    `Retreat state update not expected in phase: ${phaseState.phase}`,
  );
}
