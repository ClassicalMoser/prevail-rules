import { createFlankEngagementState } from './flankEngagementState';

describe('createFlankEngagementState function', () => {
  it('given context, returns engagement state with flank resolution', () => {
    const state = createFlankEngagementState();
    expect(state.engagementResolutionState.engagementType).toBe('flank');
    expect(state.engagementResolutionState.defenderRotated).toBe(false);
    expect(state.completed).toBe(false);
  });
});
