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
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Creates a new game state with the rout state updated within a retreat state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses queries internally to navigate to the retreat state.
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 *
 * @example
 * ```ts
 * const newState = updateRetreatRoutState(state, {
 *   substepType: 'rout',
 *   player: 'white',
 *   unitsToRout: new Set([unit]),
 *   numberToDiscard: undefined,
 *   cardsChosen: false,
 *   completed: false,
 * });
 * ```
 */
export function updateRetreatRoutState<TBoard extends Board>(
  state: GameState<TBoard>,
  routState: RoutState,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);
    const retreatState = getRetreatStateFromRangedAttack(state);

    const newRetreatState = {
      ...retreatState,
      routState,
    };

    const newAttackApplyState = {
      ...attackApplyState,
      retreatState: newRetreatState,
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

    // Determine which player's retreat state this is
    const routingPlayer = routState.player;
    const isFirstPlayerRout = routingPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerRout) {
      const firstPlayerAttackApply = getAttackApplyStateFromMelee(
        state,
        firstPlayer,
      );
      const firstPlayerRetreat = getRetreatStateFromMelee(state, firstPlayer);
      const newRetreatState = {
        ...firstPlayerRetreat,
        routState,
      };
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        retreatState: newRetreatState,
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
      const secondPlayerRetreat = getRetreatStateFromMelee(
        state,
        secondPlayer,
      );
      const newRetreatState = {
        ...secondPlayerRetreat,
        routState,
      };
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        retreatState: newRetreatState,
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
    `Retreat rout state update not expected in phase: ${phaseState.phase}`,
  );
}
