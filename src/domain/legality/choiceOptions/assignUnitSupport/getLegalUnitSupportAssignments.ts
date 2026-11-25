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
  // A place is one unit in one stack: the same unit in another stack is a
  // different place. The validator matches a submitted place against the
  // offered ones by this, since equal objects are not the same reference.
  const same =
    areUnitSupportsEqual(a.unitSupport, b.unitSupport) &&
    isSameUnitInstance(a.unit, b.unit);

  // Whether the two give the same unit the same place.
  return same;
}

/** How many places under this unit support the assignments so far fill. */
function placesFilled(
  unitSupport: UnitSupport,
  assignedSoFar: readonly UnitSupportAssignment[],
): number {
  // Only places in this stack count against its places; a unit placed in
  // another stack leaves this one's room as it was.
  const filled = assignedSoFar.filter((assignment) =>
    areUnitSupportsEqual(assignment.unitSupport, unitSupport),
  ).length;

  // The places this stack has already given.
  return filled;
}

/** Whether this unit already has its one place (§10.4.4). */
function hasPlace(
  unit: UnitInstance,
  assignedSoFar: readonly UnitSupportAssignment[],
): boolean {
  // A unit takes only one place, in whichever stack (§10.4.4), so any
  // earlier assignment naming it settles it.
  const placed = findUnitIndex(assignedSoFar, unit) !== undefined;

  // Whether the unit is already held in some stack.
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
  // Every place that may be filled next, stack by stack in hand order.
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

  // The places open next, and whether the player may stop and let the rest
  // rout (§10.4.6).
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
      // A stack for any unit at all says only how many it holds.
      const genericLabel = `generic:${unitSupport.count}`;
      return genericLabel;
    }
    case 'trait': {
      // A trait stack names the trait its units must have.
      const traitLabel = `trait:${unitSupport.trait}:${unitSupport.count}`;
      return traitLabel;
    }
    case 'unitType': {
      // A unit-type stack names the one type it holds, by its id.
      const unitTypeLabel = `unitType:${unitSupport.unitTypeId}:${unitSupport.count}`;
      return unitTypeLabel;
    }
    // Every kind of unit support is handled above, and the compiler checks
    // it.
    // TODO(wrong): a value of no kind the rules name is handed back as the
    // "label" itself, not a string, so a refusal would carry an object. Its
    // siblings `unitMatchesSupport` and `isSameUnitSupportKind` throw
    // `Unknown unit support type` here; settle by throwing the same.
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
  // The stack as the player would read it, for every reason below.
  const label = getUnitSupportLabel(assignment.unitSupport);

  // The unit support must be one the hand sums to (§10.4.3): a stack whose
  // kind or number of places the hand does not add up to is not there.
  const held = legal.categories.find((category) =>
    areUnitSupportsEqual(category.unitSupport, assignment.unitSupport),
  );
  if (held === undefined) {
    const notHeld = `Unit support ${label} is not available from hand`;
    return notHeld;
  }

  // A unit takes only one place (§10.4.4).
  if (hasPlace(assignment.unit, assignedSoFar)) {
    const placedTwice = 'Unit is assigned support more than once';
    return placedTwice;
  }

  // A unit support holds no more units than its count.
  if (placesFilled(held.unitSupport, assignedSoFar) >= held.unitSupport.count) {
    const overfilled = `Assignment for ${label} exceeds support count ${held.unitSupport.count}`;
    return overfilled;
  }

  // Otherwise the unit is not one of the player's units on the board that
  // matches this unit support.
  if (!unitMatchesSupport(assignment.unit, held.unitSupport)) {
    const unmatched = `Unit does not match support ${label}`;
    return unmatched;
  }

  // A unit that matches an open stack and has no place yet was left out of
  // the offer only because it is not among the rallying player's units on
  // the board (§10.4.4).
  const offBoard = `Unit is not on the board for ${legal.player}`;
  return offBoard;
}
