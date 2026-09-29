import type { CommandCard } from '@entities';
import type {
  GameState,
  MeleeResolutionState,
  MovementResolutionState,
  RangedAttackResolutionState,
} from '@game';
import { createTestCard } from '../testHelpers/cardHelpers';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Completed commitment from the card the caller put in play.
 * When that pile is empty, the helper supplies its own +1 attack card.
 */
function completedCommitment(inPlay: CommandCard | null) {
  return {
    card: inPlay ?? createTestCard({ modifiers: ['attack'] }),
    commitmentType: 'completed' as const,
  };
}

/**
 * Creates a MovementResolutionState with sensible defaults (standard board).
 */
export function createMovementResolutionState(
  state: GameState,
  overrides?: Partial<MovementResolutionState>,
): MovementResolutionState {
  return {
    commandResolutionType: 'movement' as const,
    commitment: completedCommitment(state.cardState.black.inPlay),
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
  state: GameState,
  overrides?: Partial<RangedAttackResolutionState>,
): RangedAttackResolutionState {
  return {
    attackApplyState: 'pending',
    attackingCommitment: completedCommitment(state.cardState.black.inPlay),
    attackingUnit: createTestUnit('black', { attack: 2 }),
    commandResolutionType: 'rangedAttack' as const,
    completed: false,
    defendingCommitment: completedCommitment(state.cardState.white.inPlay),
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
  state: GameState,
  overrides?: Partial<MeleeResolutionState>,
): MeleeResolutionState {
  return {
    blackAttackApplyState: 'pending',
    blackCommitment: completedCommitment(state.cardState.black.inPlay),
    completed: false,
    location: 'E-5',
    substepType: 'meleeResolution' as const,
    whiteAttackApplyState: 'pending',
    whiteCommitment: completedCommitment(state.cardState.white.inPlay),
    ...overrides,
  };
}
