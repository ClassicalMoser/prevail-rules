import type { AttackResult, MoveDelta, UnitInstance } from '@entities';
import type { AttackApplyState } from '@game';
import { createAttackApplyState as attackApplyFromResult } from '@factories';
import { createRetreatState } from './retreatState';

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

/**
 * An attack that reached both the retreat and the reverse threshold, with the
 * retreat open and the reverse still due. A reverse holds the unit's placement,
 * which is not known until the retreat has moved it.
 *
 * @param retreatingUnit - The defender falling back
 * @param legalRetreatPaths - The paths the engine offers it (see `legalRetreatsOf`)
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with its retreat written and its reverse pending
 */
export function createAttackApplyStateWithRetreatAndReverse(
  retreatingUnit: UnitInstance,
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

  // The factory marks both due. Only the retreat is opened: the reverse
  // waits on where the retreat leaves the unit (§7.5.4).
  const apply = attackApplyFromResult(retreatingUnit, measured);
  const withRetreat: AttackApplyState = {
    ...apply,
    retreatState: createRetreatState(retreatingUnit, legalRetreatPaths),
    ...overrides,
  };

  // The attack-apply, its retreat open and its reverse still pending.
  return withRetreat;
}
