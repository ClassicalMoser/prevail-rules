import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
  RoutState,
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
 * Creates a new game state with the rout state updated in an attack apply state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses queries internally to navigate to the rout state.
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 *
 * @example
 * ```ts
 * const newState = updateRoutState(state, {
 *   substepType: 'rout',
 *   player: 'white',
 *   unitsToRout: new Set([unit]),
 *   numberToDiscard: 2,
 *   cardsChosen: false,
 *   completed: false,
 * });
 * ```
 */
export function updateRoutState<TBoard extends Board>(
  state: GameState<TBoard>,
  routState: RoutState,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);

    if (!attackApplyState.routState) {
      throw new Error('No rout state found in attack apply state');
    }

    const newAttackApplyState = {
      ...attackApplyState,
      routState,
    };

    const newRangedAttackState = {
      ...rangedAttackState,
      attackApplyState: newAttackApplyState,
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
    const firstPlayer = state.currentInitiative;

    // Determine which player's rout state this is
    const routingPlayer = routState.player;
    const isFirstPlayerRout = routingPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerRout) {
      const firstPlayerAttackApply = getAttackApplyStateFromMelee(
        state,
        firstPlayer,
      );
      if (!firstPlayerAttackApply.routState) {
        throw new Error('No rout state found for first player');
      }
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        routState,
      };
      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };
    } else {
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const secondPlayerAttackApply = getAttackApplyStateFromMelee(
        state,
        secondPlayer,
      );
      if (!secondPlayerAttackApply.routState) {
        throw new Error('No rout state found for second player');
      }
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        routState,
      };
      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };
    }

    const newPhaseState: ResolveMeleePhaseState<TBoard> = {
      ...resolveMeleePhaseState,
      currentMeleeResolutionState: newMeleeState,
    };

    return updatePhaseState(state, newPhaseState);
  }

  throw new Error(
    `Rout state update not expected in phase: ${phaseState.phase}`,
  );
}
