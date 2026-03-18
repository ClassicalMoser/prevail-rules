import type {
  AttackApplyState,
  Board,
  StandardBoard,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import {
  createRetreatState,
  createReverseState,
  createRoutState,
} from './substepStates';

/**
 * Creates an AttackApplyState with sensible defaults.
 */
export function createAttackApplyState<TBoard extends Board>(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState<TBoard>>,
): AttackApplyState<TBoard> {
  return {
    substepType: 'attackApply' as const,
    defendingUnit,
    attackResult: {
      unitRouted: false,
      unitRetreated: false,
      unitReversed: false,
    },
    routState: undefined,
    retreatState: undefined,
    reverseState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates an AttackApplyState with a retreat state.
 */
export function createAttackApplyStateWithRetreat(
  retreatingUnit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<AttackApplyState<StandardBoard>>,
): AttackApplyState<StandardBoard> {
  return createAttackApplyState(retreatingUnit.unit, {
    attackResult: {
      unitRouted: false,
      unitRetreated: true,
      unitReversed: false,
    },
    retreatState: createRetreatState(retreatingUnit),
    ...overrides,
  });
}

/**
 * Creates an AttackApplyState with a rout state.
 */
export function createAttackApplyStateWithRout<TBoard extends Board>(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState<TBoard>>,
): AttackApplyState<TBoard> {
  return createAttackApplyState(defendingUnit, {
    attackResult: {
      unitRouted: true,
      unitRetreated: false,
      unitReversed: false,
    },
    routState: createRoutState(defendingUnit.playerSide, defendingUnit),
    ...overrides,
  });
}

/**
 * Creates an AttackApplyState with a reverse state.
 */
export function createAttackApplyStateWithReverse<TBoard extends Board>(
  reversingUnit: UnitWithPlacement<TBoard>,
  overrides?: Partial<AttackApplyState<TBoard>>,
): AttackApplyState<TBoard> {
  return createAttackApplyState(reversingUnit.unit, {
    attackResult: {
      unitRouted: false,
      unitRetreated: false,
      unitReversed: true,
    },
    reverseState: createReverseState(reversingUnit),
    ...overrides,
  });
}
