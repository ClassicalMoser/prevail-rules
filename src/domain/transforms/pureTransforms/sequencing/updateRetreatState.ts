import type { Board } from '@entities';
import type { GameStateForBoard, RetreatStateForBoard } from '@game';
import {
  getCurrentPhaseStateForBoard,
  getIssueCommandsPhaseStateForBoard,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseStateForBoard,
} from '@queries';
import { throwIfPending } from '@utils';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the retreat state updated.
 * Retreat can occur in:
 * - Ranged attack resolution (issueCommands phase)
 * - Melee resolution (resolveMelee phase)
 * - Engagement during movement (issueCommands phase; not yet implemented)
 *
 * @param state - The current game state
 * @param retreatState - The new retreat state to set
 * @returns A new game state with the updated retreat state
 */
export function updateRetreatState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  retreatState: RetreatStateForBoard<TBoard>,
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
      if (attackApply.retreatState === 'pending') {
        throw new Error('No retreat state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...issueState,
        currentCommandResolutionState: {
          ...ranged,
          attackApplyState: { ...attackApply, retreatState },
        },
      });
    }

    // TODO: commandResolutionType === 'movement' with engagement retreat
    throw new Error(
      `Retreat state update not expected in issueCommands (command type: ${commandState.commandResolutionType})`,
    );
  }

  if (phaseState.phase === 'resolveMelee') {
    const resolveMelee = getResolveMeleePhaseStateForBoard(state);
    const melee = getMeleeResolutionState(state);
    const player = retreatState.retreatingUnit.unit.playerSide;

    if (player === 'white') {
      const whiteApply = throwIfPending(
        melee.whiteAttackApplyState,
        'No white attack apply state found',
      );
      if (whiteApply.retreatState === 'pending') {
        throw new Error('No retreat state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...resolveMelee,
        currentMeleeResolutionState: {
          ...melee,
          whiteAttackApplyState: { ...whiteApply, retreatState },
        },
      });
    }

    const blackApply = throwIfPending(
      melee.blackAttackApplyState,
      'No black attack apply state found',
    );
    if (blackApply.retreatState === 'pending') {
      throw new Error('No retreat state found in attack apply state');
    }
    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        blackAttackApplyState: { ...blackApply, retreatState },
      },
    });
  }

  throw new Error(
    `Retreat state update not expected in phase: ${phaseState.phase}`,
  );
}
