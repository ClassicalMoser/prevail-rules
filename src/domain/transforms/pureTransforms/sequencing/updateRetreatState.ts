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
import { updateFrontEngagementResolutionState } from './updateFrontEngagementResolutionState';

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
  // A unit falls back after a shot or a front engagement in Phase 3, or after
  // a melee in Phase 4 (§6.3.2, §7.5); no other phase has a retreat to write.
  // TODO(composition): `getAttackApplyStateOfPlayer` below already refuses
  // any other phase, with its own message, so this guard's only effect is
  // a message that names a retreat. Settled with the twin guard in
  // `updateReverseState`, by choosing which message the read keeps.
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
    // The unit's move or shot under way; between units nothing is retreating.
    // TODO(composition): this walk is `getCurrentCommandResolutionState`,
    // which throws "No current command resolution state" where this throws
    // "No command resolution state found". Settled, with the same walk in
    // `updateReverseState`, by calling the getter and keeping one message.
    const commandState = throwIfPending(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
      'No command resolution state found',
    );
    // A defender met head on may fall back if it is faster (§6.3.2); that
    // retreat belongs to the engagement, since no attack forced it.
    if (commandState.commandResolutionType === 'movement') {
      const engagement = getFrontEngagementStateFromMovement(state);
      // The engagement opens the retreat once the defender chooses to fall
      // back; this writer only carries an opened one forward.
      if (!isOpenSubstep(engagement.engagementResolutionState.retreatState)) {
        throw new Error('No retreat state found in front engagement');
      }
      const written = updateFrontEngagementResolutionState(state, {
        retreatState,
      });
      // The front engagement, holding the retreat as it now stands.
      return written;
    }
  }

  // Otherwise it sits on the apply of the attack that forced it.
  // The retreating unit's owner names the apply: a shot has one, and in a
  // melee each side has its own (§7.2.1).
  const apply = getAttackApplyStateOfPlayer(
    state,
    retreatState.retreatingUnit.playerSide,
  );
  // 'bypassed' is a retreat this attack will never resolve.
  if (!isOpenSubstep(apply.retreatState)) {
    throw new Error('No retreat state found in attack apply state');
  }
  const written = updateAttackApplyState(state, { ...apply, retreatState });

  // The attack's results, holding the retreat as it now stands.
  return written;
}
