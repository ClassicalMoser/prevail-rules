import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getAwaitingRoutDiscardState } from './getAwaitingRoutDiscardState';

/**
 * GetAwaitingRoutDiscardState: finds rout slices that need chooseRoutDiscard.
 */
describe(getAwaitingRoutDiscardState, () => {
  it('returns rear-engagement rout when penalty is set and cards not chosen', () => {
    const defender = createTestUnit('white', { attack: 2 });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state.cardState.black.inPlay = createTestCard();
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, {
        placement: { coordinate: 'E-6', facing: 'north' },
        unit: defender,
      }),
    );
    const routState = createRoutState('white', defender, {
      numberToDiscard: 2,
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: createRearEngagementState({ routState }),
          movingUnit: createUnitWithPlacement({
            coordinate: 'E-6',
            facing: 'north',
            playerSide: 'black',
          }),
          targetPlacement: { coordinate: 'E-6', facing: 'north' },
        }),
      }),
    );

    expect(getAwaitingRoutDiscardState(state)).toStrictEqual(routState);
  });

  it('returns null when rear rout penalty is still pending', () => {
    const defender = createTestUnit('white', { attack: 2 });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state.cardState.black.inPlay = createTestCard();
    const routState = createRoutState('white', defender, {
      numberToDiscard: 'pending',
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: createRearEngagementState({ routState }),
        }),
      }),
    );

    expect(getAwaitingRoutDiscardState(state)).toBeNull();
  });
});
