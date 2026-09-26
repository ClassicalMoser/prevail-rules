import type { UnitInstance, UnitSupport } from '@entities';
import type { ValidationResult } from '@utils';
import type { AssignUnitSupportEvent } from '@events';
import type { GameState } from '@game';
import { getLegalAssignUnitSupport } from '@legality';
import type { LegalSupportCategory } from '@legality';
import {
  getPlayerUnitsOnBoard,
  isSameUnitInstance,
  unitMatchesSupport,
} from '@queries';

function unitKey(unit: {
  playerSide: string;
  unitType: { id: string };
  instanceNumber: number;
}): string {
  return `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
}

function sameUnitSupport(a: UnitSupport, b: UnitSupport): boolean {
  if (a.supportType !== b.supportType || a.count !== b.count) {
    return false;
  }
  switch (a.supportType) {
    case 'generic': {
      return true;
    }
    case 'trait': {
      return b.supportType === 'trait' && a.trait === b.trait;
    }
    case 'unitType': {
      return b.supportType === 'unitType' && a.unitTypeId === b.unitTypeId;
    }
    default: {
      const _exhaustive: never = a;
      return _exhaustive;
    }
  }
}

function unitSupportLabel(unitSupport: UnitSupport): string {
  switch (unitSupport.supportType) {
    case 'generic': {
      return `generic:${unitSupport.count}`;
    }
    case 'trait': {
      return `trait:${unitSupport.trait}:${unitSupport.count}`;
    }
    case 'unitType': {
      return `unitType:${unitSupport.unitTypeId}:${unitSupport.count}`;
    }
    default: {
      const _exhaustive: never = unitSupport;
      return _exhaustive;
    }
  }
}

function findLegalSupportCategory(
  categories: readonly LegalSupportCategory[],
  unitSupport: UnitSupport,
): LegalSupportCategory | undefined {
  return categories.find((entry) =>
    sameUnitSupport(entry.unitSupport, unitSupport),
  );
}

/**
 * Validates an AssignUnitSupportEvent as an integral commit over category atoms:
 * - {@link getLegalAssignUnitSupport} (player + hand grants + eligible units)
 * - per-grant capacity, eligibility, no duplicate grant/unit coverage
 * - **local maximality**: no unused slot may still cover an uncovered unit
 */
export function isValidAssignUnitSupportEvent(
  event: AssignUnitSupportEvent,
  state: GameState,
): ValidationResult {
  try {
    const legal = getLegalAssignUnitSupport(state);
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

    const seenLabels = new Set<string>();
    const coveredUnits: UnitInstance[] = [];
    const assignedCountByLabel = new Map<string, number>();

    for (const assignment of event.assignments) {
      const label = unitSupportLabel(assignment.unitSupport);
      if (seenLabels.has(label)) {
        return {
          errorReason: `Unit support ${label} appears more than once in assignments`,
          result: false,
        };
      }
      seenLabels.add(label);

      const entry = findLegalSupportCategory(
        legal.categories,
        assignment.unitSupport,
      );
      if (entry === undefined) {
        return {
          errorReason: `Unit support ${label} is not available from hand`,
          result: false,
        };
      }

      if (assignment.units.length > entry.unitSupport.count) {
        return {
          errorReason: `Assignment for ${label} exceeds support count ${entry.unitSupport.count}`,
          result: false,
        };
      }

      const uniqueInAssignment = new Set(assignment.units.map(unitKey));
      if (uniqueInAssignment.size !== assignment.units.length) {
        return {
          errorReason: 'Duplicate units within a single support assignment',
          result: false,
        };
      }

      for (const unit of assignment.units) {
        if (!unitMatchesSupport(unit, entry.unitSupport)) {
          return {
            errorReason: `Unit does not match support ${label}`,
            result: false,
          };
        }

        const eligible = entry.eligibleUnits.some(
          (candidate) => isSameUnitInstance(candidate, unit).result,
        );
        if (!eligible) {
          return {
            errorReason: `Unit is not on the board for ${event.player}`,
            result: false,
          };
        }

        if (coveredUnits.some((c) => isSameUnitInstance(c, unit).result)) {
          return {
            errorReason: 'Unit is assigned support more than once',
            result: false,
          };
        }
        coveredUnits.push(unit);
      }

      assignedCountByLabel.set(label, assignment.units.length);
    }

    const boardUnits = [...getPlayerUnitsOnBoard(state, event.player)];
    const uncovered = boardUnits.filter(
      (unit) => !coveredUnits.some((c) => isSameUnitInstance(c, unit).result),
    );

    for (const entry of legal.categories) {
      const label = unitSupportLabel(entry.unitSupport);
      const used = assignedCountByLabel.get(label) ?? 0;
      const remaining = entry.unitSupport.count - used;
      if (remaining <= 0) {
        continue;
      }
      const canCoverUncovered = uncovered.some((unit) =>
        unitMatchesSupport(unit, entry.unitSupport),
      );
      if (canCoverUncovered) {
        return {
          errorReason:
            'Support assignment is not maximal: unused slots could still cover uncovered units',
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
