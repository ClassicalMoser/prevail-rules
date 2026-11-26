import type { UnitInstance } from '@entities';
import type { RangedAttackResolutionState } from '@game';

/**
 * A shot the moment its shooter is named (§4.3.11): the shooter's owner may
 * commit a card first, and a Range card reaches further when the target is
 * chosen (step 2), so the commitment is owed and nothing is aimed yet.
 *
 * @param attackingUnit - The unit that shoots, as the board holds it
 * @returns The ranged attack resolution substep, open and unaimed
 */
export function createOpenedRangedAttackResolutionState(
  attackingUnit: UnitInstance,
): RangedAttackResolutionState {
  const shot: RangedAttackResolutionState = {
    // The blow is measured only once the target has committed or declined.
    attackApplyState: 'pending',
    attackingCommitment: { commitmentType: 'pending' },
    attackingUnit,
    commandResolutionType: 'rangedAttack',
    // The target answers with its own commitment once it is named (step 5).
    defendingCommitment: { commitmentType: 'pending' },
    defendingUnit: 'pending',
    substepType: 'commandResolution',
    // Supporters are named with the target (step 4).
    supportingUnits: 'pending',
  };

  // The shot, waiting on the shooter's commitment.
  return shot;
}
