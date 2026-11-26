import type { GameState, MovementResolutionState } from '@game';
import { createTestUnit } from '@testing/unitHelpers';
import { completedCommitment } from './completedCommitment';

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
    movingUnit: createTestUnit('black', { attack: 2 }),
    substepType: 'commandResolution' as const,
    targetPlacement: {
      coordinate: 'E-6',
      facing: 'north',
    },
    ...overrides,
  };
}
