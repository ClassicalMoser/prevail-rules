import type { GameState, RoutState } from '@game';
import {
  findRoutLocation,
  getAttackApplyStateOfPlayer,
  getCurrentPhaseState,
  getCurrentRallyResolutionState,
  getIssueCommandsPhaseState,
  getRallyingPlayer,
  isOpenSubstep,
} from '@queries';
import { throwIfPending } from '@utils';
import { updateAttackApplyState } from './updateAttackApplyState';
import { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';
import { updateRallyResolutionState } from './updateRallyResolutionState';
import { updateRetreatRoutState } from './updateRetreatRoutState';

/**
 * Creates a new game state with the rout state updated. It writes the rout
 * where it sits and nothing else; closing what a settled rout held open is
 * {@link settleRout}'s.
 * Rout can occur in:
 * - Ranged attack resolution (issueCommands phase)
 * - Rear engagement rout during movement (issueCommands phase)
 * - Melee resolution (resolveMelee phase)
 * - Rally resolution / lost support (cleanup phase)
 *
 * - A retreat with nowhere to go (§9.1.6), which holds its own rout inside
 *   the retreat, wherever that retreat sits
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 */
export function updateRoutState<S extends GameState>(
  state: S,
  routState: RoutState,
): S {
  // A rout the retreat holds is written through that retreat, whichever
  // attack or engagement the retreat belongs to.
  const heldByRetreat =
    findRoutLocation(state, routState.player)?.source === 'retreat';
  if (heldByRetreat) {
    return updateRetreatRoutState(state, routState);
  }

  const phaseState = getCurrentPhaseState(state);

  // A rear engagement from a movement holds its own rout.
  if (phaseState.phase === 'issueCommands') {
    const commandState = throwIfPending(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
      'No command resolution state found',
    );
    if (commandState.commandResolutionType === 'movement') {
      const engagement = throwIfPending(
        commandState.engagementState,
        'No engagement state found',
      );
      const resolution = engagement.engagementResolutionState;
      if (resolution.engagementType !== 'rear') {
        throw new Error(
          'Rout state update not expected in issueCommands (command type: movement)',
        );
      }
      return updateRearEngagementResolutionState(state, { routState });
    }
  }

  // Otherwise it sits on the apply of the attack that routed the unit.
  if (
    phaseState.phase === 'issueCommands' ||
    phaseState.phase === 'resolveMelee'
  ) {
    const apply = getAttackApplyStateOfPlayer(state, routState.player);
    // 'bypassed' is a rout this attack will never resolve.
    if (!isOpenSubstep(apply.routState)) {
      throw new Error('No rout state found in attack apply state');
    }
    return updateAttackApplyState(state, { ...apply, routState });
  }

  if (phaseState.phase === 'cleanup') {
    const rallyingPlayer = getRallyingPlayer(state);
    const rallyState = getCurrentRallyResolutionState(state);
    if (rallyState.routState === 'pending') {
      throw new Error('No rout state found in rally resolution state');
    }
    const written = updateRallyResolutionState(state, rallyingPlayer, {
      ...rallyState,
      routState,
    });
    return written;
  }

  throw new Error(
    `Rout state update not expected in phase: ${phaseState.phase}`,
  );
}
