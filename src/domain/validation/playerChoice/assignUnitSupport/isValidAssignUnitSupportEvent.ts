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
import { findIllegal, throwIfUndefined } from '@utils';

/** Why the assignment at this position was refused, given those before it. */
function refusalReasonAt(
  legal: LegalAssignUnitSupport,
  assignments: readonly UnitSupportAssignment[],
  index: number,
): string {
  // The place the player asked for that the legal options did not offer.
  // `index` is the one `findIllegal` found walking these same assignments,
  // so it always names one of them; the throw only narrows the type.
  const assignment = throwIfUndefined(
    assignments[index],
    `No assignment at position ${index}`,
  );

  // Only the places filled before it count against it: a unit already
  // placed, or a stack already full, is judged as it stood when this one
  // was asked for (§10.4.4).
  const reason = getAssignmentRefusalReason(
    legal,
    assignments.slice(0, index),
    assignment,
  );

  // The rule that place breaks, worded by the legal options' owner.
  return reason;
}

/**
 * Validates an AssignUnitSupportEvent by walking its assignments through the
 * legal options ({@link getLegalUnitSupportAssignments}): each unit's place must
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
  // The stacks the rallying player's hand holds, each with the units that
  // match it; asked only while a rally awaits its support check (§10.4.1).
  const legal = getLegalAssignUnitSupport(state);

  // Only the player who rallied checks their units (§10.4.1). The expected
  // check refuses anyone else first; this keeps the validator whole when it
  // is asked directly.
  if (event.player !== legal.player) {
    const wrongPlayer: ValidationResult = {
      errorReason: `Expected assign unit support from ${legal.player}, got ${event.player}`,
      result: false,
    };
    return wrongPlayer;
  }

  // Each place the player filled must have been open after the places filled
  // before it, and the player may stop only where the options allow
  // (§10.4.4–10.4.5).
  const { assignments } = event;
  const refused = findIllegal(
    assignments,
    (soFar) => getLegalUnitSupportAssignments(legal, soFar),
    isSameUnitSupportAssignment,
  );

  // Every unit was given a place it could take, and no open place could have
  // held one left over: the rest rout (§10.4.6).
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  // A place that was never open: the reason names the rule it breaks.
  if (refused.refusal === 'notEnumerated') {
    const notEnumerated: ValidationResult = {
      errorReason: refusalReasonAt(legal, assignments, refused.index),
      result: false,
    };
    return notEnumerated;
  }

  // The player stopped while an open place could still take an uncovered
  // unit, and that place must be filled (§10.4.5).
  const notMaximal: ValidationResult = {
    errorReason:
      'Support assignment is not maximal: unused slots could still cover uncovered units',
    result: false,
  };
  return notMaximal;
}
