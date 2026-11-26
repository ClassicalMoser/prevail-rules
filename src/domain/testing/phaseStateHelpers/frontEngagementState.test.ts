import { createFrontEngagementState } from './frontEngagementState';

/** A defender met head on, its chance to fall back not yet offered (§6.3.2). */
describe('createFrontEngagementState function', () => {
  it('opens a front engagement with the defender’s commitment still to come', () => {
    const engagement = createFrontEngagementState();

    expect(engagement.substepType).toBe('engagementResolution');
    expect(engagement.engagementResolutionState.engagementType).toBe('front');
    expect(
      engagement.engagementResolutionState.defensiveCommitment.commitmentType,
    ).toBe('pending');
    expect(engagement.completed).toBe(false);
  });

  it('records the defender’s choice a spec makes for it', () => {
    const engagement = createFrontEngagementState({
      defendingUnitRetreats: true,
    });

    expect(engagement.engagementResolutionState.defendingUnitRetreats).toBe(
      true,
    );
  });
});
