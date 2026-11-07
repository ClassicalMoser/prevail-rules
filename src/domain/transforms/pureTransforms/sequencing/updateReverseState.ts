import type { GameState, ReverseState } from '@game';
import {
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  hasInitiative,
  isOpenSubstep,
} from '@queries';
import { throwIfPending } from '@utils';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the reverse state updated in an attack apply state.
 * Reverse only occurs in attack-apply context (ranged attack or melee resolution).
 *
 * @param state - The current game state
 * @param reverseState - The new reverse state to set
 * @returns A new game state with the updated reverse state
 */
export function updateReverseState<S extends GameState>(
  state: S,
  reverseState: ReverseState,
): S {
  const phaseState = getCurrentPhaseState(state);

  if (phaseState.phase === 'issueCommands') {
    const issueState = getIssueCommandsPhaseState(state);
    const commandState = throwIfPending(
      issueState.currentCommandResolutionState,
      'No command resolution state found',
    );

    if (commandState.commandResolutionType === 'rangedAttack') {
      const ranged = getRangedAttackResolutionState(state);
      const attackApply = throwIfPending(
        ranged.attackApplyState,
        'No attack apply state found',
      );
      // 'bypassed' is a reverse this attack will never resolve.
      if (!isOpenSubstep(attackApply.reverseState)) {
        throw new Error('No reverse state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...issueState,
        currentCommandResolutionState: {
          ...ranged,
          attackApplyState: { ...attackApply, reverseState },
        },
      });
    }

    throw new Error(
      `Reverse state update not expected in issueCommands (command type: ${commandState.commandResolutionType})`,
    );
  }

  if (phaseState.phase === 'resolveMelee') {
    const resolveMelee = getResolveMeleePhaseState(state);
    const melee = getMeleeResolutionState(state);
    const player = reverseState.reversingUnit.playerSide;

    // The slots are named for the order they resolve in, so the owner has to
    // be placed in that order first.
    const isFirstPlayer = hasInitiative(state, player);
    const apply = throwIfPending(
      isFirstPlayer
        ? melee.firstPlayerAttackApplyState
        : melee.secondPlayerAttackApplyState,
      `No ${player} attack apply state found`,
    );
    if (!isOpenSubstep(apply.reverseState)) {
      throw new Error('No reverse state found in attack apply state');
    }
    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        ...(isFirstPlayer
          ? { firstPlayerAttackApplyState: { ...apply, reverseState } }
          : { secondPlayerAttackApplyState: { ...apply, reverseState } }),
      },
    });
  }

  throw new Error(
    `Reverse state update not expected in phase: ${phaseState.phase}`,
  );
}
