import type {
  AttackApplyState,
  GameState,
  StandardBoard,
  UnitWithPlacement,
} from '@entities';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import {
  getRoutStateFromAttackApply,
  getRoutStateFromMeleeResolutionByInitiative,
} from './rout';

describe('getRoutStateFromAttackApply', () => {
  it('should return rout state from attack apply state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyState<any> = {
      substepType: 'attackApply' as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: true,
        unitRetreated: false,
        unitReversed: false,
      },
      routState: {
        substepType: 'rout' as const,
        player: 'black' as const,
        unitsToRout: new Set([unit]),
        numberToDiscard: 1,
        cardsChosen: false,
        completed: false,
      },
      retreatState: undefined,
      reverseState: undefined,
      completed: false,
    };

    const result = getRoutStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('rout');
    expect(result.player).toBe('black');
    expect(result.unitsToRout.has(unit)).toBe(true);
  });

  it('should throw error when rout state is missing', () => {
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

    expect(() => getRoutStateFromAttackApply(attackApplyState)).toThrow(
      'No rout state found in attack apply state',
    );
  });
});

describe('getRoutStateFromMeleeResolutionByInitiative', () => {
  function meleeStateWithRouts(
    initiative: 'white' | 'black',
    opts: { whiteHasRout?: boolean; blackHasRout?: boolean },
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: initiative });
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

    const whiteApply = opts.whiteHasRout
      ? createAttackApplyStateWithRout(whiteUnit)
      : createAttackApplyState(whiteUnit);
    const blackApply = opts.blackHasRout
      ? createAttackApplyStateWithRout(blackUnit)
      : createAttackApplyState(blackUnit);

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it('returns first initiative players rout when present', () => {
    const state = meleeStateWithRouts('black', {
      whiteHasRout: false,
      blackHasRout: true,
    });
    const rout = getRoutStateFromMeleeResolutionByInitiative(state);
    expect(rout.player).toBe('black');
    expect(rout.unitsToRout.size).toBeGreaterThan(0);
  });

  it('falls back to second player when first has no rout', () => {
    const state = meleeStateWithRouts('black', {
      whiteHasRout: true,
      blackHasRout: false,
    });
    const rout = getRoutStateFromMeleeResolutionByInitiative(state);
    expect(rout.player).toBe('white');
    expect(rout.unitsToRout.size).toBeGreaterThan(0);
  });

  it('throws when no rout on either apply', () => {
    const state = meleeStateWithRouts('white', {
      whiteHasRout: false,
      blackHasRout: false,
    });
    expect(() => getRoutStateFromMeleeResolutionByInitiative(state)).toThrow(
      'No rout state found in melee resolution',
    );
  });
});
