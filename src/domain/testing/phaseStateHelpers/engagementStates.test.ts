import {
  createFlankEngagementState,
  createFrontEngagementState,
  createRearEngagementState,
} from './engagementStates';

/**
 * CreateFrontEngagementState: Creates a front EngagementState with sensible defaults.
 */
describe(createFrontEngagementState, () => {
  it('given context, returns engagement state with front resolution', () => {
    const state = createFrontEngagementState();
    expect(state.substepType).toBe('engagementResolution');
    expect(state.engagementResolutionState.engagementType).toBe('front');
    expect(
      state.engagementResolutionState.defensiveCommitment.commitmentType,
    ).toBe('pending');
    expect(state.completed).toBeFalsy();
  });
});

describe(createFlankEngagementState, () => {
  it('given context, returns engagement state with flank resolution', () => {
    const state = createFlankEngagementState();
    expect(state.engagementResolutionState.engagementType).toBe('flank');
    expect(state.engagementResolutionState.defenderRotated).toBeFalsy();
    expect(state.completed).toBeFalsy();
  });
});

describe(createRearEngagementState, () => {
  it('given context, returns engagement state with rear resolution and rout state', () => {
    const state = createRearEngagementState();
    expect(state.engagementResolutionState.engagementType).toBe('rear');
    expect(state.engagementResolutionState.routState).toStrictEqual(
      expect.objectContaining({
        completed: false,
        player: 'white',
        substepType: 'rout',
      }),
    );
    expect(state.engagementResolutionState.completed).toBeFalsy();
    expect(state.completed).toBeFalsy();
  });
});
