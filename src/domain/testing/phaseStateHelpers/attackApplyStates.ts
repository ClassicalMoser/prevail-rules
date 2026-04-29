import type { StandardBoard, UnitInstance, UnitWithPlacement } from "@entities";
import type { StandardAttackApplyState } from "@game";
import { createRetreatState, createReverseState, createRoutState } from "./substepStates";

function baseAttackApplyState(
  defendingUnit: UnitInstance,
  overrides?: Partial<StandardAttackApplyState>,
): StandardAttackApplyState {
  return {
    substepType: "attackApply" as const,
    boardType: "standard" as const,
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
 * Creates an AttackApplyState for the standard board (test harness default).
 */
export function createAttackApplyState(
  defendingUnit: UnitInstance,
  overrides?: Partial<StandardAttackApplyState>,
): StandardAttackApplyState {
  return baseAttackApplyState(defendingUnit, overrides);
}

/**
 * Creates an AttackApplyState with a retreat state.
 */
export function createAttackApplyStateWithRetreat(
  retreatingUnit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<StandardAttackApplyState>,
): StandardAttackApplyState {
  return baseAttackApplyState(retreatingUnit.unit, {
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
 * Creates an AttackApplyState with a rout state (standard board; test harness default).
 */
export function createAttackApplyStateWithRout(
  defendingUnit: UnitInstance,
  overrides?: Partial<StandardAttackApplyState>,
): StandardAttackApplyState {
  return baseAttackApplyState(defendingUnit, {
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
export function createAttackApplyStateWithReverse(
  reversingUnit: UnitWithPlacement<StandardBoard>,
  overrides?: Partial<StandardAttackApplyState>,
): StandardAttackApplyState {
  return baseAttackApplyState(reversingUnit.unit, {
    attackResult: {
      unitRouted: false,
      unitRetreated: false,
      unitReversed: true,
    },
    reverseState: createReverseState(reversingUnit),
    ...overrides,
  });
}
