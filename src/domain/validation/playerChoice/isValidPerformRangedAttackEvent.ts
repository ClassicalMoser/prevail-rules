import type { ValidationResult } from '@utils';
import type { PerformRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import {
  getLegalRangedAttackers,
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
} from '@legality';
import { isSameUnitInstance } from '@queries';

function samePlacement(
  a: PerformRangedAttackEvent['unit'],
  b: PerformRangedAttackEvent['unit'],
): boolean {
  return (
    isSameUnitInstance(a.unit, b.unit).result &&
    a.placement.coordinate === b.placement.coordinate &&
    a.placement.facing === b.placement.facing
  );
}

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

    if (event.unit.unit.playerSide !== event.player) {
      return {
        errorReason: 'Attacker does not belong to the event player',
        result: false,
      };
    }

    const attacker = legal.attackers.find((candidate) =>
      samePlacement(candidate, event.unit),
    );
    if (attacker === undefined) {
      return {
        errorReason: `Unit is not a legal ranged attacker for ${event.player}`,
        result: false,
      };
    }

    const legalTargets = getLegalRangedAttackTargets(attacker, state);
    const target = legalTargets.find((candidate) =>
      samePlacement(candidate, event.targetUnit),
    );
    if (target === undefined) {
      return {
        errorReason:
          'Target is not a legal ranged-attack defender for the attacker',
        result: false,
      };
    }

    const legalSupporters = getLegalRangedAttackSupporters(
      attacker,
      target,
      state,
    );
    const seenKeys = new Set<string>();
    for (const supporter of event.supportingUnits) {
      const key = `${supporter.unit.playerSide}:${supporter.unit.unitType.id}:${supporter.unit.instanceNumber}`;
      if (seenKeys.has(key)) {
        return {
          errorReason: 'Duplicate supporting unit',
          result: false,
        };
      }
      seenKeys.add(key);

      if (samePlacement(supporter, event.unit)) {
        return {
          errorReason: 'Attacker cannot also be listed as a supporter',
          result: false,
        };
      }

      const found = legalSupporters.find((candidate) =>
        samePlacement(candidate, supporter),
      );
      if (found === undefined) {
        return {
          errorReason:
            'Supporting unit cannot independently ranged-attack the target',
          result: false,
        };
      }
    }

    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
