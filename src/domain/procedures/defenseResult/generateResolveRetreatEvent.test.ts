import type { StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveRetreatEvent } from './generateResolveRetreatEvent';

/**
 * `resolveRetreat` closes a legal retreat: starting placement is the defender on the board,
 * final placement is whatever the retreat substep recorded. Ranged stacks nest retreat under
 * one defender’s attack-apply; melee can hold two retreats and the procedure picks the
 * initiative player’s path first.
 */
describe('generateResolveRetreatEvent', () => {
  const finalPos = {
    boardType: 'standard' as const,
    coordinate: 'E-6' as const,
    facing: 'south' as const,
  };

  it('given ranged attack-apply with retreat substep and E-6 south final, event carries that placement', () => {
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
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement, {
      retreatState: createRetreatState(unitWithPlacement, {
        finalPosition: finalPos,
      }),
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit: retreatingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveRetreatEvent(full, 0);
    expect(event.effectType).toBe('resolveRetreat');
    expect(event.startingPosition).toEqual(unitWithPlacement);
    expect(event.finalPosition.placement).toEqual(finalPos);
    expect(event.finalPosition.unit).toBe(retreatingUnit);
  });

  it('given white initiative and both sides in retreat substep, uses white final E-6 not black E-4', () => {
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

    const whiteRetreat = createRetreatState(whiteWp, {
      finalPosition: finalPos,
    });
    const blackRetreat = createRetreatState(blackWp, {
      finalPosition: {
        boardType: 'standard' as const,
        coordinate: 'E-4',
        facing: 'south',
      },
    });

    const whiteApply = createAttackApplyStateWithRetreat(whiteWp, {
      retreatState: whiteRetreat,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, {
      retreatState: blackRetreat,
    });

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const event = generateResolveRetreatEvent(full, 0);
    expect(event.startingPosition.unit).toBe(whiteUnit);
    expect(event.finalPosition.placement).toEqual(finalPos);
  });

  it('given playCards phase, throws retreat resolution phase guard', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRetreatEvent(full, 0)).toThrow(
      'Retreat resolution not expected in phase: playCards',
    );
  });

  it('given ranged apply with retreat substep but no finalPosition yet, still emits with undefined placement', () => {
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
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveRetreatEvent(full, 0);
    expect(event.finalPosition.placement).toBeUndefined();
  });
});
