import type { GameState, RoutState } from '@game';
import {
  findRoutLocation,
  getCleanupPhaseState,
  getCurrentPhaseState,
  getCurrentRallyResolutionState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getNextStepForResolveRally,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  hasInitiative,
  isOpenSubstep,
} from '@queries';
import { throwIfPending } from '@utils';
import { updateRetreatRoutState } from './updateRetreatRoutState';
import { updateRallyResolutionStateForCurrentStep } from './updateRallyResolutionStateForCurrentStep';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the rout state updated.
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
      // 'bypassed' is a rout this attack will never resolve.
      if (!isOpenSubstep(attackApply.routState)) {
        throw new Error('No rout state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...issueState,
        currentCommandResolutionState: {
          ...ranged,
          attackApplyState: { ...attackApply, routState },
        },
      });
    }

    if (commandState.commandResolutionType === 'movement') {
      const movement = commandState;
      const engagement = throwIfPending(
        movement.engagementState,
        'No engagement state found',
      );
      const resolution = engagement.engagementResolutionState;
      if (resolution.engagementType === 'rear') {
        return updatePhaseState(state, {
          ...issueState,
          currentCommandResolutionState: {
            ...movement,
            engagementState: {
              ...engagement,
              engagementResolutionState: {
                ...resolution,
                routState,
              },
            },
          },
        });
      }
    }

    throw new Error(
      `Rout state update not expected in issueCommands (command type: ${commandState.commandResolutionType})`,
    );
  }

  if (phaseState.phase === 'resolveMelee') {
    const resolveMelee = getResolveMeleePhaseState(state);
    const melee = getMeleeResolutionState(state);
    const { player } = routState;

    // The slots are named for the order they resolve in, so the owner has to
    // be placed in that order first.
    const isFirstPlayer = hasInitiative(state, player);
    const apply = throwIfPending(
      isFirstPlayer
        ? melee.firstPlayerAttackApplyState
        : melee.secondPlayerAttackApplyState,
      `No ${player} attack apply state found`,
    );
    if (!isOpenSubstep(apply.routState)) {
      throw new Error('No rout state found in attack apply state');
    }
    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        ...(isFirstPlayer
          ? { firstPlayerAttackApplyState: { ...apply, routState } }
          : { secondPlayerAttackApplyState: { ...apply, routState } }),
      },
    });
  }

  if (phaseState.phase === 'cleanup') {
    // Safe type broadening for more generic function signature
    const cleanupPhaseState = getCleanupPhaseState(state);
    const rallyState = getCurrentRallyResolutionState(state);
    if (rallyState.routState === 'pending') {
      throw new Error('No rout state found in rally resolution state');
    }
    const newRallyState = {
      ...rallyState,
      ...(routState.completed ? { completed: true } : {}),
      routState,
    };
    const nextStep = routState.completed
      ? getNextStepForResolveRally(state)
      : cleanupPhaseState.step;
    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      cleanupPhaseState,
      newRallyState,
      nextStep,
    );
    return updatePhaseState(state, newPhaseState);
  }

  throw new Error(
    `Rout state update not expected in phase: ${phaseState.phase}`,
  );
}
