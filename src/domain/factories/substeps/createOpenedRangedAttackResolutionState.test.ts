import { createTestUnit } from '@testing';
import { createOpenedRangedAttackResolutionState } from './createOpenedRangedAttackResolutionState';

/** A shot as it opens (§4.3.11). */
describe('createOpenedRangedAttackResolutionState function', () => {
  it('owes the shooter’s commitment and has no target, supporter or blow yet', () => {
    const shooter = createTestUnit('white');

    expect(createOpenedRangedAttackResolutionState(shooter)).toStrictEqual({
      attackApplyState: 'pending',
      attackingCommitment: { commitmentType: 'pending' },
      attackingUnit: shooter,
      commandResolutionType: 'rangedAttack',
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      substepType: 'commandResolution',
      supportingUnits: 'pending',
    });
  });
});
