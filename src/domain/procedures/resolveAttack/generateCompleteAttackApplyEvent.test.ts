import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { StandardGameState } from '@game';
import {
  createAttackApplyState,
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';

/**
 * `completeAttackApply` is the bookkeeping tick after both sides have committed in ranged
 * or after each melee defender finishes their apply substep. Payload names attack type and
 * which player’s apply just completed (melee uses initiative order when both are pending).
 */
describe('generateCompleteAttackApplyEvent', () => {
  /** issueCommands + ranged CRS + default incomplete attack apply for one white defender on E-5. */
  function createStateWithRangedAttackApply(): StandardGameState {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: defendingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState = createAttackApplyState(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** resolveMelee + two completed flags; omit arg for both complete, or pass side still incomplete. */
  function createStateWithMeleeApply(
    incompletePlayer?: 'white' | 'black',
  ): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });

    const whiteUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: whiteUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const blackUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: blackUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
    };

    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, whiteUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(
        stateWithUnits.boardState,
        blackUnitWithPlacement,
      ),
    };

    const whiteAttackApply = createAttackApplyState(whiteUnit, {
      completed: incompletePlayer !== 'white',
    });
    const blackAttackApply = createAttackApplyState(blackUnit, {
      completed: incompletePlayer !== 'black',
    });

    const meleeState = createMeleeResolutionState(stateWithUnits, {
      whiteAttackApplyState: whiteAttackApply,
      blackAttackApplyState: blackAttackApply,
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  it('given ranged stack with white defender apply, emits ranged completeAttackApply for white', () => {
    const state = createStateWithRangedAttackApply();

    expect(generateCompleteAttackApplyEvent(state, 0)).toEqual({
      eventNumber: 0,
      eventType: 'gameEffect',
      effectType: 'completeAttackApply',
      attackType: 'ranged',
      defendingPlayer: 'white',
    });
  });

  it('given black initiative and only black apply incomplete, emits melee for defending black', () => {
    const state = createStateWithMeleeApply('black');

    expect(generateCompleteAttackApplyEvent(state, 0)).toEqual({
      eventNumber: 0,
      eventType: 'gameEffect',
      effectType: 'completeAttackApply',
      attackType: 'melee',
      defendingPlayer: 'black',
    });
  });

  it('given same stack with white still incomplete after black done, emits melee for white', () => {
    const state = createStateWithMeleeApply('white');

    expect(generateCompleteAttackApplyEvent(state, 0)).toEqual({
      eventNumber: 0,
      eventType: 'gameEffect',
      effectType: 'completeAttackApply',
      attackType: 'melee',
      defendingPlayer: 'white',
    });
  });

  it('given melee with both applies already complete, throws no incomplete apply', () => {
    const state = createStateWithMeleeApply();

    expect(() => generateCompleteAttackApplyEvent(state, 0)).toThrow(
      'No incomplete attack apply state found in melee resolution',
    );
  });

  it('given bare empty state without phase, throws no current phase state', () => {
    const state = createEmptyGameState();

    expect(() => generateCompleteAttackApplyEvent(state, 0)).toThrow(
      'No current phase state found',
    );
  });

  it('given cleanup phase, throws completeAttackApply phase guard', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, createCleanupPhaseState());
    expect(() => generateCompleteAttackApplyEvent(full, 0)).toThrow(
      'completeAttackApply not expected in phase: cleanup',
    );
  });
});
