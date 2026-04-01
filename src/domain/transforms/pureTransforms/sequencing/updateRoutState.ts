import type { Board } from '@entities';
import type { GameState, PhaseState, RoutState } from '@game';
import {
  getCleanupPhaseState,
  getCurrentPhaseState,
  getCurrentRallyResolutionState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  updateRallyResolutionStateForCurrentStep,
} from '@queries';
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
  state: GameState<TBoard>,
  routState: RoutState,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  if (phaseState.phase === 'issueCommands') {
    const issueState = getIssueCommandsPhaseState(state);
    const commandState = issueState.currentCommandResolutionState;

    if (commandState?.commandResolutionType === 'rangedAttack') {
      const ranged = getRangedAttackResolutionState(state);
      const attackApply = ranged.attackApplyState;
      if (!attackApply?.routState) {
        throw new Error('No rout state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...issueState,
        currentCommandResolutionState: {
          ...ranged,
          attackApplyState: { ...attackApply, routState },
        },
      } as PhaseState<TBoard>);
    }

    if (commandState?.commandResolutionType === 'movement') {
      const movement = commandState;
      const engagement = movement.engagementState;
      const resolution = engagement?.engagementResolutionState;
      // Rear rout lives under `engagementResolutionState`; `engagement` must exist for
      // `resolution` to be the rear branch (no `engagement === undefined` merge path).
      if (
        engagement !== undefined &&
        resolution?.engagementType === 'rear' &&
        resolution.routState !== undefined
      ) {
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
        } as PhaseState<TBoard>);
      }
    }

    throw new Error(
      `Rout state update not expected in issueCommands (command type: ${commandState?.commandResolutionType ?? 'none'})`,
    );
  }

  if (phaseState.phase === 'resolveMelee') {
    const resolveMelee = getResolveMeleePhaseState(state);
    const melee = getMeleeResolutionState(state);
    const player = routState.player;

    if (player === 'white') {
      const whiteApply = melee.whiteAttackApplyState;
      if (!whiteApply?.routState) {
        throw new Error('No rout state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...resolveMelee,
        currentMeleeResolutionState: {
          ...melee,
          whiteAttackApplyState: { ...whiteApply, routState },
        },
      } as PhaseState<TBoard>);
    }

    const blackApply = melee.blackAttackApplyState;
    if (!blackApply?.routState) {
      throw new Error('No rout state found in attack apply state');
    }
    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        blackAttackApplyState: { ...blackApply, routState },
      },
    } as PhaseState<TBoard>);
  }

  if (phaseState.phase === 'cleanup') {
    const cleanupPhaseState = getCleanupPhaseState(state);
    const rallyState = getCurrentRallyResolutionState(state);
    if (!rallyState.routState) {
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
    return updatePhaseState(state, newPhaseState as PhaseState<TBoard>);
  }

  throw new Error(
    `Rout state update not expected in phase: ${phaseState.phase}`,
  );
}
