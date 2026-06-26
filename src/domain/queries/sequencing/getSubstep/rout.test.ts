import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { AttackApplyStateForBoard, GameStateForBoard } from '@game';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import {
  getRoutStateFromAttackApply,
  getRoutStateFromMeleeResolutionByInitiative,
} from './rout';

/**
 * Rout substep accessors: read rout from a single apply, or pick melee side by initiative when
 * both players might have rout substeps.
 */
describe(getRoutStateFromAttackApply, () => {
  it('given apply with rout nested, returns that rout substep', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyStateForBoard<StandardBoard> = {
      attackResult: {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: true,
      },
      boardType: 'standard' as const,
      completed: false,
      defendingUnit: unit,
      retreatState: 'pending' as const,
      reverseState: 'pending' as const,
      routState: {
        cardsChosen: false,
        completed: false,
        numberToDiscard: 1,
        player: 'black' as const,
        substepType: 'rout' as const,
        unitsToRout: [unit],
      },
      substepType: 'attackApply' as const,
    };

    const result = getRoutStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('rout');
    expect(result.player).toBe('black');
    expect(result.unitsToRout.includes(unit)).toBeTruthy();
  });

  it('given apply without routState, throws no rout in attack apply', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyStateForBoard<StandardBoard> = {
      attackResult: {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: false,
      },
      boardType: 'standard' as const,
      completed: false,
      defendingUnit: unit,
      retreatState: 'pending' as const,
      reverseState: 'pending' as const,
      routState: 'pending' as const,
      substepType: 'attackApply' as const,
    };

    expect(() => getRoutStateFromAttackApply(attackApplyState)).toThrow(
      'No rout state found in attack apply state',
    );
  });
});

describe(getRoutStateFromMeleeResolutionByInitiative, () => {
  /** Engaged E-5 pair; toggle which side’s apply uses createAttackApplyStateWithRout. */
  function meleeStateWithRouts(
    initiative: 'white' | 'black',
    opts: { whiteHasRout?: boolean; blackHasRout?: boolean },
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: initiative });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
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
      blackAttackApplyState: blackApply,
      whiteAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it('given black initiative and only black rout, returns black rout', () => {
    const state = meleeStateWithRouts('black', {
      blackHasRout: true,
      whiteHasRout: false,
    });
    const rout = getRoutStateFromMeleeResolutionByInitiative(state);
    expect(rout.player).toBe('black');
    expect(rout.unitsToRout.length).toBeGreaterThan(0);
  });

  it('given black initiative but black has no rout, falls back to white rout', () => {
    const state = meleeStateWithRouts('black', {
      blackHasRout: false,
      whiteHasRout: true,
    });
    const rout = getRoutStateFromMeleeResolutionByInitiative(state);
    expect(rout.player).toBe('white');
    expect(rout.unitsToRout.length).toBeGreaterThan(0);
  });

  it('given neither apply has rout, throws no rout in melee resolution', () => {
    const state = meleeStateWithRouts('white', {
      blackHasRout: false,
      whiteHasRout: false,
    });
    expect(() => getRoutStateFromMeleeResolutionByInitiative(state)).toThrow(
      'No rout state found in melee resolution',
    );
  });
});
