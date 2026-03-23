import type { StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import {
  createAttackApplyStateWithReverse,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveReverseEvent } from './generateResolveReverseEvent';

describe('generateResolveReverseEvent', () => {
  it('generates event from ranged attack reverse substep', () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithReverse(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveReverseEvent(full);
    expect(event.effectType).toBe('resolveReverse');
    expect(event.attackResolutionContext).toBe('rangedAttack');
    expect(event.unitInstance).toEqual(unitWithPlacement);
    expect(event.newUnitPlacement.placement.facing).toBe('south');
    expect(event.newUnitPlacement.placement.coordinate).toBe('E-5');
  });

  it('generates event from melee reverse substep for initiative player', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'east' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'west' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteApply = createAttackApplyStateWithReverse(whiteWp);
    const blackApply = createAttackApplyStateWithReverse(blackWp);

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const event = generateResolveReverseEvent(full);
    expect(event.effectType).toBe('resolveReverse');
    expect(event.attackResolutionContext).toBe('melee');
    expect(event.unitInstance.unit).toBe(whiteUnit);
    expect(event.newUnitPlacement.placement.facing).toBe('west');
  });

  it('throws when no phase state', () => {
    const full = createEmptyGameState();
    expect(() => generateResolveReverseEvent(full)).toThrow(
      'No current phase state found',
    );
  });

  it('throws when phase does not support reverse resolution', () => {
    const full = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveReverseEvent(full)).toThrow(
      'Reverse resolution not expected in phase: playCards',
    );
  });
});
