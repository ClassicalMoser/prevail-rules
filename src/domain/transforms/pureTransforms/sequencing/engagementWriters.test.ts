import type { EngagementState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  getEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
} from '@queries';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { completeEngagementInMovement } from './completeEngagementInMovement';
import { updateFlankEngagementResolutionState } from './updateFlankEngagementResolutionState';
import { updateFrontEngagementResolutionState } from './updateFrontEngagementResolutionState';
import { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';

/** A movement under way with this engagement. */
function engagedWith(engagementState: EngagementState) {
  const empty = createEmptyGameState('standard');
  const state = updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: createMovementResolutionState(empty, {
        engagementState,
      }),
    }),
  );
  return state;
}

/**
 * An engagement settles in parts: from the front the defender commits, decides
 * whether to retreat and does (§6.3.2); from the flank it is turned (§6.3.4);
 * from the rear it routs (§6.3.3). Each part is written on its own and the
 * rest of the engagement is kept.
 */
describe('the engagement resolution writers', () => {
  it('changes what a front engagement has settled and keeps the rest', () => {
    const state = engagedWith(createFrontEngagementState());

    const front = getFrontEngagementStateFromMovement(
      updateFrontEngagementResolutionState(state, {
        defendingUnitCanRetreat: true,
      }),
    );

    expect(front.engagementResolutionState.defendingUnitCanRetreat).toBe(true);
    expect(front.engagementResolutionState.defendingUnitRetreats).toBe(
      'pending',
    );
    expect(front.completed).toBe(false);
  });

  it('throws when the engagement under way is not the kind written', () => {
    const flanked = engagedWith(createFlankEngagementState());

    expect(() =>
      updateFrontEngagementResolutionState(flanked, {
        defendingUnitCanRetreat: true,
      }),
    ).toThrow('Engagement type is not front');
  });

  it('records that a flanked defender has been turned', () => {
    const state = engagedWith(createFlankEngagementState());

    const flank = getEngagementStateFromMovement(
      updateFlankEngagementResolutionState(state, { defenderRotated: true }),
    );

    expect(flank.engagementResolutionState).toMatchObject({
      defenderRotated: true,
      engagementType: 'flank',
    });
  });

  it('refuses to write a rear engagement into a front one', () => {
    const state = engagedWith(createFrontEngagementState());

    expect(() => updateRearEngagementResolutionState(state, {})).toThrow(
      'Engagement type is not rear',
    );
  });

  it('marks the engagement under way as finished', () => {
    const state = engagedWith(createFrontEngagementState());

    const done = getMovementResolutionState(
      completeEngagementInMovement(state),
    );

    expect(done.engagementState).toMatchObject({ completed: true });
  });
});
