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
 * After `resolveRetreat` lists the legal ways back, the defender picks one by its path: this choice writes
 * `chosenRetreat` on the active retreat substep (ranged attack-apply or the correct melee side).
 */
describe('applyChooseRetreatOptionEvent function', () => {
  // The retreat fixture offers two tied ways back; the defender takes the one
  // that turns right and steps, which ends on F-4 facing north-east.
  const chosenPath = ['turnRight' as const, 'step' as const];
  const chosenRetreat = {
    path: chosenPath,
    placement: { coordinate: 'F-4' as const, facing: 'northEast' as const },
  };

  /** IssueCommands + ranged CRS + retreat substep on white at E-5 (no retreat chosen yet). */
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

  it('given ranged retreat flow, white chooses the right-turn retreat, the retreat substep records it', () => {
    const state = createStateWithRangedAttackRetreat();
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRangedAttackRetreatState(newState);

    expect(retreatState.chosenRetreat).toStrictEqual(chosenRetreat);
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

  it('given white melee retreat apply, white chooses the right-turn retreat, the white retreat records it', () => {
    const state = createStateWithMeleeRetreat('white');
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getMeleeRetreatState(newState, 'white');

    expect(retreatState.chosenRetreat).toStrictEqual(chosenRetreat);
  });

  it('given black melee retreat apply, black chooses the right-turn retreat, the black retreat records it', () => {
    const state = createStateWithMeleeRetreat('black');
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'black',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getMeleeRetreatState(newState, 'black');

    expect(retreatState.chosenRetreat).toStrictEqual(chosenRetreat);
  });

  it('records the chosen retreat on a front-engagement nested retreat', () => {
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
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, stateInIssueCommands);
    expect(
      getFrontEngagementRetreatState(newState).chosenRetreat,
    ).toStrictEqual(chosenRetreat);
  });

  it('refuses a path the retreat did not offer', () => {
    const state = createStateWithRangedAttackRetreat();
    // A turn about and a step is not one of the two ways back on offer.
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      path: ['turnAbout', 'step'],
    });

    expect(() => applyChooseRetreatOptionEvent(event, state)).toThrow(
      'The chosen retreat is not one of those offered',
    );
  });
});
