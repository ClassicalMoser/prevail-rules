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
 * Front engagement during movement: defender commits whether to attempt retreat.
 * Accepting opens a nested RetreatState with baked legalRetreatOptions.
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

  it('accepting retreat opens a nested retreatState and sets defendingUnitRetreats', () => {
    const { state, defender } = createStateWithFrontEngagement();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      eventNumber: 0,
      player: 'white',
    });

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

  it('accepting a retreat with legal hexes bypasses the nested rout — it will never rout', () => {
    const { state } = createStateWithFrontEngagement();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      eventNumber: 0,
      player: 'white',
    });

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const { retreatState } =
      getFrontEngagementStateFromMovement(newState).engagementResolutionState;
    if (retreatState === 'pending') {
      throw new Error('expected retreatState');
    }
    expect(retreatState.legalRetreatOptions.length).toBeGreaterThan(0);
    expect(retreatState.routState).toBe('bypassed');
  });

  it('declining retreat marks defendingUnitRetreats false and completes engagement', () => {
    const { state } = createStateWithFrontEngagement();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      eventNumber: 0,
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
      eventNumber: 0,
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
      eventNumber: 0,
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
      eventNumber: 0,
      player: 'white',
    });

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPhase)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
