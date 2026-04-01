import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateTriggerRoutFromRetreatEvent } from './generateTriggerRoutFromRetreatEvent';

/**
 * When the defender cannot retreat legally, the engine emits `triggerRoutFromRetreat` so the
 * rout flow can start instead. Context is ranged vs melee; in melee the retreating player is
 * explicit when both sides could theoretically be in retreat substeps.
 */
describe('generateTriggerRoutFromRetreatEvent', () => {
  function stateWithRangedRetreat(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: retreatingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit: retreatingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  function stateWithMeleeRetreat(
    retreatingPlayer: 'white' | 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const retreatingWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: retreatingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const otherWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: otherUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
    };
    let s = {
      ...state,
      boardState: addUnitToBoard(state.boardState, retreatingWp),
    };
    s = { ...s, boardState: addUnitToBoard(s.boardState, otherWp) };
    const attackApply = createAttackApplyStateWithRetreat(retreatingWp);
    const melee = createMeleeResolutionState(s, {
      ...(retreatingPlayer === 'white'
        ? { whiteAttackApplyState: attackApply }
        : { blackAttackApplyState: attackApply }),
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it('given ranged resolution with retreat substep, retreatResolutionContext is rangedAttack', () => {
    const full = stateWithRangedRetreat();
    const event = generateTriggerRoutFromRetreatEvent(full, 0);
    expect(event.effectType).toBe('triggerRoutFromRetreat');
    expect(event.retreatResolutionContext).toBe('rangedAttack');
    expect(event).not.toHaveProperty('retreatingPlayer');
  });

  it('given melee with only white in retreat apply, context melee and retreatingPlayer white', () => {
    const full = stateWithMeleeRetreat('white');
    const event = generateTriggerRoutFromRetreatEvent(full, 0);
    expect(event.effectType).toBe('triggerRoutFromRetreat');
    expect(event.retreatResolutionContext).toBe('melee');
    if (event.retreatResolutionContext === 'melee') {
      expect(event.retreatingPlayer).toBe('white');
    }
  });

  it('given white initiative and both could retreat, picks white retreat path for melee context', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: whiteUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: blackUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const attackApply = createAttackApplyStateWithRetreat(whiteWp);
    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: attackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const event = generateTriggerRoutFromRetreatEvent(full, 0);
    expect(event.retreatResolutionContext).toBe('melee');
    if (event.retreatResolutionContext === 'melee') {
      expect(event.retreatingPlayer).toBe('white');
    }
  });

  it('given playCards phase, throws retreat rout phase guard', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateTriggerRoutFromRetreatEvent(full, 0)).toThrow(
      'Retreat rout not expected in phase: playCards',
    );
  });
});
