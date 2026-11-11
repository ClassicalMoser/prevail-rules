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
  enemyBlockingStraightBack,
  placed,
  legalRetreatsOf,
} from '@testing';
import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms/pureTransforms';

import { applyChooseRetreatOptionEvent } from './applyChooseRetreatOptionEvent';

import {
  createChooseRetreatOptionEvent,
  createEmptyGameState,
} from '@factories';
/**
 * After `resolveRetreat` lists the legal ways back, the defender picks one by its path: this choice writes
 * `chosenRetreatPath` on the active retreat substep (ranged attack-apply or the correct melee side).
 */
describe('applyChooseRetreatOptionEvent function', () => {
  // In every case an enemy stands on F-5 with its back to the retreating
  // unit: it bars the straight step back and leaves two tied ways round it
  // (§9.1.3). The defender takes the one that turns right and steps.
  const chosenPath = ['turnRight' as const, 'step' as const];

  /** IssueCommands + ranged CRS + retreat substep on white at E-5 (no retreat chosen yet). */
  function createStateWithRangedAttackRetreat() {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const blocker = enemyBlockingStraightBack(placement);
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(
        addUnitToBoard(state.boardState, placement),
        blocker,
      ),
    };
    const attackApply = createAttackApplyStateWithRetreat(
      placement,
      legalRetreatsOf(placement, [blocker]),
    );
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
      player: 'white',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRangedAttackRetreatState(newState);

    expect(retreatState.chosenRetreatPath).toStrictEqual(chosenPath);
  });

  /** ResolveMelee + one-sided retreat apply: both players engaged on E-5 (north vs south). */
  function createStateWithMeleeRetreat(retreatingPlayer: 'white' | 'black') {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
    const blocker = enemyBlockingStraightBack(retreatingPlacement);
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(
        addUnitToBoard(stateWithUnits.boardState, otherPlacement),
        blocker,
      ),
    };
    const attackApply = createAttackApplyStateWithRetreat(
      retreatingPlacement,
      legalRetreatsOf(retreatingPlacement, [blocker]),
    );
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
      player: 'white',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getMeleeRetreatState(newState, 'white');

    expect(retreatState.chosenRetreatPath).toStrictEqual(chosenPath);
  });

  it('given black melee retreat apply, black chooses the right-turn retreat, the black retreat records it', () => {
    const state = createStateWithMeleeRetreat('black');
    const event = createChooseRetreatOptionEvent({
      player: 'black',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getMeleeRetreatState(newState, 'black');

    expect(retreatState.chosenRetreatPath).toStrictEqual(chosenPath);
  });

  it('records the chosen retreat on a front-engagement nested retreat', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const blocker = enemyBlockingStraightBack(placement);
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(
        addUnitToBoard(state.boardState, placement),
        blocker,
      ),
    };
    const stateInIssueCommands = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: createMovementResolutionState(
          withBoard,
          {
            engagementState: createFrontEngagementState({
              defendingUnitRetreats: true,
              retreatState: createRetreatState(
                placement,
                legalRetreatsOf(placement, [blocker]),
              ),
            }),
          },
        ),
      }),
    );
    const event = createChooseRetreatOptionEvent({
      player: 'white',
      path: chosenPath,
    });

    const newState = applyChooseRetreatOptionEvent(event, stateInIssueCommands);
    expect(
      getFrontEngagementRetreatState(newState).chosenRetreatPath,
    ).toStrictEqual(chosenPath);
  });

  it('refuses a path the retreat did not offer', () => {
    const state = createStateWithRangedAttackRetreat();
    // A turn about and a step is not one of the two ways back on offer.
    const event = createChooseRetreatOptionEvent({
      player: 'white',
      path: ['turnAbout', 'step'],
    });

    expect(() => applyChooseRetreatOptionEvent(event, state)).toThrow(
      'The chosen retreat is not one of those offered',
    );
  });
});
