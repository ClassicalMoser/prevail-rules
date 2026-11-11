import type { AttackResult, UnitInstance } from '@entities';
import type { AttackApplyState } from '@game';

/**
 * The attack-apply substep an attack leaves behind.
 *
 * An attack is compared against three stats on the defender, and those
 * comparisons are independent: a hit hard enough to rout often clears retreat and
 * reverse as well. Every result reached is carried out, in its place in the
 * order (§7.5.2): the unit falls back, then turns about, then routs. A routing
 * unit's retreat matters even though the unit is leaving: in a melee, the enemy
 * it leaves behind is free to turn about (§7.5.5), and a commander with it goes
 * back with it (§9.1.8). Reaching none of the three is a normal outcome, common
 * in melee, and leaves nothing to resolve.
 *
 * Each outcome holds `'pending'` when this attack will resolve that step and
 * `'bypassed'` when it will not. No substep is written here: a step is opened
 * when its turn comes, by which time the unit may have moved. The apply stays
 * open until `completeAttackApply` closes it, including when nothing is due, so
 * the sequencer always has something left to complete.
 *
 * @param defendingUnit - The unit the attack was resolved against
 * @param attackResult - Which of that unit's thresholds the attack met
 * @returns The attack-apply substep with each outcome due or bypassed
 */
export function createAttackApplyState(
  defendingUnit: UnitInstance,
  attackResult: AttackResult,
): AttackApplyState {
  const attackApplyState: AttackApplyState = {
    attackResult,
    // `completeAttackApply` closes the shell, so it opens unfinished even when
    // the attack reached nothing and no step is due.
    completed: false,
    defendingUnit,
    // Each result stands or falls on its own threshold.
    retreatState: attackResult.unitRetreated ? 'pending' : 'bypassed',
    reverseState: attackResult.unitReversed ? 'pending' : 'bypassed',
    routState: attackResult.unitRouted ? 'pending' : 'bypassed',
    substepType: 'attackApply',
  };
  return attackApplyState;
}
