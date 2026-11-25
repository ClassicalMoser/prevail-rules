import {
  getEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
  getRearEngagementStateFromMovement,
} from '@queries';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateMovingInto,
  createRearEngagementState,
  createRoutState,
  createTestUnit,
} from '@testing';

import { completeEngagementInMovement } from './completeEngagementInMovement';
import { updateFlankEngagementResolutionState } from './updateFlankEngagementResolutionState';
import { updateFrontEngagementResolutionState } from './updateFrontEngagementResolutionState';
import { updateRearEngagementResolutionState } from './updateRearEngagementResolutionState';

/**
 * An engagement settles in parts: from the front the defender commits, decides
 * whether to retreat and does (§6.3.2); from the flank it is turned (§6.3.4);
 * from the rear it routs (§6.3.3). Each part is written on its own and the
 * rest of the engagement is kept.
 */
describe('the engagement resolution writers', () => {
  it('changes what a front engagement has settled and keeps the rest', () => {
    // A move has walked into an enemy head on.
    const state = createGameStateMovingInto(createFrontEngagementState());

    const front = getFrontEngagementStateFromMovement(
      updateFrontEngagementResolutionState(state, {
        retreatPaths: [['step']],
      }),
    );

    // The defender's ways back are written; its choice and the engagement
    // itself are still open.
    expect(front.engagementResolutionState.retreatPaths).toStrictEqual([
      ['step'],
    ]);
    expect(front.engagementResolutionState.defendingUnitRetreats).toBe(
      'pending',
    );
    expect(front.completed).toBe(false);
  });

  it('throws when the engagement under way is not the kind written', () => {
    // The move came in from the flank, where the defender cannot fall back.
    const flanked = createGameStateMovingInto(createFlankEngagementState());

    expect(() =>
      updateFrontEngagementResolutionState(flanked, {
        retreatPaths: [['step']],
      }),
    ).toThrow('Engagement type is not front');
  });

  it('records that a flanked defender has been turned', () => {
    // A move has walked into an enemy's flank.
    const state = createGameStateMovingInto(createFlankEngagementState());

    const flank = getEngagementStateFromMovement(
      updateFlankEngagementResolutionState(state, { defenderRotated: true }),
    );

    // The defender has been turned to face the engaging unit.
    expect(flank.engagementResolutionState).toMatchObject({
      defenderRotated: true,
      engagementType: 'flank',
    });
  });

  it('records the rout of a defender caught from behind', () => {
    // A move has come up behind white's unit, whose rout is open and its
    // cost not yet worked out.
    const defender = createTestUnit('white');
    const state = createGameStateMovingInto(createRearEngagementState());
    const priced = createRoutState('white', defender, { numberToDiscard: 2 });

    const rear = getRearEngagementStateFromMovement(
      updateRearEngagementResolutionState(state, { routState: priced }),
    );

    // The rout now owes two cards, and the engagement waits for them.
    expect(rear.engagementResolutionState.routState).toBe(priced);
    expect(rear.engagementResolutionState.completed).toBe(false);
  });

  it('refuses to write a rear engagement into a front one', () => {
    const state = createGameStateMovingInto(createFrontEngagementState());

    expect(() => updateRearEngagementResolutionState(state, {})).toThrow(
      'Engagement type is not rear',
    );
  });

  it('marks the engagement under way as finished', () => {
    const state = createGameStateMovingInto(createFrontEngagementState());

    const done = getMovementResolutionState(
      completeEngagementInMovement(state),
    );

    // The engagement is settled, so the move can carry on.
    expect(done.engagementState).toMatchObject({ completed: true });
  });
});
