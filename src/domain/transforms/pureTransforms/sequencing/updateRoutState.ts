import type { Board } from '@entities';
import type { GameState, GameStateForBoard, RoutState } from '@game';
import {
  getCleanupPhaseState,
  getCurrentPhaseStateForBoard,
  getCurrentRallyResolutionState,
  getIssueCommandsPhaseStateForBoard,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseStateForBoard,
  updateRallyResolutionStateForCurrentStep,
} from '@queries';
import { throwIfPending } from '@utils';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the rout state updated.
 * Rout can occur in:
 * - Ranged attack resolution (issueCommands phase)
 * - Rear engagement rout during movement (issueCommands phase)
 * - Melee resolution (resolveMelee phase)
 * - Rally resolution / lost support (cleanup phase)
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 */
export function updateRoutState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  routState: RoutState,
): GameStateForBoard<TBoard> {
  const phaseState = getCurrentPhaseStateForBoard(state);

  if (phaseState.phase === 'issueCommands') {
    const issueState = getIssueCommandsPhaseStateForBoard(state);
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
      if (attackApply.routState === 'pending') {
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
    const resolveMelee = getResolveMeleePhaseStateForBoard(state);
    const melee = getMeleeResolutionState(state);
    const { player } = routState;

    if (player === 'white') {
      const whiteApply = throwIfPending(
        melee.whiteAttackApplyState,
        'No white attack apply state found',
      );
      if (whiteApply.routState === 'pending') {
        throw new Error('No rout state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...resolveMelee,
        currentMeleeResolutionState: {
          ...melee,
          whiteAttackApplyState: { ...whiteApply, routState },
        },
      });
    }

    const blackApply = throwIfPending(
      melee.blackAttackApplyState,
      'No black attack apply state found',
    );
    if (blackApply.routState === 'pending') {
      throw new Error('No rout state found in attack apply state');
    }
    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        blackAttackApplyState: { ...blackApply, routState },
      },
    });
  }

  if (phaseState.phase === 'cleanup') {
    // Safe type broadening for more generic function signature
    const cleanupPhaseState = getCleanupPhaseState(state as GameState);
    const rallyState = getCurrentRallyResolutionState(state);
    if (rallyState.routState === 'pending') {
      throw new Error('No rout state found in rally resolution state');
    }
    const newRallyState = {
      ...rallyState,
      routState,
    };
    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      cleanupPhaseState,
      newRallyState,
      cleanupPhaseState.step,
    );
    return updatePhaseState(state, newPhaseState);
  }

  throw new Error(
    `Rout state update not expected in phase: ${phaseState.phase}`,
  );
}
