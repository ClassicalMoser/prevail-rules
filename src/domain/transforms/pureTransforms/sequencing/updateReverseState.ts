import type { Board } from '@entities';
import type {
  GameState,
  MeleeResolutionState,
  PhaseState,
  RangedAttackResolutionState,
  ReverseState,
} from '@game';
import {
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
} from '@queries';
import { updatePhaseState } from '../state';

/**
 * Creates a new game state with the reverse state updated in an attack apply state.
 * Reverse only occurs in attack-apply context (ranged attack or melee resolution).
 *
 * @param state - The current game state
 * @param reverseState - The new reverse state to set
 * @returns A new game state with the updated reverse state
 */
export function updateReverseState<TBoard extends Board>(
  state: GameState<TBoard>,
  reverseState: ReverseState,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  if (phaseState.phase === 'issueCommands') {
    const issueState = getIssueCommandsPhaseState(state);
    const commandState = issueState.currentCommandResolutionState;

    if (commandState?.commandResolutionType === 'rangedAttack') {
      const ranged = getRangedAttackResolutionState(state);
      const attackApply = ranged.attackApplyState;
      if (!attackApply?.reverseState) {
        throw new Error('No reverse state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...issueState,
        currentCommandResolutionState: {
          ...ranged,
          attackApplyState: { ...attackApply, reverseState },
        } as RangedAttackResolutionState,
      } as PhaseState<TBoard>);
    }

    throw new Error(
      `Reverse state update not expected in issueCommands (command type: ${commandState?.commandResolutionType ?? 'none'})`,
    );
  }

  if (phaseState.phase === 'resolveMelee') {
    const resolveMelee = getResolveMeleePhaseState(state);
    const melee = getMeleeResolutionState(state);
    const player = reverseState.reversingUnit.unit.playerSide;

    if (player === 'white') {
      const whiteApply = melee.whiteAttackApplyState;
      if (!whiteApply?.reverseState) {
        throw new Error('No reverse state found in attack apply state');
      }
      return updatePhaseState(state, {
        ...resolveMelee,
        currentMeleeResolutionState: {
          ...melee,
          whiteAttackApplyState: { ...whiteApply, reverseState },
        } as MeleeResolutionState,
      } as PhaseState<TBoard>);
    }

    const blackApply = melee.blackAttackApplyState;
    if (!blackApply?.reverseState) {
      throw new Error('No reverse state found in attack apply state');
    }
    return updatePhaseState(state, {
      ...resolveMelee,
      currentMeleeResolutionState: {
        ...melee,
        blackAttackApplyState: { ...blackApply, reverseState },
      } as MeleeResolutionState,
    } as PhaseState<TBoard>);
  }

  throw new Error(
    `Reverse state update not expected in phase: ${phaseState.phase}`,
  );
}
