import type { ValidationResult } from '@utils';
import type { AssignUnitSupportEvent } from '@events';
import type { GameState } from '@game';
import type { LegalAssignUnitSupport, SupportPlacement } from '@legality';
import {
  describeRefusedSupportPlacement,
  describeSupportPool,
  getLegalAssignUnitSupport,
  getSupportPlacementOffer,
  isSameSupportPlacement,
} from '@legality';
import { areUnitSupportsEqual } from '@queries';
import { findRefusedPart } from '@utils';

/** Why the placement at this position was refused, given those before it. */
function describeRefusedPlacementAt(
  legal: LegalAssignUnitSupport,
  placements: readonly SupportPlacement[],
  index: number,
): string {
  const placement = placements[index];
  if (placement === undefined) {
    throw new Error(`No placement at position ${index}`);
  }
  const reason = describeRefusedSupportPlacement(
    legal,
    placements.slice(0, index),
    placement,
  );
  return reason;
}

/**
 * Validates an AssignUnitSupportEvent by walking its placements through the
 * offers a client is shown (`getSupportPlacementOffer`): each unit must have
 * been offered a place in its pool after the places before it, and the
 * player may stop only when no open place could take an uncovered unit
 * (§10.4.4–10.4.5). The rules live in the offer; this only reads the event
 * and words the refusal.
 */
export function isValidAssignUnitSupportEvent(
  event: AssignUnitSupportEvent,
  state: GameState,
): ValidationResult {
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

  // The event names each pool once, with the units placed in it.
  for (const [index, assignment] of event.assignments.entries()) {
    const listedAgain = event.assignments
      .slice(index + 1)
      .some((later) =>
        areUnitSupportsEqual(later.unitSupport, assignment.unitSupport),
      );
    if (listedAgain) {
      return {
        errorReason: `Unit support ${describeSupportPool(assignment.unitSupport)} appears more than once in assignments`,
        result: false,
      };
    }
  }

  // Each unit named under a pool is one place filled.
  const placements: SupportPlacement[] = event.assignments.flatMap(
    (assignment) =>
      assignment.units.map((unit) => ({
        unit,
        unitSupport: assignment.unitSupport,
      })),
  );
  const offerAfter = (soFar: readonly SupportPlacement[]) =>
    getSupportPlacementOffer(legal, soFar);
  const refused = findRefusedPart(
    placements,
    offerAfter,
    isSameSupportPlacement,
  );
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  if (refused.refusal === 'notOffered') {
    const notOffered: ValidationResult = {
      errorReason: describeRefusedPlacementAt(legal, placements, refused.index),
      result: false,
    };
    return notOffered;
  }

  const notMaximal: ValidationResult = {
    errorReason:
      'Support assignment is not maximal: unused slots could still cover uncovered units',
    result: false,
  };
  return notMaximal;
}
