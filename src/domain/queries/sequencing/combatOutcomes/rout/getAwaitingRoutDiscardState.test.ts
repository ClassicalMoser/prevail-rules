import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestUnit,
  createUnitWithPlacement,
  placed,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getAwaitingRoutDiscardState } from './getAwaitingRoutDiscardState';

import { createEmptyGameState } from '@factories';
/**
 * GetAwaitingRoutDiscardState: finds rout slices that need chooseRoutDiscard.
 */
describe('getAwaitingRoutDiscardState function', () => {
  it('returns rear-engagement rout when penalty is set and cards not chosen', () => {
    const defender = createTestUnit('white', { attack: 2 });
    let state = createEmptyGameState('standard');
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, placed(defender, 'E-6', 'north')),
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
    let state = createEmptyGameState('standard');
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

  it('throws when the movement command has no engagement', () => {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createMovementResolutionState(empty),
      }),
    );

    expect(() => getAwaitingRoutDiscardState(state)).toThrow(
      'Movement resolution has no engagement state',
    );
  });
});
