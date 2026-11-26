import type { UnitInstance } from '@entities';
import type { MovementResolutionState } from '@game';

/**
 * A unit's move the moment it is named to move (§4.3.10): its owner may
 * commit a card first, and the card counts toward the move, so the
 * commitment is owed and nothing of the move itself is written yet.
 *
 * @param movingUnit - The unit that moves, as the board holds it
 * @returns The movement resolution substep, open and unwritten
 */
export function createOpenedMovementResolutionState(
  movingUnit: UnitInstance,
): MovementResolutionState {
  const movement: MovementResolutionState = {
    commandResolutionType: 'movement',
    commitment: { commitmentType: 'pending' },
    completed: false,
    // Whether the move walks into an enemy is known only once it is written.
    engagementState: 'pending',
    // Whether a commander rides along is declared with the move (§4.3.10).
    moveCommander: 'pending',
    movingUnit,
    substepType: 'commandResolution',
    targetPlacement: 'pending',
  };

  // The move, waiting on its owner's commitment.
  return movement;
}
