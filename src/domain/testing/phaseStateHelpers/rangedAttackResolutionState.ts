import type { GameState, RangedAttackResolutionState } from '@game';
import { createTestUnit } from '@testing/unitHelpers';
import { completedCommitment } from './completedCommitment';

/**
 * Creates a RangedAttackResolutionState with sensible defaults (standard board).
 */
export function createRangedAttackResolutionState(
  state: GameState,
  overrides?: Partial<RangedAttackResolutionState>,
): RangedAttackResolutionState {
  const rangedAttack: RangedAttackResolutionState = {
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
  return rangedAttack;
}
