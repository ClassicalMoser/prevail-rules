import type {
  AttackApplyState,
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
} from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Creates a new game state with the attack apply state updated.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses queries internally to navigate to the attack apply state.
 *
 * @param state - The current game state
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 *
 * @example
 * ```ts
 * const newState = updateAttackApplyState(state, {
 *   ...getAttackApplyStateFromRangedAttack(state),
 *   completed: true,
 * });
 * ```
 */
export function updateAttackApplyState<TBoard extends Board>(
  state: GameState<TBoard>,
  attackApplyState: AttackApplyState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);

    if (!rangedAttackState.attackApplyState) {
      throw new Error(
        'No attack apply state found in ranged attack resolution state',
      );
    }

    const newRangedAttackState = {
      ...rangedAttackState,
      attackApplyState,
    };

    const newPhaseState: IssueCommandsPhaseState<TBoard> = {
      ...issueCommandsPhaseState,
      currentCommandResolutionState: newRangedAttackState,
    };

    return updatePhaseState(state, newPhaseState);
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);

    // Determine which player's attack apply state this is
    const defendingPlayer = attackApplyState.defendingUnit.playerSide;
    const isWhite = defendingPlayer === 'white';

    // Validate that the player's attack apply state exists
    const currentAttackApplyState = getAttackApplyStateFromMelee(
      state,
      defendingPlayer,
    );

    const newMeleeState: MeleeResolutionState<TBoard> = {
      ...meleeState,
      ...(isWhite
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState }),
    };

    const newPhaseState: ResolveMeleePhaseState<TBoard> = {
      ...resolveMeleePhaseState,
      currentMeleeResolutionState: newMeleeState,
    };

    return updatePhaseState(state, newPhaseState);
  }

  throw new Error(
    `Attack apply state update not expected in phase: ${phaseState.phase}`,
  );
}
