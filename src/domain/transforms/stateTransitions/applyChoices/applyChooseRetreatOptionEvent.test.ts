import {
  getFrontEngagementRetreatState,
  getMeleeRetreatState,
  getRangedAttackRetreatState,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseRetreatOptionEvent } from './applyChooseRetreatOptionEvent';

import {
  createChooseRetreatOptionEvent,
  createEmptyGameState,
} from '@factories';
/**
 * After `resolveRetreat` lists legal cells, the defender picks one: this choice writes
 * `finalPosition` on the active retreat substep (ranged attack-apply or the correct melee side).
 */
describe('applyChooseRetreatOptionEvent function', () => {
  const chosenPosition = {
    coordinate: 'E-4' as const,
    facing: 'north' as const,
  };

  /** IssueCommands + ranged CRS + retreat substep on white at E-5 (no finalPosition yet). */
  function createStateWithRangedAttackRetreat() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const attackApply = createAttackApplyStateWithRetreat(placement);
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: createRangedAttackResolutionState(
        stateWithUnit,
        {
          attackApplyState: attackApply,
        },
      ),
    });
    return updatePhaseState(stateWithUnit, phaseState);
  }

  it('given ranged retreat flow, white chooses E-4 north, retreat substep finalPosition matches', () => {
    const state = createStateWithRangedAttackRetreat();
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      retreatOption: chosenPosition,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRangedAttackRetreatState(newState);

    expect(retreatState.finalPosition).toStrictEqual(chosenPosition);
  });

  /** ResolveMelee + one-sided retreat apply: both players engaged on E-5 (north vs south). */
  function createStateWithMeleeRetreat(retreatingPlayer: 'white' | 'black') {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      {
        attack: 2,
      },
    );
    const retreatingPlacement = placed(retreatingUnit, 'E-5', 'north');
    const otherPlacement = placed(otherUnit, 'E-5', 'south');
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, retreatingPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(retreatingPlacement);
    const melee = createMeleeResolutionState(
      stateWithUnits,
      retreatingPlayer === 'white'
        ? { secondPlayerAttackApplyState: attackApply }
        : { firstPlayerAttackApplyState: attackApply },
    );
    return updatePhaseState(
      stateWithUnits,
      createResolveMeleePhaseState(stateWithUnits, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('given white melee retreat apply, white chooses E-4 north, white retreat finalPosition matches', () => {
    const state = createStateWithMeleeRetreat('white');
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      retreatOption: chosenPosition,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getMeleeRetreatState(newState, 'white');

    expect(retreatState.finalPosition).toStrictEqual(chosenPosition);
  });

  it('given black melee retreat apply, black chooses E-4 north, black retreat finalPosition matches', () => {
    const state = createStateWithMeleeRetreat('black');
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'black',
      retreatOption: chosenPosition,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getMeleeRetreatState(newState, 'black');

    expect(retreatState.finalPosition).toStrictEqual(chosenPosition);
  });

  it('writes finalPosition on a front-engagement nested retreat', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const stateInIssueCommands = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: createMovementResolutionState(
          withBoard,
          {
            engagementState: createFrontEngagementState({
              defendingUnitRetreats: true,
              retreatState: createRetreatState(placement),
            }),
          },
        ),
      }),
    );
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      retreatOption: chosenPosition,
    });

    const newState = applyChooseRetreatOptionEvent(event, stateInIssueCommands);
    expect(
      getFrontEngagementRetreatState(newState).finalPosition,
    ).toStrictEqual(chosenPosition);
  });
});
