import type { ValidationResult } from '@utils';
import type { AssignUnitSupportEvent, UnitSupportAssignment } from '@events';
import type { GameState } from '@game';
import type { LegalAssignUnitSupport } from '@legality';
import {
  getAssignmentRefusalReason,
  getLegalAssignUnitSupport,
  getLegalUnitSupportAssignments,
  isSameUnitSupportAssignment,
} from '@legality';
import { findIllegal } from '@utils';

/** Why the assignment at this position was refused, given those before it. */
function refusalReasonAt(
  legal: LegalAssignUnitSupport,
  assignments: readonly UnitSupportAssignment[],
  index: number,
): string {
  const assignment = assignments[index];
  if (assignment === undefined) {
    throw new Error(`No assignment at position ${index}`);
  }
  const reason = getAssignmentRefusalReason(
    legal,
    assignments.slice(0, index),
    assignment,
  );
  return reason;
}

/**
 * Validates an AssignUnitSupportEvent by walking its assignments through the
 * legal options (`getLegalUnitSupportAssignments`): each unit's place must
 * have been enumerated after the assignments before it, and the player may
 * stop only when no open place could take an uncovered unit
 * (§10.4.4–10.4.5). The rules live in the legal options; this only reads the
 * event and words the refusal. The legal options do not depend on the order
 * of the assignments, so neither does this.
 */
export function isValidAssignUnitSupportEvent(
  event: AssignUnitSupportEvent,
  state: GameState,
): ValidationResult {
  const legal = getLegalAssignUnitSupport(state);

  if (event.player !== legal.player) {
    return {
      errorReason: `Expected assign unit support from ${legal.player}, got ${event.player}`,
      result: false,
    };
  }

  const { assignments } = event;
  const refused = findIllegal(
    assignments,
    (soFar) => getLegalUnitSupportAssignments(legal, soFar),
    isSameUnitSupportAssignment,
  );
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  if (refused.refusal === 'notEnumerated') {
    const notEnumerated: ValidationResult = {
      errorReason: refusalReasonAt(legal, assignments, refused.index),
      result: false,
    };
    return notEnumerated;
  }

  const notMaximal: ValidationResult = {
    errorReason:
      'Support assignment is not maximal: unused slots could still cover uncovered units',
    result: false,
  };
  return notMaximal;
}
