import { createOpenedFlankEngagementResolutionState } from './createOpenedFlankEngagementResolutionState';

/**
 * A unit met from the flank is turned to face the engager (§6.3.4); when the
 * engagement opens, it has not been turned yet.
 */
describe('createOpenedFlankEngagementResolutionState function', () => {
  it('opens a flank engagement with the defender not yet turned', () => {
    expect(createOpenedFlankEngagementResolutionState()).toStrictEqual({
      defenderRotated: false,
      engagementType: 'flank',
    });
  });
});
