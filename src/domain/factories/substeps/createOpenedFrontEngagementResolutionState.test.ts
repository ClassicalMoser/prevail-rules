import { createOpenedFrontEngagementResolutionState } from './createOpenedFrontEngagementResolutionState';

/**
 * A unit met head-on may commit a card and may be offered a retreat (§6.3.2);
 * when the engagement opens, none of that is decided yet.
 */
describe('createOpenedFrontEngagementResolutionState function', () => {
  it('opens a front engagement with the defender yet to commit, and nothing decided', () => {
    expect(createOpenedFrontEngagementResolutionState()).toStrictEqual({
      retreatPaths: 'pending',
      defendingUnitRetreats: 'pending',
      defensiveCommitment: { commitmentType: 'pending' },
      engagementType: 'front',
      retreatState: 'pending',
    });
  });
});
