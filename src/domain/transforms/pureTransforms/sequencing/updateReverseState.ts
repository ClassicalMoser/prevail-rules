import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
  ReverseState,
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
 * Creates a new game state with the reverse state updated in an attack apply state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses queries internally to navigate to the reverse state.
 *
 * @param state - The current game state
 * @param reverseState - The new reverse state to set
 * @returns A new game state with the updated reverse state
 *
 * @example
 * ```ts
 * const newState = updateReverseState(state, {
 *   ...getReverseStateFromAttackApply(getAttackApplyStateFromRangedAttack(state)),
 *   completed: true,
 * });
 * ```
 */
export function updateReverseState<TBoard extends Board>(
  state: GameState<TBoard>,
  reverseState: ReverseState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);

    if (!attackApplyState.reverseState) {
      throw new Error('No reverse state found in attack apply state');
    }

    const newAttackApplyState = {
      ...attackApplyState,
      reverseState,
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

    // Determine which player's reverse state this is
    const reversingPlayer = reverseState.reversingUnit.unit.playerSide;
    const isFirstPlayerReverse = reversingPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerReverse) {
      const firstPlayerAttackApply = getAttackApplyStateFromMelee(
        state,
        firstPlayer,
      );
      if (!firstPlayerAttackApply.reverseState) {
        throw new Error('No reverse state found for first player');
      }
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        reverseState,
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
      if (!secondPlayerAttackApply.reverseState) {
        throw new Error('No reverse state found for second player');
      }
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        reverseState,
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
    `Reverse state update not expected in phase: ${phaseState.phase}`,
  );
}
