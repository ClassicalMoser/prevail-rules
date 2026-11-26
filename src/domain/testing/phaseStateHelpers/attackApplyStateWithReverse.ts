import type { AttackResult, UnitInstance } from '@entities';
import type { AttackApplyState } from '@game';
import { createAttackApplyState as attackApplyFromResult } from '@factories';
import { createReverseState } from './reverseState';

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
  // The blow met the Reverse threshold and no other (§7.5.1).
  const measured: AttackResult = {
    unitRetreated: false,
    unitReversed: true,
    unitRouted: false,
  };

  // The factory marks the reverse due and the other two bypassed; the
  // reverse is opened as the opener would write it.
  const apply = attackApplyFromResult(reversingUnit, measured);
  const withReverse: AttackApplyState = {
    ...apply,
    reverseState: createReverseState(reversingUnit),
    ...overrides,
  };

  // The attack-apply, its reverse open.
  return withReverse;
}
