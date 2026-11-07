import type { UnitInstance } from '@entities';
import type { AttackApplyState, AttackResult } from '@game';

/**
 * The attack-apply substep an attack leaves behind.
 *
 * An attack is compared against three stats on the defender, and those
 * comparisons are independent: a hit hard enough to rout also clears retreat and
 * reverse. What the rules do about it is not. A rout removes the unit, so it
 * supersedes the other two however the thresholds fell. A retreat and a reverse
 * can both apply. Reaching none of the three is a normal outcome, common in
 * melee, and leaves nothing to resolve.
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
  // A routed unit leaves the board, so the lower outcomes cannot happen to it.
  const routed = attackResult.unitRouted;
  const attackApplyState: AttackApplyState = {
    attackResult,
    // `completeAttackApply` closes the shell, so it opens unfinished even when
    // the attack reached nothing and no step is due.
    completed: false,
    defendingUnit,
    // Below a rout, retreat and reverse stand or fall on their own thresholds.
    retreatState:
      !routed && attackResult.unitRetreated ? 'pending' : 'bypassed',
    reverseState: !routed && attackResult.unitReversed ? 'pending' : 'bypassed',
    routState: routed ? 'pending' : 'bypassed',
    substepType: 'attackApply',
  };
  return attackApplyState;
}
