import {
  getFrontEngagementStateFromMovement,
  getRetreatStateFromAttackApply,
} from '@queries';
import { throwIfBypassed, throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  placed,
  legalRetreatsOf,
} from '@testing';
import { addUnitToBoard, updatePhaseState, updateCurrentInitiative } from '../';

import { updateRetreatState } from './updateRetreatState';

import { createEmptyGameState } from '@factories';
/**
 * UpdateRetreatState: Creates a new game state with the retreat state updated.
 */
describe('updateRetreatState function', () => {
  function createStateWithRangedAttackRetreat() {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placedUnit),
    };
    const attackApply = createAttackApplyStateWithRetreat(
      placedUnit,
      legalRetreatsOf(placedUnit),
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
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(
      retreatingPlacement,
      legalRetreatsOf(retreatingPlacement),
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

  it('given update retreat state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRetreat();
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');
    const newRetreat = createRetreatState(
      placedUnit,
      legalRetreatsOf(placedUnit),
      { completed: true },
    );

    const newState = updateRetreatState(state, newRetreat);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('issueCommands');
    if (phase.phase !== 'issueCommands') {
      throw new Error('phase');
    }
    const commandState = throwIfPending(
      phase.currentCommandResolutionState,
      'command',
    );
    if (commandState.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const attackApply = throwIfPending(
      commandState.attackApplyState,
      'attack apply',
    );
    expect(
      throwIfBypassed(
        getRetreatStateFromAttackApply(attackApply),
        'the attack applies a retreat',
      ).completed,
    ).toBe(true);
  });

  it('given update retreat state in melee resolution for white', () => {
    const state = createStateWithMeleeRetreat('white');
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');
    const newRetreat = createRetreatState(
      placedUnit,
      legalRetreatsOf(placedUnit),
      { completed: true },
    );

    const newState = updateRetreatState(state, newRetreat);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const whiteApply = throwIfPending(
      melee.secondPlayerAttackApplyState,
      'white apply',
    );
    expect(
      throwIfBypassed(
        getRetreatStateFromAttackApply(whiteApply),
        'the attack applies a retreat',
      ).completed,
    ).toBe(true);
  });

  it('given update retreat state in melee resolution for black', () => {
    const state = createStateWithMeleeRetreat('black');
    const unit = createTestUnit('black', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');
    const newRetreat = createRetreatState(
      placedUnit,
      legalRetreatsOf(placedUnit),
      { completed: true },
    );

    const newState = updateRetreatState(state, newRetreat);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const blackApply = throwIfPending(
      melee.firstPlayerAttackApplyState,
      'black apply',
    );
    expect(
      throwIfBypassed(
        getRetreatStateFromAttackApply(blackApply),
        'the attack applies a retreat',
      ).completed,
    ).toBe(true);
  });

  it('given when ranged attack apply has no retreat state, throws', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');
    const attackApply = createAttackApplyStateWithNothingDue(unit);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state, {
        attackApplyState: attackApply,
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    expect(() =>
      updateRetreatState(
        stateInPhase,
        createRetreatState(placedUnit, legalRetreatsOf(placedUnit)),
      ),
    ).toThrow('No retreat state found in attack apply state');
  });

  it('updates nested retreatState under front engagement movement CRS', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placedUnit),
    };
    const opened = createRetreatState(placedUnit, legalRetreatsOf(placedUnit));
    const phaseState = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: createMovementResolutionState(withBoard, {
        engagementState: createFrontEngagementState({
          defendingUnitRetreats: true,
          retreatState: opened,
        }),
      }),
    });
    const stateInPhase = updatePhaseState(withBoard, phaseState);
    const nextRetreat = createRetreatState(
      placedUnit,
      legalRetreatsOf(placedUnit),
      {
        chosenRetreatPath: ['step'],
      },
    );

    const next = updateRetreatState(stateInPhase, nextRetreat);
    const { retreatState } =
      getFrontEngagementStateFromMovement(next).engagementResolutionState;

    expect(retreatState).not.toBe('pending');
    if (retreatState === 'pending') {
      throw new Error('expected retreatState');
    }
    expect(retreatState.chosenRetreatPath).toStrictEqual(['step']);
  });

  it('throws when movement CRS has front engagement without an opened retreatState', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState: createFrontEngagementState(),
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');

    expect(() =>
      updateRetreatState(
        stateInPhase,
        createRetreatState(placedUnit, legalRetreatsOf(placedUnit)),
      ),
    ).toThrow('No retreat state found in front engagement');
  });

  it('given when in issueCommands with no command resolution state, throws', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const phaseState = createIssueCommandsPhaseState(state);
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');

    expect(() =>
      updateRetreatState(
        stateInPhase,
        createRetreatState(placedUnit, legalRetreatsOf(placedUnit)),
      ),
    ).toThrow('No command resolution state found');
  });

  it('given when melee white attack apply has no retreat state, throws', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement = placed(whiteUnit, 'E-5', 'north');
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        placed(blackUnit, 'E-5', 'south'),
        legalRetreatsOf(placed(blackUnit, 'E-5', 'south')),
      ),
      secondPlayerAttackApplyState:
        createAttackApplyStateWithNothingDue(whiteUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRetreatState(
        stateInPhase,
        createRetreatState(whitePlacement, legalRetreatsOf(whitePlacement)),
      ),
    ).toThrow('No retreat state found in attack apply state');
  });

  it('given when melee black attack apply has no retreat state, throws', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const blackPlacement = placed(blackUnit, 'E-5', 'south');
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState:
        createAttackApplyStateWithNothingDue(blackUnit),
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        placed(whiteUnit, 'E-5', 'north'),
        legalRetreatsOf(placed(whiteUnit, 'E-5', 'north')),
      ),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRetreatState(
        stateInPhase,
        createRetreatState(blackPlacement, legalRetreatsOf(blackPlacement)),
      ),
    ).toThrow('No retreat state found in attack apply state');
  });

  it('given when not in issueCommands or resolveMelee phase, throws', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placedUnit = placed(unit, 'E-5', 'north');

    expect(() =>
      updateRetreatState(
        stateInPlayCards,
        createRetreatState(placedUnit, legalRetreatsOf(placedUnit)),
      ),
    ).toThrow('Retreat state update not expected in phase: playCards');
  });
});
