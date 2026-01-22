import type { Board, GameState } from '@entities';
import type { ResolveRoutEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_ROUT_EFFECT_TYPE } from '@events';

/**
 * Generates a ResolveRoutEvent by calculating the rout penalty
 * for the unit(s) being routed.
 * The penalty is the sum of all units' routPenalty values.
 *
 * @param state - The current game state
 * @returns A complete ResolveRoutEvent with the routed unit and penalty
 * @throws Error if not in a valid state for rout resolution
 */
export function generateResolveRoutEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveRoutEvent<TBoard, 'resolveRout'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Rout can occur during engagement resolution, attack apply, or rally resolution
  let routState;

  if (phaseState.phase === 'issueCommands') {
    // Check if we're in an engagement resolution or attack apply
    if (!phaseState.currentCommandResolutionState) {
      throw new Error('No current command resolution state');
    }

    if (
      phaseState.currentCommandResolutionState.commandResolutionType ===
      'movement'
    ) {
      // Check engagement resolution state
      const movementResolutionState = phaseState.currentCommandResolutionState;
      const engagementState = movementResolutionState.engagementState;

      if (!engagementState?.engagementResolutionState) {
        throw new Error('No engagement resolution state found');
      }

      const resolutionState = engagementState.engagementResolutionState;
      if (resolutionState.engagementType !== 'rear') {
        throw new Error('Engagement type is not rear');
      }

      if (!resolutionState.routState) {
        throw new Error('No rout state found in rear engagement');
      }

      routState = resolutionState.routState;
    } else if (
      phaseState.currentCommandResolutionState.commandResolutionType ===
      'rangedAttack'
    ) {
      // Check attack apply state
      const rangedAttackState = phaseState.currentCommandResolutionState;
      if (!rangedAttackState.attackApplyState) {
        throw new Error('No attack apply state found');
      }

      if (!rangedAttackState.attackApplyState.routState) {
        throw new Error('No rout state found in ranged attack');
      }

      routState = rangedAttackState.attackApplyState.routState;
    } else {
      throw new Error(
        'Current command resolution is not movement or ranged attack',
      );
    }
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
    if (firstPlayerAttackApply?.routState) {
      routState = firstPlayerAttackApply.routState;
    } else if (secondPlayerAttackApply?.routState) {
      routState = secondPlayerAttackApply.routState;
    } else {
      throw new Error('No rout state found in melee resolution');
    }
  } else if (phaseState.phase === 'cleanup') {
    // Check rally resolution state
    const isFirstPlayerStep =
      phaseState.step === 'firstPlayerResolveRally' ||
      phaseState.step === 'firstPlayerChooseRally';

    const rallyState = isFirstPlayerStep
      ? phaseState.firstPlayerRallyResolutionState
      : phaseState.secondPlayerRallyResolutionState;

    if (!rallyState?.routState) {
      throw new Error('No rout state found in rally resolution');
    }

    routState = rallyState.routState;
  } else {
    throw new Error(
      `Rout resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  if (routState.numberToDiscard !== undefined) {
    throw new Error('Rout state already has numberToDiscard');
  }

  // Get all units from the set
  if (routState.unitsToRout.size === 0) {
    throw new Error('No units to rout');
  }

  // Calculate total penalty from all units
  const totalPenalty = Array.from(routState.unitsToRout).reduce(
    (sum, unit) => sum + unit.unitType.routPenalty,
    0,
  );

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_ROUT_EFFECT_TYPE,
    unitInstances: routState.unitsToRout,
    penalty: totalPenalty,
  };
}
