import type { UnitWithPlacement } from '@entities';
import { getFrontEngagementStateFromMovement } from '@queries';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseWhetherToRetreatEvent } from './applyChooseWhetherToRetreatEvent';

import {
  createChooseWhetherToRetreatEvent,
  createEmptyGameState,
} from '@factories';
/**
 * Front engagement during movement: the defender says whether it falls back
 * (§6.3.2). Declining ends the engagement; accepting leaves the retreat for
 * `openRetreatFromEngagement` to open.
 */
describe('applyChooseWhetherToRetreatEvent function', () => {
  function createStateWithFrontEngagement(defender?: UnitWithPlacement) {
    const defendingUnit =
      defender ??
      placed(createTestUnit('white', { attack: 2, speed: 3 }), 'E-5', 'north');
    const state = createEmptyGameState('standard');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defendingUnit),
    };
    const phaseState = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: createMovementResolutionState(withBoard, {
        engagementState: createFrontEngagementState({
          defendingUnitCanRetreat: true,
          defensiveCommitment: { commitmentType: 'declined' },
        }),
        targetPlacement: defendingUnit.placement,
      }),
    });
    return {
      defender: defendingUnit,
      state: updatePhaseState(withBoard, phaseState),
    };
  }

  it('accepting records the choice and leaves the retreat to be opened', () => {
    // §6.3.2: the defender falls back. Where it may go is worked out by the
    // effect that opens the retreat next, so nothing is opened here.
    const { state } = createStateWithFrontEngagement();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(true);
    expect(engagementState.engagementResolutionState.retreatState).toBe(
      'pending',
    );
    expect(engagementState.completed).toBe(false);
  });

  it('declining retreat marks defendingUnitRetreats false and completes engagement', () => {
    const { state } = createStateWithFrontEngagement();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(false);
    expect(engagementState.completed).toBe(true);
    expect(engagementState.engagementResolutionState.retreatState).toBe(
      'pending',
    );
  });

  it('leaves the input engagement slice unchanged after apply', () => {
    const { state } = createStateWithFrontEngagement();
    const engagementBefore =
      getFrontEngagementStateFromMovement(state).engagementResolutionState;
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    applyChooseWhetherToRetreatEvent(event, state);

    expect(
      getFrontEngagementStateFromMovement(state).engagementResolutionState,
    ).toStrictEqual(engagementBefore);
  });

  it('throws when not in issueCommands', () => {
    const state = createEmptyGameState('standard');
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    expect(() =>
      applyChooseWhetherToRetreatEvent(event, stateInPlayCards),
    ).toThrow('Not in issueCommands phase');
  });

  it('throws when current command resolution is not movement', () => {
    const state = createEmptyGameState('standard');
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPhase)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
