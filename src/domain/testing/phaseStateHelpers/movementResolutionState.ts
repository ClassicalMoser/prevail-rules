import { createOpenedMovementResolutionState } from '@factories';
import type { GameState, MovementResolutionState } from '@game';
import { createTestUnit } from '@testing/unitHelpers';
import { completedCommitment } from './completedCommitment';

/**
 * A Black unit's move under way: the move as it opens, with the commitment
 * made and the move written, one space north of E-5.
 *
 * @param state - The game, for the card Black commits
 * @param overrides - What a spec sets beyond that
 * @returns The move under way, for `createIssueCommandsPhaseState` to carry
 */
export function createMovementResolutionState(
  state: GameState,
  overrides?: Partial<MovementResolutionState>,
): MovementResolutionState {
  // A stand-in Black unit. It is not put on the board: a spec that needs
  // the mover standing somewhere places it and passes it here.
  const mover = createTestUnit('black', { attack: 2 });

  const movement: MovementResolutionState = {
    // The move has not met an enemy yet.
    ...createOpenedMovementResolutionState(mover),
    // Black's commitment to the move is already made (§4.3.10).
    commitment: completedCommitment(state.cardState.black.inPlay),
    // Black's commander stays where it is rather than riding along.
    moveCommander: false,
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
