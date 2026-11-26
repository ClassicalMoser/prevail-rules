import { createRearEngagementState } from './rearEngagementState';

/** A defender caught from behind, routed at once with no fight (§6.3.3). */
describe('createRearEngagementState function', () => {
  it('opens White’s rout with the engagement', () => {
    const engagement = createRearEngagementState();

    expect(engagement.engagementResolutionState.engagementType).toBe('rear');
    expect(engagement.engagementResolutionState.routState).toMatchObject({
      completed: false,
      player: 'white',
      substepType: 'rout',
    });
    expect(engagement.completed).toBe(false);
  });
});
