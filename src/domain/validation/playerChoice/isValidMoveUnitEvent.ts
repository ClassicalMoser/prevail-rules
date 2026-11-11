import type { ValidationResult } from '@utils';
import type { MoveUnitEvent } from '@events';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getMovementResolutionState,
  modifiersFromCompletedCommitment,
} from '@queries';
import { isValidMovePath } from './isValidMovePath';

/**
 * Validates a MoveUnitEvent: the move for the unit its `chooseMovingUnit`
 * named, written after its commitment (§4.3.10).
 * - the movement is waiting for its move, and it is this player's unit
 * - {@link isValidMovePath} accepts the path, counting the committed card
 * - `moveCommander` only when the player's commander shares the unit's space
 */
export function isValidMoveUnitEvent(
  event: MoveUnitEvent,
  state: GameState,
): ValidationResult {
  const movement = getMovementResolutionState(state);
  if (movement.targetPlacement !== 'pending') {
    return {
      errorReason: 'This unit has already moved',
      result: false,
    };
  }
  const mover = movement.movingUnit;
  if (mover.unit.playerSide !== event.player) {
    return {
      errorReason: `Expected the move from ${mover.unit.playerSide}, got ${event.player}`,
      result: false,
    };
  }

  // The path must be a legal move, every step and turn of it, with
  // the card committed for it counted (§4.3.10).
  const pathValid = isValidMovePath(
    state,
    mover,
    event.path,
    'advance',
    modifiersFromCompletedCommitment(movement.commitment),
  );
  if (!pathValid.result) {
    return pathValid;
  }

  // Only a commander standing with the unit can ride along.
  if (event.moveCommander) {
    const space = getBoardSpace(state.boardState, mover.placement.coordinate);
    if (!space.commanders.includes(event.player)) {
      return {
        errorReason: `Cannot move commander with unit: commander not at ${mover.placement.coordinate}`,
        result: false,
      };
    }
  }

  return { result: true };
}
