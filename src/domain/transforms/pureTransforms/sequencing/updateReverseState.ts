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
  // A unit is turned about only by an attack: a shot in Phase 3 or a melee
  // in Phase 4 (§7.5.1); no other phase has a reverse to write.
  // TODO(composition): `getAttackApplyStateOfPlayer` below already refuses
  // any other phase, with its own message, so this guard's only effect is
  // a message that names a reverse. Settled with the twin guard in
  // `updateRetreatState`, by choosing which message the read keeps.
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
    // The unit's move or shot under way; between units nothing is reversing.
    // TODO(composition): this walk is `getCurrentCommandResolutionState`,
    // which throws "No current command resolution state" where this throws
    // "No command resolution state found". Settled, with the same walk in
    // `updateRetreatState`, by calling the getter and keeping one message.
    const commandState = throwIfPending(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
      'No command resolution state found',
    );
    // An engagement turns a flanked defender (§6.3.4), but that is the
    // flank engagement's own rotation, not a reverse; during a move there is
    // no reverse to write.
    if (commandState.commandResolutionType !== 'rangedAttack') {
      throw new Error(
        `Reverse state update not expected in issueCommands (command type: ${commandState.commandResolutionType})`,
      );
    }
  }

  // The reversing unit's owner names the apply: a shot has one, and in a
  // melee each side has its own (§7.2.1).
  const apply = getAttackApplyStateOfPlayer(
    state,
    reverseState.reversingUnit.playerSide,
  );
  // 'bypassed' is a reverse this attack will never resolve.
  if (!isOpenSubstep(apply.reverseState)) {
    throw new Error('No reverse state found in attack apply state');
  }
  const written = updateAttackApplyState(state, { ...apply, reverseState });

  // The attack's results, holding the reverse as it now stands.
  return written;
}
