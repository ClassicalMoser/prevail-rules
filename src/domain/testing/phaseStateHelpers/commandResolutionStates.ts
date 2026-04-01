import type {
  StandardGameState,
  StandardMeleeResolutionState,
  StandardMovementResolutionState,
  StandardRangedAttackResolutionState,
} from '@game';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a MovementResolutionState with sensible defaults (standard board).
 */
export function createMovementResolutionState(
  state: StandardGameState,
  overrides?: Partial<StandardMovementResolutionState>,
): StandardMovementResolutionState {
  return {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'movement' as const,
    boardType: 'standard' as const,
    movingUnit: {
      boardType: 'standard' as const,
      unit: createTestUnit('black', { attack: 2 }),
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    },
    targetPlacement: {
      boardType: 'standard' as const,
      coordinate: 'E-6',
      facing: 'north',
    },
    moveCommander: false,
    commitment: {
      commitmentType: 'completed',
      card: state.cardState.black.inPlay!,
    },
    engagementState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a RangedAttackResolutionState with sensible defaults (standard board).
 */
export function createRangedAttackResolutionState(
  state: StandardGameState,
  overrides?: Partial<StandardRangedAttackResolutionState>,
): StandardRangedAttackResolutionState {
  return {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'rangedAttack' as const,
    boardType: 'standard' as const,
    attackingUnit: createTestUnit('black', { attack: 2 }),
    defendingUnit: createTestUnit('white', { attack: 2 }),
    attackingCommitment: {
      commitmentType: 'completed',
      card: state.cardState.black.inPlay!,
    },
    defendingCommitment: {
      commitmentType: 'completed',
      card: state.cardState.white.inPlay!,
    },
    supportingUnits: new Set(),
    attackApplyState: undefined,
    completed: false,
    ...overrides,
  };
}

/**
 * Creates a MeleeResolutionState with sensible defaults (standard board).
 */
export function createMeleeResolutionState(
  state: StandardGameState,
  overrides?: Partial<StandardMeleeResolutionState>,
): StandardMeleeResolutionState {
  return {
    substepType: 'meleeResolution' as const,
    boardType: 'standard' as const,
    location: 'E-5',
    whiteCommitment: {
      commitmentType: 'completed',
      card: state.cardState.white.inPlay!,
    },
    blackCommitment: {
      commitmentType: 'completed',
      card: state.cardState.black.inPlay!,
    },
    whiteAttackApplyState: undefined,
    blackAttackApplyState: undefined,
    completed: false,
    ...overrides,
  };
}
