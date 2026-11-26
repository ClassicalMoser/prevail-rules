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
 * An attack that reached the retreat threshold, with the retreat open.
 *
 * @param retreatingUnit - The defender falling back
 * @param legalRetreatPaths - The paths the engine offers it (see `legalRetreatsOf`)
 * @param overrides - Fields to replace, for a state the game cannot reach
 * @returns The attack-apply with its retreat written
 */
export function createAttackApplyStateWithRetreat(
  retreatingUnit: UnitInstance,
  legalRetreatPaths: MoveDelta[][],
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  // The blow met the Retreat threshold and no other (§7.5.1).
  const measured: AttackResult = {
    unitRetreated: true,
    unitReversed: false,
    unitRouted: false,
  };

  // The factory marks the retreat due and the other two bypassed.
  const apply = attackApplyFromResult(retreatingUnit, measured);

  // The retreat is opened with the paths the engine offered, as the opener
  // would write it.
  const withRetreat: AttackApplyState = {
    ...apply,
    retreatState: createRetreatState(retreatingUnit, legalRetreatPaths),
    ...overrides,
  };

  // The attack-apply, its retreat open.
  return withRetreat;
}
