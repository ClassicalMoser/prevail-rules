import { findRearEngagementStateFromMovement } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { createEmptyGameState } from '@factories';
import { updatePhaseState } from '../state/updatePhaseState';
import { settleRout } from './settleRout';

/**
 * SettleRout: records a rout and closes the parent it was the last thing
 * holding open.
 */
describe('settleRout function', () => {
  function createStateWithRearRout() {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const unit = createTestUnit('white', { attack: 2 });
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({
        routState: createRoutState('white', unit),
      }),
    });
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );
    return { stateInPhase, unit };
  }

  it('ends a rear engagement when its rout is paid, since the rout is all it was', () => {
    const { stateInPhase, unit } = createStateWithRearRout();
    const paid = createRoutState('white', unit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 2,
    });

    const settled = settleRout(stateInPhase, paid);

    // The rear engagement is done, and so is its slot in the movement.
    const rear = findRearEngagementStateFromMovement(settled);
    expect(rear?.engagementResolutionState.completed).toBe(true);
  });

  it('leaves a rear engagement open while its rout is still owed', () => {
    const { stateInPhase, unit } = createStateWithRearRout();
    const owed = createRoutState('white', unit, { numberToDiscard: 2 });

    const written = settleRout(stateInPhase, owed);

    // The cards are not discarded yet, so the engagement waits.
    const rear = findRearEngagementStateFromMovement(written);
    expect(rear?.engagementResolutionState.completed).toBe(false);
    expect(rear?.engagementResolutionState.routState.numberToDiscard).toBe(2);
  });
});
