import { createTestUnit } from '@testing';

import { createOpenedRearEngagementResolutionState } from './createOpenedRearEngagementResolutionState';

/**
 * A unit met from the rear routs at once (§6.3.3), so the engagement opens
 * with its rout already open.
 */
describe('createOpenedRearEngagementResolutionState function', () => {
  it('opens a rear engagement with the defender’s rout open', () => {
    const defender = createTestUnit('white', { attack: 2 });

    const rear = createOpenedRearEngagementResolutionState(defender);

    // The rout is the defender's own, and the engagement waits on it.
    expect(rear).toMatchObject({
      completed: false,
      engagementType: 'rear',
      routState: { player: 'white', unitsToRout: [defender] },
    });
  });
});
