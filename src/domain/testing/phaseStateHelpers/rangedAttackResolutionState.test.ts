import { createEmptyGameState } from '@factories';
import { createRangedAttackResolutionState } from './rangedAttackResolutionState';

describe('createRangedAttackResolutionState function', () => {
  it('given context, returns rangedAttack command resolution with commitments', () => {
    const state = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(state);
    expect(resolution.commandResolutionType).toBe('rangedAttack');
    expect(resolution.substepType).toBe('commandResolution');
    expect(resolution.attackingCommitment.commitmentType).toBe('completed');
    expect(resolution.defendingCommitment.commitmentType).toBe('completed');
    expect(resolution.completed).toBe(false);
  });
});
