import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  RangedAttackResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
  getRetreatStateFromRangedAttack,
} from '@queries';

/**
 * Applies a TriggerRoutFromRetreatEvent to the game state.
 * Creates a rout state in the retreat state when there are no legal retreat options.
 *
 * @param event - The trigger rout from retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the rout state created in the retreat state
 */
export function applyTriggerRoutFromRetreatEvent<TBoard extends Board>(
  event: TriggerRoutFromRetreatEvent<TBoard>,
  state: GameState<TBoard>,
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

    // Create rout state for the retreating unit
    const routState = {
      substepType: 'rout' as const,
      player: retreatState.retreatingUnit.unit.playerSide,
      unitsToRout: new Set([retreatState.retreatingUnit.unit]),
      numberToDiscard: undefined,
      cardsChosen: false,
      completed: false,
    };

    // Update retreat state with rout state
    const newRetreatState = {
      ...retreatState,
      routState,
    };

    // Update attack apply state
    const newAttackApplyState = {
      ...attackApplyState,
      retreatState: newRetreatState,
    };

    // Update ranged attack resolution state
    const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
      ...rangedAttackState,
      attackApplyState: newAttackApplyState,
    };

    // Update phase state
    const newPhaseState: IssueCommandsPhaseState<TBoard> = {
      ...issueCommandsPhaseState,
      currentCommandResolutionState: newRangedAttackState,
    };

    return {
      ...state,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Find which player's attack apply state has the retreat state
    const firstPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.whiteAttackApplyState
        : meleeState.blackAttackApplyState;
    const secondPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.blackAttackApplyState
        : meleeState.whiteAttackApplyState;

    // Check first player's attack apply state
    if (firstPlayerAttackApply?.retreatState) {
      const retreatState = firstPlayerAttackApply.retreatState;

      // Create rout state for the retreating unit
      const routState = {
        substepType: 'rout' as const,
        player: retreatState.retreatingUnit.unit.playerSide,
        unitsToRout: new Set([retreatState.retreatingUnit.unit]),
        numberToDiscard: undefined,
        cardsChosen: false,
        completed: false,
      };

      // Update retreat state with rout state
      const newRetreatState = {
        ...retreatState,
        routState,
      };

      // Update attack apply state
      const newAttackApplyState = {
        ...firstPlayerAttackApply,
        retreatState: newRetreatState,
      };

      // Update melee resolution state
      const newMeleeState: MeleeResolutionState<TBoard> = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };

      // Update phase state
      const newPhaseState: ResolveMeleePhaseState<TBoard> = {
        ...resolveMeleePhaseState,
        currentMeleeResolutionState: newMeleeState,
      };

      return {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: newPhaseState,
        },
      };
    }

    // Check second player's attack apply state
    if (secondPlayerAttackApply?.retreatState) {
      const retreatState = secondPlayerAttackApply.retreatState;

      // Create rout state for the retreating unit
      const routState = {
        substepType: 'rout' as const,
        player: retreatState.retreatingUnit.unit.playerSide,
        unitsToRout: new Set([retreatState.retreatingUnit.unit]),
        numberToDiscard: undefined,
        cardsChosen: false,
        completed: false,
      };

      // Update retreat state with rout state
      const newRetreatState = {
        ...retreatState,
        routState,
      };

      // Update attack apply state
      const newAttackApplyState = {
        ...secondPlayerAttackApply,
        retreatState: newRetreatState,
      };

      // Update melee resolution state
      const newMeleeState: MeleeResolutionState<TBoard> = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };

      // Update phase state
      const newPhaseState: ResolveMeleePhaseState<TBoard> = {
        ...resolveMeleePhaseState,
        currentMeleeResolutionState: newMeleeState,
      };

      return {
        ...state,
        currentRoundState: {
          ...state.currentRoundState,
          currentPhaseState: newPhaseState,
        },
      };
    }

    throw new Error('No retreat state found for player in melee resolution');
  }

  throw new Error(
    `Trigger rout from retreat not expected in phase: ${phaseState.phase}`,
  );
}
