import type {
  CommandResolutionState,
  GameState,
  MeleeResolutionState,
  StandardBoard,
} from '@entities';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a MovementResolutionState with sensible defaults.
 */
export function createMovementResolutionState(
  state: GameState<StandardBoard>,
  overrides?: Partial<
    Extract<
      CommandResolutionState<StandardBoard>,
      { commandResolutionType: 'movement' }
    >
  >,
): Extract<
  CommandResolutionState<StandardBoard>,
  { commandResolutionType: 'movement' }
> {
  return {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'movement' as const,
    movingUnit: {
      unit: createTestUnit('black', { attack: 2 }),
      placement: { coordinate: 'E-5', facing: 'north' },
    },
    targetPlacement: { coordinate: 'E-6', facing: 'north' },
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
 * Creates a RangedAttackResolutionState with sensible defaults.
 */
export function createRangedAttackResolutionState(
  state: GameState<StandardBoard>,
  overrides?: Partial<
    Extract<
      CommandResolutionState<StandardBoard>,
      { commandResolutionType: 'rangedAttack' }
    >
  >,
): Extract<
  CommandResolutionState<StandardBoard>,
  { commandResolutionType: 'rangedAttack' }
> {
  return {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'rangedAttack' as const,
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
 * Creates a MeleeResolutionState with sensible defaults.
 */
export function createMeleeResolutionState(
  state: GameState<StandardBoard>,
  overrides?: Partial<MeleeResolutionState<StandardBoard>>,
): MeleeResolutionState<StandardBoard> {
  return {
    substepType: 'meleeResolution' as const,
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
