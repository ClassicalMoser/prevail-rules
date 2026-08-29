import type { UnitWithPlacement } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import { getFrontEngagementStateFromMovement } from '@queries';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseWhetherToRetreatEvent } from './applyChooseWhetherToRetreatEvent';

/**
 * Front engagement during movement: defender commits whether to attempt retreat.
 * Accepting opens a nested RetreatState with baked legalRetreatOptions.
 */
describe(applyChooseWhetherToRetreatEvent, () => {
  function createStateWithFrontEngagement(defender?: UnitWithPlacement) {
    const defendingUnit: UnitWithPlacement = defender ?? {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: createTestUnit('white', { attack: 2, speed: 3 }),
    };
    const state = createEmptyGameState();
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

  it('accepting retreat opens a nested retreatState and sets defendingUnitRetreats', () => {
    const { state, defender } = createStateWithFrontEngagement();
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);
    const { retreatState } = engagementState.engagementResolutionState;

    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(true);
    expect(retreatState).not.toBe('pending');
    if (retreatState === 'pending') {
      throw new Error('expected retreatState');
    }
    expect(retreatState.retreatingUnit.unit).toStrictEqual(defender.unit);
    expect(retreatState.legalRetreatOptions.length).toBeGreaterThan(0);
  });

  it('declining retreat marks defendingUnitRetreats false and completes engagement', () => {
    const { state } = createStateWithFrontEngagement();
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: false,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

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
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    applyChooseWhetherToRetreatEvent(event, state);

    expect(
      getFrontEngagementStateFromMovement(state).engagementResolutionState,
    ).toStrictEqual(engagementBefore);
  });

  it('throws when not in issueCommands', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(() =>
      applyChooseWhetherToRetreatEvent(event, stateInPlayCards),
    ).toThrow('Not in issueCommands phase');
  });

  it('throws when current command resolution is not movement', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPhase)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
