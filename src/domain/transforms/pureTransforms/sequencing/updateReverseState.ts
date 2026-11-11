import type { GameState, ReverseState } from '@game';
import {
  getAttackApplyStateOfPlayer,
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  isOpenSubstep,
} from '@queries';
import { throwIfPending } from '@utils';
import { updateAttackApplyState } from './updateAttackApplyState';

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
  if (
    phaseState.phase !== 'issueCommands' &&
    phaseState.phase !== 'resolveMelee'
  ) {
    throw new Error(
      `Reverse state update not expected in phase: ${phaseState.phase}`,
    );
  }

  // Only an attack's apply holds a reverse, so a movement has none.
  if (phaseState.phase === 'issueCommands') {
    const commandState = throwIfPending(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
      'No command resolution state found',
    );
    if (commandState.commandResolutionType !== 'rangedAttack') {
      throw new Error(
        `Reverse state update not expected in issueCommands (command type: ${commandState.commandResolutionType})`,
      );
    }
  }

  const apply = getAttackApplyStateOfPlayer(
    state,
    reverseState.reversingUnit.playerSide,
  );
  // 'bypassed' is a reverse this attack will never resolve.
  if (!isOpenSubstep(apply.reverseState)) {
    throw new Error('No reverse state found in attack apply state');
  }
  return updateAttackApplyState(state, { ...apply, reverseState });
}
