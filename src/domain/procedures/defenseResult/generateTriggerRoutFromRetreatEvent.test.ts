import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
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

describe('generateTriggerRoutFromRetreatEvent', () => {
  function stateWithRangedRetreat(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
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
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherWp: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
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

  it('returns rangedAttack context when in ranged retreat', () => {
    const full = stateWithRangedRetreat();
    const event = generateTriggerRoutFromRetreatEvent(full);
    expect(event.effectType).toBe('triggerRoutFromRetreat');
    expect(event.retreatResolutionContext).toBe('rangedAttack');
    expect(event).not.toHaveProperty('retreatingPlayer');
  });

  it('returns melee context and retreatingPlayer', () => {
    const full = stateWithMeleeRetreat('white');
    const event = generateTriggerRoutFromRetreatEvent(full);
    expect(event.effectType).toBe('triggerRoutFromRetreat');
    expect(event.retreatResolutionContext).toBe('melee');
    if (event.retreatResolutionContext === 'melee') {
      expect(event.retreatingPlayer).toBe('white');
    }
  });

  it('uses initiative player first when their melee retreat exists (white initiative)', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
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

    const event = generateTriggerRoutFromRetreatEvent(full);
    expect(event.retreatResolutionContext).toBe('melee');
    if (event.retreatResolutionContext === 'melee') {
      expect(event.retreatingPlayer).toBe('white');
    }
  });

  it('throws when phase is not issueCommands or resolveMelee', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateTriggerRoutFromRetreatEvent(full)).toThrow(
      'Retreat rout not expected in phase: playCards',
    );
  });
});
