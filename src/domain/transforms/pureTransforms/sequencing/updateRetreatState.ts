import type { GameState, RetreatState } from '@game';
import {
  getAttackApplyStateOfPlayer,
  getCurrentPhaseState,
  getFrontEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  isOpenSubstep,
} from '@queries';
import { throwIfPending } from '@utils';
import { updateAttackApplyState } from './updateAttackApplyState';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Creates a new game state with the retreat state updated.
 * Retreat can occur in:
 * - Ranged attack resolution (issueCommands phase)
 * - Front engagement during movement (issueCommands phase)
 * - Melee resolution (resolveMelee phase)
 *
 * @param state - The current game state
 * @param retreatState - The new retreat state to set
 * @returns A new game state with the updated retreat state
 */
export function updateRetreatState<S extends GameState>(
  state: S,
  retreatState: RetreatState,
): S {
  const phaseState = getCurrentPhaseState(state);
  if (
    phaseState.phase !== 'issueCommands' &&
    phaseState.phase !== 'resolveMelee'
  ) {
    throw new Error(
      `Retreat state update not expected in phase: ${phaseState.phase}`,
    );
  }

  // A front engagement from a movement holds its own retreat.
  if (phaseState.phase === 'issueCommands') {
    const commandState = throwIfPending(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
      'No command resolution state found',
    );
    if (commandState.commandResolutionType === 'movement') {
      const engagement = getFrontEngagementStateFromMovement(state);
      if (engagement.engagementResolutionState.retreatState === 'pending') {
        throw new Error('No retreat state found in front engagement');
      }
      return updateEngagementStateInMovement(state, {
        ...engagement,
        engagementResolutionState: {
          ...engagement.engagementResolutionState,
          retreatState,
        },
      });
    }
  }

  // Otherwise it sits on the apply of the attack that forced it.
  const apply = getAttackApplyStateOfPlayer(
    state,
    retreatState.retreatingUnit.unit.playerSide,
  );
  // 'bypassed' is a retreat this attack will never resolve.
  if (!isOpenSubstep(apply.retreatState)) {
    throw new Error('No retreat state found in attack apply state');
  }
  return updateAttackApplyState(state, { ...apply, retreatState });
}
