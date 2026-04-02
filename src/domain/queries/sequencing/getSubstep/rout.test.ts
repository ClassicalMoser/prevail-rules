import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import type { StandardAttackApplyState } from '@game/substeps';
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

/**
 * Rout substep accessors: read rout from a single apply, or pick melee side by initiative when
 * both players might have rout substeps.
 */
describe('getRoutStateFromAttackApply', () => {
  it('given apply with rout nested, returns that rout substep', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: StandardAttackApplyState = {
      substepType: 'attackApply' as const,
      boardType: 'standard' as const,
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

  it('given apply without routState, throws no rout in attack apply', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: StandardAttackApplyState = {
      substepType: 'attackApply' as const,
      boardType: 'standard' as const,
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
  /** Engaged E-5 pair; toggle which side’s apply uses createAttackApplyStateWithRout. */
  function meleeStateWithRouts(
    initiative: 'white' | 'black',
    opts: { whiteHasRout?: boolean; blackHasRout?: boolean },
  ): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: initiative });
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

  it('given black initiative and only black rout, returns black rout', () => {
    const state = meleeStateWithRouts('black', {
      whiteHasRout: false,
      blackHasRout: true,
    });
    const rout = getRoutStateFromMeleeResolutionByInitiative(state);
    expect(rout.player).toBe('black');
    expect(rout.unitsToRout.size).toBeGreaterThan(0);
  });

  it('given black initiative but black has no rout, falls back to white rout', () => {
    const state = meleeStateWithRouts('black', {
      whiteHasRout: true,
      blackHasRout: false,
    });
    const rout = getRoutStateFromMeleeResolutionByInitiative(state);
    expect(rout.player).toBe('white');
    expect(rout.unitsToRout.size).toBeGreaterThan(0);
  });

  it('given neither apply has rout, throws no rout in melee resolution', () => {
    const state = meleeStateWithRouts('white', {
      whiteHasRout: false,
      blackHasRout: false,
    });
    expect(() => getRoutStateFromMeleeResolutionByInitiative(state)).toThrow(
      'No rout state found in melee resolution',
    );
  });
});
