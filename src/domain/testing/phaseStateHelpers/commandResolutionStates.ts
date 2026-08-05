import type {
  GameStateForVisibility,
  MeleeResolutionState,
  MovementResolutionState,
  RangedAttackResolutionState,
} from '@game';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a MovementResolutionState with sensible defaults (standard board).
 */
export function createMovementResolutionState(
  state: GameStateForVisibility,
  overrides?: Partial<MovementResolutionState>,
): MovementResolutionState {
  return {
    commandResolutionType: 'movement' as const,
    commitment: {
      // Assertion is only valid because a card is always in play outside of the playCard and cleanup phases.
      // Will lead to unexpected behavior if called in other phases.
      // Since this is a test helper, there is no reason for defensive checks.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.black.inPlay!,
      commitmentType: 'completed',
    },
    completed: false,
    engagementState: 'pending',
    moveCommander: false,
    movingUnit: {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: createTestUnit('black', { attack: 2 }),
    },
    substepType: 'commandResolution' as const,
    targetPlacement: {
      coordinate: 'E-6',
      facing: 'north',
    },
    ...overrides,
  };
}

/**
 * Creates a RangedAttackResolutionState with sensible defaults (standard board).
 */
export function createRangedAttackResolutionState(
  state: GameStateForVisibility,
  overrides?: Partial<RangedAttackResolutionState>,
): RangedAttackResolutionState {
  return {
    attackApplyState: 'pending',
    attackingCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.black.inPlay!,
      commitmentType: 'completed',
    },
    attackingUnit: createTestUnit('black', { attack: 2 }),
    commandResolutionType: 'rangedAttack' as const,
    completed: false,
    defendingCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.white.inPlay!,
      commitmentType: 'completed',
    },
    defendingUnit: createTestUnit('white', { attack: 2 }),
    substepType: 'commandResolution' as const,
    supportingUnits: [],
    ...overrides,
  };
}

/**
 * Creates a MeleeResolutionState with sensible defaults (standard board).
 */
export function createMeleeResolutionState(
  state: GameStateForVisibility,
  overrides?: Partial<MeleeResolutionState>,
): MeleeResolutionState {
  return {
    blackAttackApplyState: 'pending',
    blackCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.black.inPlay!,
      commitmentType: 'completed',
    },
    completed: false,
    location: 'E-5',
    substepType: 'meleeResolution' as const,
    whiteAttackApplyState: 'pending',
    whiteCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.white.inPlay!,
      commitmentType: 'completed',
    },
    ...overrides,
  };
}
