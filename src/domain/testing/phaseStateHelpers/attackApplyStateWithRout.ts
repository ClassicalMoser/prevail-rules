import type { AttackResult, UnitInstance } from '@entities';
import type { AttackApplyState } from '@game';
import { createAttackApplyState as attackApplyFromResult } from '@factories';
import { createRoutState } from './routState';

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
  // An attack that reached only Rout, so the rout is the one result due. An attack
  // that also reached Retreat or Reverse carries those out first (§7.5.2).
  const measured: AttackResult = {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: true,
  };

  // The factory marks the rout due; the rout is opened for the unit's owner,
  // who pays its Morale (§9.3.2).
  const apply = attackApplyFromResult(defendingUnit, measured);
  const withRout: AttackApplyState = {
    ...apply,
    routState: createRoutState(defendingUnit.playerSide, defendingUnit),
    ...overrides,
  };

  // The attack-apply, its rout open.
  return withRout;
}
