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
    // The shot has not landed yet, so nothing has happened to the target.
    attackApplyState: 'pending',
    // Black shoots, and has already committed (§4.3.11, step 2).
    attackingCommitment: completedCommitment(state.cardState.black.inPlay),
    attackingUnit: createTestUnit('black', { attack: 2 }),
    commandResolutionType: 'rangedAttack' as const,
    completed: false,
    // White is shot at, and has already committed for its defence (step 5).
    defendingCommitment: completedCommitment(state.cardState.white.inPlay),
    defendingUnit: createTestUnit('white', { attack: 2 }),
    substepType: 'commandResolution' as const,
    // Nobody else from the order adds to the shot (§7.3.4).
    supportingUnits: [],
    ...overrides,
  };

  // The shot under way, for `createIssueCommandsPhaseState` to carry.
  return rangedAttack;
}
