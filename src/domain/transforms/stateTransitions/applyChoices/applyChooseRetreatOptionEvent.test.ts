import type { UnitWithPlacement } from '@entities';
import type { ChooseRetreatOptionEvent } from '@events';
import {
  getRetreatStateFromFrontEngagement,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseRetreatOptionEvent } from './applyChooseRetreatOptionEvent';

/**
 * After `resolveRetreat` lists legal cells, the defender picks one: this choice writes
 * `finalPosition` on the active retreat substep (ranged attack-apply or the correct melee side).
 */
describe(applyChooseRetreatOptionEvent, () => {
  const chosenPosition = {
    coordinate: 'E-4' as const,
    facing: 'north' as const,
  };

  /** IssueCommands + ranged CRS + retreat substep on white at E-5 (no finalPosition yet). */
  function createStateWithRangedAttackRetreat() {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };
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
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromRangedAttack(newState);

    expect(retreatState.finalPosition).toStrictEqual(chosenPosition);
  });

  /** ResolveMelee + one-sided retreat apply: both players engaged on E-5 (north vs south). */
  function createStateWithMeleeRetreat(retreatingPlayer: 'white' | 'black') {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      {
        attack: 2,
      },
    );
    const retreatingPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: retreatingUnit,
    };
    const otherPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: otherUnit,
    };
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
        ? { whiteAttackApplyState: attackApply }
        : { blackAttackApplyState: attackApply },
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
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromMelee(newState, 'white');

    expect(retreatState.finalPosition).toStrictEqual(chosenPosition);
  });

  it('given black melee retreat apply, black chooses E-4 north, black retreat finalPosition matches', () => {
    const state = createStateWithMeleeRetreat('black');
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromMelee(newState, 'black');

    expect(retreatState.finalPosition).toStrictEqual(chosenPosition);
  });

  it('writes finalPosition on a front-engagement nested retreat', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };
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
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, stateInIssueCommands);
    expect(
      getRetreatStateFromFrontEngagement(newState).finalPosition,
    ).toStrictEqual(chosenPosition);
  });
});
