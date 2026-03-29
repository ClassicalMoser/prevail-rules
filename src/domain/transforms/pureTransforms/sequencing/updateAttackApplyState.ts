import type { Board } from '@entities';
import type { AttackApplyState, GameState } from '@game';
import {
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
} from '@queries';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the attack apply state updated.
 * Attack apply only occurs in ranged attack resolution (issueCommands) or melee resolution (resolveMelee).
 *
 * @param state - The current game state
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 */
export function updateAttackApplyState<TBoard extends Board>(
  state: GameState<TBoard>,
  attackApplyState: AttackApplyState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  if (phaseState.phase === 'issueCommands') {
    const issueState = getIssueCommandsPhaseState(state);
    const ranged = getRangedAttackResolutionState(state);
    if (!ranged.attackApplyState) {
      throw new Error(
        'No attack apply state found in ranged attack resolution state',
      );
    }
    return updatePhaseState(state, {
      ...issueState,
      currentCommandResolutionState: { ...ranged, attackApplyState },
    });
  }

  if (phaseState.phase === 'resolveMelee') {
    const resolveMelee = getResolveMeleePhaseState(state);
    const melee = getMeleeResolutionState(state);
    const player = attackApplyState.defendingUnit.playerSide;

    if (player === 'white') {
      return updatePhaseState(state, {
        ...resolveMelee,
        currentMeleeResolutionState: {
          ...melee,
          whiteAttackApplyState: attackApplyState,
        },
      });
    }

    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        blackAttackApplyState: attackApplyState,
      },
    });
  }

  throw new Error(
    `Attack apply state update not expected in phase: ${phaseState.phase}`,
  );
}
