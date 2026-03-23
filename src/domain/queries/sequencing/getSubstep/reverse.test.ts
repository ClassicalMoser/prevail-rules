import type {
  AttackApplyState,
  GameState,
  StandardBoard,
  UnitWithPlacement,
} from '@entities';
import {
  createAttackApplyStateWithReverse,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import {
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
} from './reverse';

describe('getReverseStateFromAttackApply', () => {
  it('should return reverse state from attack apply state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyState<any> = {
      substepType: 'attackApply' as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: true,
      },
      routState: undefined,
      retreatState: undefined,
      reverseState: {
        substepType: 'reverse' as const,
        reversingUnit: {
          unit,
          placement: { coordinate: 'E-5', facing: 'north' },
        },
        finalPosition: undefined,
        completed: false,
      },
      completed: false,
    };

    const result = getReverseStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('reverse');
    expect(result.reversingUnit.unit).toEqual(unit);
  });

  it('should throw error when reverse state is missing', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyState<any> = {
      substepType: 'attackApply' as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: false,
      },
      routState: undefined,
      retreatState: undefined,
      reverseState: undefined,
      completed: false,
    };

    expect(() => getReverseStateFromAttackApply(attackApplyState)).toThrow(
      'No reverse state found in attack apply state',
    );
  });
});

describe('getReverseStateFromMeleeResolutionByInitiative', () => {
  function stateWithReverse(
    initiative: 'white' | 'black',
    firstFinal?: 'set',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: initiative });
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

    const whiteRev = createAttackApplyStateWithReverse(whiteWp, {
      reverseState: createReverseState(whiteWp, {
        finalPosition:
          initiative === 'white' && firstFinal === 'set'
            ? whiteWp.placement
            : undefined,
      }),
    });
    const blackRev = createAttackApplyStateWithReverse(blackWp, {
      reverseState: createReverseState(blackWp, {
        finalPosition:
          initiative === 'black' && firstFinal === 'set'
            ? blackWp.placement
            : undefined,
      }),
    });

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteRev,
      blackAttackApplyState: blackRev,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it('prefers initiative player when reverse awaits resolution', () => {
    const state = stateWithReverse('white');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('white');
  });

  it('prefers black when initiative is black and reverse awaits resolution', () => {
    const state = stateWithReverse('black');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('black');
  });

  it('uses second player when first reverse already has finalPosition', () => {
    const state = stateWithReverse('white', 'set');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('black');
  });

  it('uses white when initiative is black but black reverse already has finalPosition', () => {
    const state = stateWithReverse('black', 'set');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('white');
  });

  it('throws when no pending reverse', () => {
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

    const doneWhite = createAttackApplyStateWithReverse(whiteWp, {
      reverseState: {
        substepType: 'reverse',
        reversingUnit: whiteWp,
        finalPosition: whiteWp.placement,
        completed: false,
      },
    });
    const doneBlack = createAttackApplyStateWithReverse(blackWp, {
      reverseState: {
        substepType: 'reverse',
        reversingUnit: blackWp,
        finalPosition: blackWp.placement,
        completed: false,
      },
    });

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: doneWhite,
      blackAttackApplyState: doneBlack,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    expect(() => getReverseStateFromMeleeResolutionByInitiative(full)).toThrow(
      'No reverse state found in melee resolution',
    );
  });
});
