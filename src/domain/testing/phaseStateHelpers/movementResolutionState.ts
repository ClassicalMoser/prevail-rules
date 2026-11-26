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
  const movement: MovementResolutionState = {
    commandResolutionType: 'movement' as const,
    // Black's commitment to the move is already made (§4.3.10).
    commitment: completedCommitment(state.cardState.black.inPlay),
    completed: false,
    // The move has not met an enemy yet.
    engagementState: 'pending',
    // Black's commander stays where it is rather than riding along.
    moveCommander: false,
    // A stand-in Black unit. It is not put on the board: a spec that needs
    // the mover standing somewhere places it and passes it here.
    movingUnit: createTestUnit('black', { attack: 2 }),
    substepType: 'commandResolution' as const,
    // Where the move ends, one space north of the usual E-5.
    targetPlacement: {
      coordinate: 'E-6',
      facing: 'north',
    },
    ...overrides,
  };

  // The move under way, for `createIssueCommandsPhaseState` to carry.
  return movement;
}
