import { createEmptyGameState } from '@factories';
import { createMeleeResolutionState } from './meleeResolutionState';

describe('createMeleeResolutionState function', () => {
  it('given context, returns melee resolution with location and commitments', () => {
    const state = createEmptyGameState('standard');
    const resolution = createMeleeResolutionState(state);
    expect(resolution.substepType).toBe('meleeResolution');
    expect(resolution.location).toBe('E-5');
    expect(resolution.secondPlayerCommitment.commitmentType).toBe('completed');
    expect(resolution.firstPlayerCommitment.commitmentType).toBe('completed');
    expect(resolution.completed).toBe(false);
  });
});
