import type { UnitInstance, UnitSupport } from '@entities';
import type { UnitSupportAssignment } from '@events';
import type { OpenChoice } from '@utils';
import type { LegalAssignUnitSupport } from './getLegalAssignUnitSupport';
import {
  areUnitSupportsEqual,
  findUnitIndex,
  isSameUnitInstance,
  unitMatchesSupport,
} from '@queries';

/**
 * Whether two assignments give the same unit a place under the same unit
 * support.
 *
 * @param a - One assignment
 * @param b - The other
 * @returns True when the unit and the unit support are the same
 */
export function isSameUnitSupportAssignment(
  a: UnitSupportAssignment,
  b: UnitSupportAssignment,
): boolean {
  const same =
    areUnitSupportsEqual(a.unitSupport, b.unitSupport) &&
    isSameUnitInstance(a.unit, b.unit).result;
  return same;
}

/** How many places under this unit support the assignments so far fill. */
function placesFilled(
  unitSupport: UnitSupport,
  assignedSoFar: readonly UnitSupportAssignment[],
): number {
  const filled = assignedSoFar.filter((assignment) =>
    areUnitSupportsEqual(assignment.unitSupport, unitSupport),
  ).length;
  return filled;
}

/** Whether this unit already has its one place (§10.4.4). */
function hasPlace(
  unit: UnitInstance,
  assignedSoFar: readonly UnitSupportAssignment[],
): boolean {
  const placed = findUnitIndex(assignedSoFar, unit) !== undefined;
  return placed;
}

/**
 * The places a player may still fill after a rally, given the units assigned
 * so far, and whether they may stop assigning (§10.4.4–10.4.5).
 *
 * A unit takes only one place, and only under a unit support it matches;
 * each unit support holds no more units than its count. Any open place that
 * an uncovered unit could fill must be filled (§10.4.5), so the player may
 * stop exactly when nothing more can be assigned. They are not required to
 * find the arrangement that saves the most units: which unit goes where is
 * theirs to choose, and a poor choice is allowed to cost them.
 *
 * The order of the assignments so far does not matter; only which have been
 * made.
 *
 * @param legal - The unit support the rallying player's hand sums to, each
 * with the units on the board that match it
 * @param assignedSoFar - The assignments made so far, in any order
 * @returns Each assignment that may be made next, and whether assigning may
 * stop
 */
export function getLegalUnitSupportAssignments(
  legal: LegalAssignUnitSupport,
  assignedSoFar: readonly UnitSupportAssignment[],
): OpenChoice<UnitSupportAssignment> {
  const next: UnitSupportAssignment[] = [];
  for (const { eligibleUnits, unitSupport } of legal.categories) {
    // A unit support whose places are all filled holds nobody more.
    if (placesFilled(unitSupport, assignedSoFar) >= unitSupport.count) {
      continue;
    }
    // Any matching unit still without a place may take one here.
    for (const unit of eligibleUnits) {
      if (!hasPlace(unit, assignedSoFar)) {
        next.push({ unit, unitSupport });
      }
    }
  }

  // Use what you have: assigning ends only when no open place can take an
  // uncovered unit (§10.4.5).
  const choice: OpenChoice<UnitSupportAssignment> = {
    mayStop: next.length === 0,
    next,
  };
  return choice;
}

/**
 * Names a unit support for a player reading a refusal: what it holds and how
 * many.
 *
 * @param unitSupport - The unit support, as the hand sums it
 * @returns A short label such as `trait:formation:4`
 */
export function getUnitSupportLabel(unitSupport: UnitSupport): string {
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

/**
 * Why an assignment was not among those offered after the assignments so
 * far: the rule of §10.4.3–10.4.4 it breaks, in the order a player would
 * check them.
 *
 * @param legal - The unit support the rallying player's hand sums to
 * @param assignedSoFar - The assignments made before this one
 * @param assignment - The assignment that was not offered
 * @returns The reason, for a refusal
 */
export function getAssignmentRefusalReason(
  legal: LegalAssignUnitSupport,
  assignedSoFar: readonly UnitSupportAssignment[],
  assignment: UnitSupportAssignment,
): string {
  const label = getUnitSupportLabel(assignment.unitSupport);

  // The unit support must be one the hand sums to (§10.4.3).
  const held = legal.categories.find((category) =>
    areUnitSupportsEqual(category.unitSupport, assignment.unitSupport),
  );
  if (held === undefined) {
    return `Unit support ${label} is not available from hand`;
  }

  // A unit takes only one place (§10.4.4).
  if (hasPlace(assignment.unit, assignedSoFar)) {
    return 'Unit is assigned support more than once';
  }

  // A unit support holds no more units than its count.
  if (placesFilled(held.unitSupport, assignedSoFar) >= held.unitSupport.count) {
    return `Assignment for ${label} exceeds support count ${held.unitSupport.count}`;
  }

  // Otherwise the unit is not one of the player's units on the board that
  // matches this unit support.
  if (!unitMatchesSupport(assignment.unit, held.unitSupport)) {
    return `Unit does not match support ${label}`;
  }
  return `Unit is not on the board for ${legal.player}`;
}
