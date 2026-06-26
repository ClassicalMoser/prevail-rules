import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { AttackApplyStateForBoard, GameStateForBoard } from '@game';
import {
  createAttackApplyStateWithReverse,
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import {
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
} from './reverse';

/**
 * Reverse substep accessors: unwrap reverse from one apply, or choose melee side by initiative
 * and whether the first player’s reverse already has a final facing committed.
 */
describe(getReverseStateFromAttackApply, () => {
  it('given apply with reverse substep, returns reverseState', () => {
    expect.hasAssertions();
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyStateForBoard<StandardBoard> = {
      attackResult: {
        unitRetreated: false,
        unitReversed: true,
        unitRouted: false,
      },
      boardType: 'standard' as const,
      completed: false,
      defendingUnit: unit,
      retreatState: 'pending' as const,
      reverseState: {
        boardType: 'standard' as const,
        completed: false,
        finalPosition: 'pending' as const,
        reversingUnit: {
          boardType: 'standard' as const,
          placement: {
            boardType: 'standard' as const,
            coordinate: 'E-5',
            facing: 'north',
          },
          unit,
        },
        substepType: 'reverse' as const,
      },
      routState: 'pending' as const,
      substepType: 'attackApply' as const,
    };

    const result = getReverseStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('reverse');
    expect(result.reversingUnit.unit).toStrictEqual(unit);
  });

  it('given error when reverse state is missing, throws', () => {
    expect.hasAssertions();
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

    expect(() => getReverseStateFromAttackApply(attackApplyState)).toThrow(
      'No reverse state found in attack apply state',
    );
  });
});

describe(getReverseStateFromMeleeResolutionByInitiative, () => {
  /** Both sides in reverse substeps; optional finalPosition on initiative side to simulate done. */
  function stateWithReverse(
    initiative: 'white' | 'black',
    firstFinal?: 'set',
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: initiative });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'east',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'west',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteRev = createAttackApplyStateWithReverse(whiteWp, {
      reverseState: createReverseState(whiteWp, {
        finalPosition:
          initiative === 'white' && firstFinal === 'set'
            ? whiteWp.placement
            : 'pending',
      }),
    });
    const blackRev = createAttackApplyStateWithReverse(blackWp, {
      reverseState: createReverseState(blackWp, {
        finalPosition:
          initiative === 'black' && firstFinal === 'set'
            ? blackWp.placement
            : 'pending',
      }),
    });

    const melee = createMeleeResolutionState(s, {
      blackAttackApplyState: blackRev,
      whiteAttackApplyState: whiteRev,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it('given white initiative and both reverses pending, picks white', () => {
    expect.hasAssertions();
    const state = stateWithReverse('white');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('white');
  });

  it('given black initiative and both reverses pending, picks black', () => {
    expect.hasAssertions();
    const state = stateWithReverse('black');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('black');
  });

  it('given white initiative but white reverse already has finalPosition, picks black', () => {
    expect.hasAssertions();
    const state = stateWithReverse('white', 'set');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('black');
  });

  it('given black initiative but black reverse already has finalPosition, picks white', () => {
    expect.hasAssertions();
    const state = stateWithReverse('black', 'set');
    const rev = getReverseStateFromMeleeResolutionByInitiative(state);
    expect(rev.reversingUnit.unit.playerSide).toBe('white');
  });

  it('given both reverses already have finalPosition, throws no reverse in melee', () => {
    expect.hasAssertions();
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'east',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'west',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const doneWhite = createAttackApplyStateWithReverse(whiteWp, {
      reverseState: {
        boardType: 'standard' as const,
        completed: false,
        finalPosition: whiteWp.placement,
        reversingUnit: whiteWp,
        substepType: 'reverse',
      },
    });
    const doneBlack = createAttackApplyStateWithReverse(blackWp, {
      reverseState: {
        boardType: 'standard' as const,
        completed: false,
        finalPosition: blackWp.placement,
        reversingUnit: blackWp,
        substepType: 'reverse',
      },
    });

    const melee = createMeleeResolutionState(s, {
      blackAttackApplyState: doneBlack,
      whiteAttackApplyState: doneWhite,
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
