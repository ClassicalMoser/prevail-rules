import type { UnitWithPlacement } from '@entities';
import { getFrontEngagementStateFromMovement } from '@queries';
import { throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '../';

import { updateRetreatState } from './updateRetreatState';

/**
 * UpdateRetreatState: Creates a new game state with the retreat state updated.
 */
describe(updateRetreatState, () => {
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

  it('given update retreat state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRetreat();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };
    const newRetreat = createRetreatState(placement, { completed: true });

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
    expect(throwIfPending(attackApply.retreatState, 'retreat').completed).toBe(
      true,
    );
  });

  it('given update retreat state in melee resolution for white', () => {
    const state = createStateWithMeleeRetreat('white');
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };
    const newRetreat = createRetreatState(placement, { completed: true });

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
      melee.whiteAttackApplyState,
      'white apply',
    );
    expect(throwIfPending(whiteApply.retreatState, 'retreat').completed).toBe(
      true,
    );
  });

  it('given update retreat state in melee resolution for black', () => {
    const state = createStateWithMeleeRetreat('black');
    const unit = createTestUnit('black', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };
    const newRetreat = createRetreatState(placement, { completed: true });

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
      melee.blackAttackApplyState,
      'black apply',
    );
    expect(throwIfPending(blackApply.retreatState, 'retreat').completed).toBe(
      true,
    );
  });

  it('given when ranged attack apply has no retreat state, throws', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };
    const attackApply = createAttackApplyState(unit);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state, {
        attackApplyState: attackApply,
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    expect(() =>
      updateRetreatState(stateInPhase, createRetreatState(placement)),
    ).toThrow('No retreat state found in attack apply state');
  });

  it('updates nested retreatState under front engagement movement CRS', () => {
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
    const opened = createRetreatState(placement);
    const phaseState = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: createMovementResolutionState(withBoard, {
        engagementState: createFrontEngagementState({
          defendingUnitRetreats: true,
          retreatState: opened,
        }),
      }),
    });
    const stateInPhase = updatePhaseState(withBoard, phaseState);
    const nextRetreat = createRetreatState(placement, {
      finalPosition: { coordinate: 'E-4', facing: 'north' },
    });

    const next = updateRetreatState(stateInPhase, nextRetreat);
    const { retreatState } =
      getFrontEngagementStateFromMovement(next).engagementResolutionState;

    expect(retreatState).not.toBe('pending');
    if (retreatState === 'pending') {
      throw new Error('expected retreatState');
    }
    expect(retreatState.finalPosition).toStrictEqual({
      coordinate: 'E-4',
      facing: 'north',
    });
  });

  it('throws when movement CRS has front engagement without an opened retreatState', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState: createFrontEngagementState(),
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };

    expect(() =>
      updateRetreatState(stateInPhase, createRetreatState(placement)),
    ).toThrow('No retreat state found in front engagement');
  });

  it('given when in issueCommands with no command resolution state, throws', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state);
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };

    expect(() =>
      updateRetreatState(stateInPhase, createRetreatState(placement)),
    ).toThrow('No command resolution state found');
  });

  it('given when melee white attack apply has no retreat state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyStateWithRetreat({
        placement: {
          coordinate: 'E-5',
          facing: 'south',
        },
        unit: blackUnit,
      }),
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRetreatState(stateInPhase, createRetreatState(whitePlacement)),
    ).toThrow('No retreat state found in attack apply state');
  });

  it('given when melee black attack apply has no retreat state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const blackPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
    };
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyState(blackUnit),
      whiteAttackApplyState: createAttackApplyStateWithRetreat({
        placement: {
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: whiteUnit,
      }),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRetreatState(stateInPhase, createRetreatState(blackPlacement)),
    ).toThrow('No retreat state found in attack apply state');
  });

  it('given when not in issueCommands or resolveMelee phase, throws', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    };

    expect(() =>
      updateRetreatState(stateInPlayCards, createRetreatState(placement)),
    ).toThrow('Retreat state update not expected in phase: playCards');
  });
});
