import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { AttackApplyState } from '@game';
import {
  createRetreatState,
  createReverseState,
  createRoutState,
} from './substepStates';

function baseAttackApplyState(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  return {
    attackResult: {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    },
    completed: false,
    defendingUnit,
    retreatState: 'pending',
    reverseState: 'pending',
    routState: 'pending',
    substepType: 'attackApply' as const,
    ...overrides,
  };
}

/**
 * Creates an AttackApplyState for the standard board (test harness default).
 */
export function createAttackApplyState(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  return baseAttackApplyState(defendingUnit, overrides);
}

/**
 * Creates an AttackApplyState with a retreat state.
 */
export function createAttackApplyStateWithRetreat(
  retreatingUnit: UnitWithPlacement,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  return baseAttackApplyState(retreatingUnit.unit, {
    attackResult: {
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    },
    retreatState: createRetreatState(retreatingUnit),
    ...overrides,
  });
}

/**
 * Creates an AttackApplyState with a rout state (standard board; test harness default).
 */
export function createAttackApplyStateWithRout(
  defendingUnit: UnitInstance,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  return baseAttackApplyState(defendingUnit, {
    attackResult: {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: true,
    },
    routState: createRoutState(defendingUnit.playerSide, defendingUnit),
    ...overrides,
  });
}

/**
 * Creates an AttackApplyState with a reverse state.
 */
export function createAttackApplyStateWithReverse(
  reversingUnit: UnitWithPlacement,
  overrides?: Partial<AttackApplyState>,
): AttackApplyState {
  return baseAttackApplyState(reversingUnit.unit, {
    attackResult: {
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
    },
    reverseState: createReverseState(reversingUnit),
    ...overrides,
  });
}
