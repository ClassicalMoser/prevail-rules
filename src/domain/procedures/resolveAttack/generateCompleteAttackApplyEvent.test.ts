import type { GameState } from '@game';
import {
  createAttackApplyStateWithNothingDue,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';

import { createEmptyGameState } from '@factories';
/**
 * `completeAttackApply` is the bookkeeping tick after both sides have committed in ranged
 * or after each melee defender finishes their apply substep. Payload names attack type and
 * which player’s apply just completed (melee uses initiative order when both are pending).
 */
describe('generateCompleteAttackApplyEvent function', () => {
  /** IssueCommands + ranged CRS + default incomplete attack apply for one white defender on E-5. */
  function createStateWithRangedAttackApply(): GameState {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState =
      createAttackApplyStateWithNothingDue(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** ResolveMelee + two completed flags; omit arg for both complete, or pass side still incomplete. */
  function createStateWithMeleeApply(
    incompletePlayer?: 'white' | 'black',
  ): GameState {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });

    const whiteUnitWithPlacement = placed(whiteUnit, 'E-5', 'north');
    const blackUnitWithPlacement = placed(blackUnit, 'E-5', 'south');

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

    const whiteAttackApply = createAttackApplyStateWithNothingDue(whiteUnit, {
      completed: incompletePlayer !== 'white',
    });
    const blackAttackApply = createAttackApplyStateWithNothingDue(blackUnit, {
      completed: incompletePlayer !== 'black',
    });

    const meleeState = createMeleeResolutionState(stateWithUnits, {
      firstPlayerAttackApplyState: blackAttackApply,
      secondPlayerAttackApplyState: whiteAttackApply,
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  it('given ranged stack with white defender apply, emits ranged completeAttackApply for white', () => {
    const state = createStateWithRangedAttackApply();

    expect(generateCompleteAttackApplyEvent(state)).toStrictEqual({
      attackType: 'ranged',
      defendingPlayer: 'white',
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('given black initiative and only black apply incomplete, emits melee for defending black', () => {
    const state = createStateWithMeleeApply('black');

    expect(generateCompleteAttackApplyEvent(state)).toStrictEqual({
      attackType: 'melee',
      defendingPlayer: 'black',
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('given same stack with white still incomplete after black done, emits melee for white', () => {
    const state = createStateWithMeleeApply('white');

    expect(generateCompleteAttackApplyEvent(state)).toStrictEqual({
      attackType: 'melee',
      defendingPlayer: 'white',
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('given melee with both applies already complete, throws no incomplete apply', () => {
    const state = createStateWithMeleeApply();

    expect(() => generateCompleteAttackApplyEvent(state)).toThrow(
      'No incomplete attack apply state found in melee resolution',
    );
  });

  it('given bare empty state without phase, throws no current phase state', () => {
    const state = createEmptyGameState('standard');

    expect(() => generateCompleteAttackApplyEvent(state)).toThrow(
      'No current phase state found',
    );
  });

  it('given cleanup phase, throws completeAttackApply phase guard', () => {
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, createCleanupPhaseState());
    expect(() => generateCompleteAttackApplyEvent(full)).toThrow(
      'completeAttackApply not expected in phase: cleanup',
    );
  });
});
