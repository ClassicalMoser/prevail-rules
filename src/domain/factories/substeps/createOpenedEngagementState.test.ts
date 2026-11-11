import { createTestUnit } from '@testing';
import { createUnitPlacement } from '../unitLocation/createUnitPlacement';

import { createOpenedEngagementState } from './createOpenedEngagementState';
import { createOpenedFlankEngagementResolutionState } from './createOpenedFlankEngagementResolutionState';

/**
 * A unit that moves into an enemy opens an engagement (§6.3): which unit
 * engaged, where it moved to, and how the engagement resolves.
 */
describe('createOpenedEngagementState function', () => {
  it('wraps a resolution with the engaging unit and where it moved to, unfinished', () => {
    const engaging = createTestUnit('black', { attack: 3 });
    const target = createUnitPlacement('E-5', 'north');
    const resolution = createOpenedFlankEngagementResolutionState();

    expect(
      createOpenedEngagementState(resolution, engaging, target),
    ).toStrictEqual({
      completed: false,
      engagementResolutionState: resolution,
      engagingUnit: engaging,
      substepType: 'engagementResolution',
      targetPlacement: target,
    });
  });
});
