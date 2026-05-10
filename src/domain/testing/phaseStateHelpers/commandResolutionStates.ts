import type { StandardBoard } from '@entities';
import type {
  GameStateForBoard,
  MeleeResolutionStateForBoard,
  MovementResolutionStateForBoard,
  RangedAttackResolutionStateForBoard,
} from '@game';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a MovementResolutionState with sensible defaults (standard board).
 */
export function createMovementResolutionState(
  state: GameStateForBoard<StandardBoard>,
  overrides?: Partial<MovementResolutionStateForBoard<StandardBoard>>,
): MovementResolutionStateForBoard<StandardBoard> {
  return {
    boardType: 'standard' as const,
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
    engagementState: undefined,
    moveCommander: false,
    movingUnit: {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: createTestUnit('black', { attack: 2 }),
    },
    substepType: 'commandResolution' as const,
    targetPlacement: {
      boardType: 'standard' as const,
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
  state: GameStateForBoard<StandardBoard>,
  overrides?: Partial<RangedAttackResolutionStateForBoard<StandardBoard>>,
): RangedAttackResolutionStateForBoard<StandardBoard> {
  return {
    attackApplyState: undefined,
    attackingCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.black.inPlay!,
      commitmentType: 'completed',
    },
    attackingUnit: createTestUnit('black', { attack: 2 }),
    boardType: 'standard' as const,
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
    supportingUnits: new Set(),
    ...overrides,
  };
}

/**
 * Creates a MeleeResolutionState with sensible defaults (standard board).
 */
export function createMeleeResolutionState(
  state: GameStateForBoard<StandardBoard>,
  overrides?: Partial<MeleeResolutionStateForBoard<StandardBoard>>,
): MeleeResolutionStateForBoard<StandardBoard> {
  return {
    blackAttackApplyState: undefined,
    blackCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.black.inPlay!,
      commitmentType: 'completed',
    },
    boardType: 'standard' as const,
    completed: false,
    location: 'E-5',
    substepType: 'meleeResolution' as const,
    whiteAttackApplyState: undefined,
    whiteCommitment: {
      // Valid assertion, see note in createMovementResolutionState.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      card: state.cardState.white.inPlay!,
      commitmentType: 'completed',
    },
    ...overrides,
  };
}
