import type { AttackResult, UnitInstance } from '@entities';
import type { AttackApplyState } from '@game';
import { createAttackApplyState as attackApplyFromResult } from '@factories';

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
  // The factory bypasses every step the attack did not reach, which here is
  // all of them.
  const apply = attackApplyFromResult(defendingUnit, nothingReached);
  const unhit: AttackApplyState = { ...apply, ...overrides };

  // The attack-apply, ready to be closed with nothing done.
  return unhit;
}
