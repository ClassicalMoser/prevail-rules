import { createEmptyGameState } from '@factories';

import { createRangedAttackResolutionState } from './rangedAttackResolutionState';

/** A shot from Black at White, both commitments made and the shot not yet landed. */
describe('createRangedAttackResolutionState function', () => {
  it('has Black shooting at White alone, before the shot lands', () => {
    const resolution = createRangedAttackResolutionState(
      createEmptyGameState('standard'),
    );

    expect(resolution.commandResolutionType).toBe('rangedAttack');
    expect(resolution.attackingUnit).toMatchObject({ playerSide: 'black' });
    expect(resolution.defendingUnit).toMatchObject({ playerSide: 'white' });
    expect(resolution.supportingUnits).toStrictEqual([]);
    expect(resolution.attackApplyState).toBe('pending');
    expect(resolution.attackingCommitment.commitmentType).toBe('completed');
    expect(resolution.defendingCommitment.commitmentType).toBe('completed');
  });
});
