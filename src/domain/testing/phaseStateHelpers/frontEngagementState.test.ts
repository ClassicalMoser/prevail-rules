import { createFrontEngagementState } from './frontEngagementState';

/**
 * CreateFrontEngagementState: Creates a front EngagementState with sensible defaults.
 */
describe('createFrontEngagementState function', () => {
  it('given context, returns engagement state with front resolution', () => {
    const state = createFrontEngagementState();
    expect(state.substepType).toBe('engagementResolution');
    expect(state.engagementResolutionState.engagementType).toBe('front');
    expect(
      state.engagementResolutionState.defensiveCommitment.commitmentType,
    ).toBe('pending');
    expect(state.completed).toBe(false);
  });
});
