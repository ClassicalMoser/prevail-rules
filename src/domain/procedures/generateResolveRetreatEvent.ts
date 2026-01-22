import type { Board, GameState, RetreatState } from '@entities';
import type { ResolveRetreatEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RETREAT_EFFECT_TYPE } from '@events';

/**
 * Generates a ResolveRetreatEvent by reading the finalPosition from the retreat state.
 * The finalPosition is already determined (either auto-selected if single option,
 * or chosen by player via chooseRetreatOption if multiple options).
 *
 * This is a **convergence event** that performs the actual unit movement on the board.
 *
 * @param state - The current game state
 * @returns A complete ResolveRetreatEvent with the retreating unit and final position
 * @throws Error if not in a valid state for retreat resolution or finalPosition not set
 */
export function generateResolveRetreatEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveRetreatEvent<TBoard, 'resolveRetreat'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Retreat can occur during ranged attack resolution or melee resolution
  let retreatState: RetreatState<TBoard> | undefined;

  if (phaseState.phase === 'issueCommands') {
    // Check if we're in a ranged attack resolution
    if (!phaseState.currentCommandResolutionState) {
      throw new Error('No current command resolution state');
    }

    if (
      phaseState.currentCommandResolutionState.commandResolutionType !==
      'rangedAttack'
    ) {
      throw new Error('Current command resolution is not a ranged attack');
    }

    const rangedAttackState = phaseState.currentCommandResolutionState;
    if (!rangedAttackState.attackApplyState) {
      throw new Error('No attack apply state found');
    }

    if (!rangedAttackState.attackApplyState.retreatState) {
      throw new Error('No retreat state found in ranged attack');
    }

    retreatState = rangedAttackState.attackApplyState.retreatState;
  } else if (phaseState.phase === 'resolveMelee') {
    // Check if we're in a melee resolution
    if (!phaseState.currentMeleeResolutionState) {
      throw new Error('No current melee resolution state');
    }

    const meleeState = phaseState.currentMeleeResolutionState;
    const firstPlayer = state.currentInitiative;

    // Get both players' attack apply states
    const firstPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.whiteAttackApplyState
        : meleeState.blackAttackApplyState;
    const secondPlayerAttackApply =
      firstPlayer === 'white'
        ? meleeState.blackAttackApplyState
        : meleeState.whiteAttackApplyState;

    // Priority: first player (initiative) resolves first
    // Find the retreat state that has finalPosition set and is not completed
    if (
      firstPlayerAttackApply?.retreatState &&
      firstPlayerAttackApply.retreatState.finalPosition !== undefined &&
      !firstPlayerAttackApply.retreatState.completed
    ) {
      retreatState = firstPlayerAttackApply.retreatState;
    } else if (
      secondPlayerAttackApply?.retreatState &&
      secondPlayerAttackApply.retreatState.finalPosition !== undefined &&
      !secondPlayerAttackApply.retreatState.completed
    ) {
      retreatState = secondPlayerAttackApply.retreatState;
    } else {
      throw new Error(
        'No retreat state with finalPosition found in melee resolution',
      );
    }
  } else {
    throw new Error(
      `Retreat resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  // Final validation (redundant but defensive)
  if (retreatState.finalPosition === undefined) {
    throw new Error('Retreat state finalPosition is not set');
  }

  if (retreatState.completed) {
    throw new Error('Retreat state is already completed');
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_RETREAT_EFFECT_TYPE,
    startingPosition: retreatState.retreatingUnit,
    finalPosition: {
      unit: retreatState.retreatingUnit.unit,
      placement: retreatState.finalPosition,
    },
  };
}
