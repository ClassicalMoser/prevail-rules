import type { Board, GameState, ReverseState } from '@entities';
import type { ResolveReverseEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_REVERSE_EFFECT_TYPE } from '@events';
import { getOppositeFacing } from '@queries';

/**
 * Generates a ResolveReverseEvent by calculating the new facing
 * (opposite of current facing) for a unit that is being reversed.
 *
 * @param state - The current game state
 * @returns A complete ResolveReverseEvent with the reversed unit placement
 * @throws Error if not in a valid state for reverse resolution
 */
export function generateResolveReverseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveReverseEvent<TBoard, 'resolveReverse'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Reverse can occur during ranged attack resolution or melee resolution
  let reverseState: ReverseState<TBoard> | undefined;

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

    if (!rangedAttackState.attackApplyState.reverseState) {
      throw new Error('No reverse state found');
    }

    reverseState = rangedAttackState.attackApplyState.reverseState;
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
    if (
      firstPlayerAttackApply?.reverseState &&
      firstPlayerAttackApply.reverseState.finalPosition === undefined
    ) {
      reverseState = firstPlayerAttackApply.reverseState;
    } else if (
      secondPlayerAttackApply?.reverseState &&
      secondPlayerAttackApply.reverseState.finalPosition === undefined
    ) {
      reverseState = secondPlayerAttackApply.reverseState;
    } else {
      throw new Error('No reverse state found in melee resolution');
    }
  } else {
    throw new Error(
      `Reverse resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  if (reverseState.finalPosition !== undefined) {
    throw new Error('Reverse state already has final position');
  }

  // Calculate the new facing (opposite of current)
  const currentFacing = reverseState.reversingUnit.placement.facing;
  const newFacing = getOppositeFacing(currentFacing);

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_REVERSE_EFFECT_TYPE,
    unitInstance: reverseState.reversingUnit,
    newUnitPlacement: {
      unit: reverseState.reversingUnit.unit,
      placement: {
        coordinate: reverseState.reversingUnit.placement.coordinate,
        facing: newFacing,
      },
    },
  };
}
