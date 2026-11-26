import { createFlankEngagementState } from './flankEngagementState';

/** A defender struck in the flank, not yet turned to face its attacker (§6.3.4). */
describe('createFlankEngagementState function', () => {
  it('opens a flank engagement with the defender not yet turned', () => {
    const engagement = createFlankEngagementState();

    expect(engagement.engagementResolutionState.engagementType).toBe('flank');
    expect(engagement.engagementResolutionState.defenderRotated).toBe(false);
    expect(engagement.completed).toBe(false);
  });
});
