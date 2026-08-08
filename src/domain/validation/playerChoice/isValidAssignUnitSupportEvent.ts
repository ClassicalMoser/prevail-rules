import type { ValidationResult } from '@utils';
import type { AssignUnitSupportEvent } from '@events';
import type { GameState } from '@game';
import { getLegalUnitSupportGrants } from '@legality';
import { isSameUnitInstance, unitMatchesSupport } from '@queries';

function unitKey(unit: {
  playerSide: string;
  unitType: { id: string };
  instanceNumber: number;
}): string {
  return `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
}

/**
 * Validates an AssignUnitSupportEvent as an integral commit over grant atoms:
 * - {@link getLegalUnitSupportGrants} (player + hand grants + eligible units)
 * - per-card capacity, eligibility, no duplicate card/unit coverage
 */
export function isValidAssignUnitSupportEvent(
  event: AssignUnitSupportEvent,
  state: GameState,
): ValidationResult {
  try {
    const legal = getLegalUnitSupportGrants(state);
    if (legal === null) {
      return {
        errorReason: 'Assign unit support is not expected in the current state',
        result: false,
      };
    }

    if (event.player !== legal.player) {
      return {
        errorReason: `Expected assign unit support from ${legal.player}, got ${event.player}`,
        result: false,
      };
    }

    const seenCardIds = new Set<string>();
    const coveredUnitKeys = new Set<string>();

    for (const assignment of event.assignments) {
      if (seenCardIds.has(assignment.cardId)) {
        return {
          errorReason: `Card ${assignment.cardId} appears more than once in assignments`,
          result: false,
        };
      }
      seenCardIds.add(assignment.cardId);

      const grant = legal.grants.find((g) => g.card.id === assignment.cardId);
      if (grant === undefined) {
        return {
          errorReason: `Card ${assignment.cardId} is not a legal support grant in hand`,
          result: false,
        };
      }

      if (assignment.units.length > grant.unitSupport.count) {
        return {
          errorReason: `Assignment for ${assignment.cardId} exceeds support count ${grant.unitSupport.count}`,
          result: false,
        };
      }

      const uniqueInAssignment = new Set(assignment.units.map(unitKey));
      if (uniqueInAssignment.size !== assignment.units.length) {
        return {
          errorReason: 'Duplicate units within a single card assignment',
          result: false,
        };
      }

      for (const unit of assignment.units) {
        if (!unitMatchesSupport(unit, grant.unitSupport)) {
          return {
            errorReason: `Unit does not match support on card ${assignment.cardId}`,
            result: false,
          };
        }

        const eligible = grant.eligibleUnits.some(
          (candidate) => isSameUnitInstance(candidate, unit).result,
        );
        if (!eligible) {
          return {
            errorReason: `Unit is not on the board for ${event.player}`,
            result: false,
          };
        }

        const key = unitKey(unit);
        if (coveredUnitKeys.has(key)) {
          return {
            errorReason: 'Unit is assigned support more than once',
            result: false,
          };
        }
        coveredUnitKeys.add(key);
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
