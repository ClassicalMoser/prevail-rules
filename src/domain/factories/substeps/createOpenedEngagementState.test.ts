import { createTestUnit } from '@testing';
import { createUnitPlacement } from '../unitLocation/createUnitPlacement';

import { createOpenedEngagementState } from './createOpenedEngagementState';
import { createOpenedFlankEngagementResolutionState } from './createOpenedFlankEngagementResolutionState';
import { createOpenedFrontEngagementResolutionState } from './createOpenedFrontEngagementResolutionState';
import { createOpenedRearEngagementResolutionState } from './createOpenedRearEngagementResolutionState';

/**
 * A unit that moves into an enemy meets it from the front, the flank or the
 * rear, and each opens differently (§6.3).
 */
describe('opened engagement factories', () => {
  const engaging = createTestUnit('black', { attack: 3 });
  const defender = createTestUnit('white', { attack: 2 });
  const target = createUnitPlacement('E-5', 'north');

  it('opens a front engagement with the defender yet to commit, and nothing decided', () => {
    expect(createOpenedFrontEngagementResolutionState()).toStrictEqual({
      defendingUnitCanRetreat: 'pending',
      defendingUnitRetreats: 'pending',
      defensiveCommitment: { commitmentType: 'pending' },
      engagementType: 'front',
      retreatState: 'pending',
    });
  });

  it('opens a flank engagement with the defender not yet turned', () => {
    expect(createOpenedFlankEngagementResolutionState()).toStrictEqual({
      defenderRotated: false,
      engagementType: 'flank',
    });
  });

  it('opens a rear engagement with the defender’s rout open', () => {
    const rear = createOpenedRearEngagementResolutionState(defender);

    expect(rear).toMatchObject({
      completed: false,
      engagementType: 'rear',
      routState: { player: 'white', unitsToRout: [defender] },
    });
  });

  it('wraps a resolution with the engaging unit and where it moved to, unfinished', () => {
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
