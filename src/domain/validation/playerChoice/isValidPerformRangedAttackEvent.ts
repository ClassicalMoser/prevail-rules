import type { ValidationResult } from '@utils';
import type { PerformRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import {
  getLegalRangedAttackers,
  getLegalRangedAttackTargets,
} from '@legality';
import { isFriendlyUnit, isSameUnitWithPlacement } from '@queries';
import { isValidRangedAttackSupporters } from './isValidRangedAttackSupporters';

/**
 * Validates a PerformRangedAttackEvent as an integral commit over atoms:
 * - exactly one attacker ∈ {@link getLegalRangedAttackers}
 * - exactly one defender ∈ {@link getLegalRangedAttackTargets} for that attacker
 * - each supporter ∈ {@link getLegalRangedAttackSupporters} for that
 *   attacker+target (must independently be able to hit the same target)
 * - unique supporters; none is the attacker
 */
export function isValidPerformRangedAttackEvent(
  event: PerformRangedAttackEvent,
  state: GameState,
): ValidationResult {
  try {
    const legal = getLegalRangedAttackers(state);
    if (legal === null) {
      return {
        errorReason:
          'Perform ranged attack is not expected in the current state',
        result: false,
      };
    }

    if (event.player !== legal.player) {
      return {
        errorReason: `Expected perform ranged attack from ${legal.player}, got ${event.player}`,
        result: false,
      };
    }

    if (!isFriendlyUnit(event.unit.unit, event.player)) {
      return {
        errorReason: 'Attacker does not belong to the event player',
        result: false,
      };
    }

    const attacker = legal.attackers.find(
      (candidate) => isSameUnitWithPlacement(candidate, event.unit).result,
    );
    if (attacker === undefined) {
      return {
        errorReason: `Unit is not a legal ranged attacker for ${event.player}`,
        result: false,
      };
    }

    const legalTargets = getLegalRangedAttackTargets(attacker, state);
    const target = legalTargets.find(
      (candidate) =>
        isSameUnitWithPlacement(candidate, event.targetUnit).result,
    );
    if (target === undefined) {
      return {
        errorReason:
          'Target is not a legal ranged-attack defender for the attacker',
        result: false,
      };
    }

    // Each supporter must be able to make this shot itself (§7.3.4).
    const supportersValid = isValidRangedAttackSupporters(
      event.supportingUnits,
      attacker,
      target,
      state,
    );
    if (!supportersValid.result) {
      return supportersValid;
    }

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
