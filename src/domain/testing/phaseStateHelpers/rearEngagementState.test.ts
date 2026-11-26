import { createRearEngagementState } from './rearEngagementState';

describe('createRearEngagementState function', () => {
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
    expect(state.engagementResolutionState.completed).toBe(false);
    expect(state.completed).toBe(false);
  });
});
