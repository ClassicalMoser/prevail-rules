import { createOpenedEngagementState } from './createOpenedEngagementState';
import { createOpenedFlankEngagementResolutionState } from './createOpenedFlankEngagementResolutionState';

/**
 * A unit that moves into an enemy opens an engagement (§6.3): which unit
 * engaged and where it moved to are the movement's; the engagement holds how
 * it resolves.
 */
describe('createOpenedEngagementState function', () => {
  it('wraps a resolution, unfinished', () => {
    const resolution = createOpenedFlankEngagementResolutionState();

    expect(createOpenedEngagementState(resolution)).toStrictEqual({
      completed: false,
      engagementResolutionState: resolution,
      substepType: 'engagementResolution',
    });
  });
});
