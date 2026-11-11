import type {
  AttackResult,
  MoveDelta,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import type { AttackApplyState } from '@game';
import { createAttackApplyState as attackApplyFromResult } from '@factories';
import {
  createRetreatState,
  createReverseState,
  createRoutState,
} from './substepStates';

/**
 * Attack-apply states partway through resolution, for specs that need a step
 * already open.
 *
 * The factory decides which outcomes an attack is due to resolve, and these
 * helpers do not second-guess it: each passes what the attack measured and then
 * writes the one substep its name promises. The rest of the slots come from the
 * factory, so a helper here cannot disagree with the rules about what is due.
 *
 * Opening a step is the engine's work, which is why these are fixtures and not
 * factories. A spec that only needs the state an attack leaves behind should
 * call the factory instead.
 */

/** Nothing reached, so the defender stands and no step is due. */
const nothingReached: AttackResult = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: false,
};

/**
 * An attack that reached none of the three thresholds.
 *
 * @param defendingUnit - The unit that was attacked and left where it stood
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with every outcome bypassed
 */
export function createAttackApplyStateWithNothingDue(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  const apply = attackApplyFromResult(defendingUnit, nothingReached);
  const unhit: AttackApplyState = { ...apply, ...overrides };
  return unhit;
}

/**
 * An attack that reached the retreat threshold, with the retreat open.
 *
 * @param retreatingUnit - The defender and where it stands before retreating
 * @param legalRetreatPaths - The paths the engine offers it (see `legalRetreatsOf`)
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with its retreat written
 */
export function createAttackApplyStateWithRetreat(
  retreatingUnit: UnitWithPlacement,
  legalRetreatPaths: MoveDelta[][],
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  const measured: AttackResult = {
    unitRetreated: true,
    unitReversed: false,
    unitRouted: false,
  };
  const apply = attackApplyFromResult(retreatingUnit.unit, measured);
  const withRetreat: AttackApplyState = {
    ...apply,
    retreatState: createRetreatState(retreatingUnit, legalRetreatPaths),
    ...overrides,
  };
  return withRetreat;
}

/**
 * An attack that reached both the retreat and the reverse threshold, with the
 * retreat open and the reverse still due. A reverse holds the unit's placement,
 * which is not known until the retreat has moved it.
 *
 * @param retreatingUnit - The defender and where it stands before retreating
 * @param legalRetreatPaths - The paths the engine offers it (see `legalRetreatsOf`)
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with its retreat written and its reverse pending
 */
export function createAttackApplyStateWithRetreatAndReverse(
  retreatingUnit: UnitWithPlacement,
  legalRetreatPaths: MoveDelta[][],
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  // Both thresholds were met, and both steps resolve: the retreat first, then
  // the reverse from wherever the retreat left the unit.
  const measured: AttackResult = {
    unitRetreated: true,
    unitReversed: true,
    unitRouted: false,
  };
  const apply = attackApplyFromResult(retreatingUnit.unit, measured);
  const withRetreat: AttackApplyState = {
    ...apply,
    retreatState: createRetreatState(retreatingUnit, legalRetreatPaths),
    ...overrides,
  };
  return withRetreat;
}

/**
 * An attack that reached the reverse threshold and no higher, with the reverse
 * open.
 *
 * @param reversingUnit - The defender that is turning to face away
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with its reverse written
 */
export function createAttackApplyStateWithReverse(
  reversingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  const measured: AttackResult = {
    unitRetreated: false,
    unitReversed: true,
    unitRouted: false,
  };
  const apply = attackApplyFromResult(reversingUnit, measured);
  const withReverse: AttackApplyState = {
    ...apply,
    reverseState: createReverseState(reversingUnit),
    ...overrides,
  };
  return withReverse;
}

/**
 * An attack that reached the rout threshold, with the rout open. The retreat and
 * reverse steps are bypassed however their thresholds fell.
 *
 * @param defendingUnit - The unit being routed
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with its rout written
 */
export function createAttackApplyStateWithRout(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  // A blow that reached only Rout, so the rout is the one result due. A blow
  // that also reached Retreat or Reverse carries those out first (§7.5.2).
  const measured: AttackResult = {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: true,
  };
  const apply = attackApplyFromResult(defendingUnit, measured);
  const withRout: AttackApplyState = {
    ...apply,
    routState: createRoutState(defendingUnit.playerSide, defendingUnit),
    ...overrides,
  };
  return withRout;
}
