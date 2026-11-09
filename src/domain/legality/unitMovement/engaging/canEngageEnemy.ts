import type { Board, Coordinate, PlayerSide, UnitFacing } from '@entities';
import {
  getBoardSpace,
  getNeighbourSide,
  getSpacesBehind,
  hasSingleUnit,
  isFriendlyUnit,
} from '@queries';
import { getEngagementEndFacing } from './getEngagementEndFacing';

/**
 * Incremental function to check whether engagement is legal from an adjacent space.
 *
 * @param unitSide - The side of the unit attempting to engage
 * @param board - The board object
 * @param destinationCoordinate - The coordinate to check if we can engage an enemy at
 * @param adjacentCoordinate - The coordinate at the time of this check (where we're moving from)
 * @param moveStartCoordinate - The coordinate at the beginning of the move
 * @param currentFacing - The facing of the unit at the time of this check
 * @param remainingFlexibility - The remaining flexibility at the time of this check
 * @returns True if we can engage an enemy at the given coordinate with the given facing, false otherwise
 */
export function canEngageEnemy(
  unitSide: PlayerSide,
  board: Board,
  destinationCoordinate: Coordinate,
  adjacentCoordinate: Coordinate,
  moveStartCoordinate: Coordinate,
  currentFacing: UnitFacing,
  remainingFlexibility: number,
): boolean {
  try {
    // Check if the destination has an enemy unit
    const destinationSpace = getBoardSpace(board, destinationCoordinate);
    if (
      !hasSingleUnit(destinationSpace.unitPresence) ||
      isFriendlyUnit(destinationSpace.unitPresence.unit, unitSide)
    ) {
      // Destination space is not a single enemy unit
      // So we can't engage an enemy here
      return false;
    }

    // Which of the defender's spaces the step left decides whether this
    // engagement is legal (§6.2).
    const approach = getNeighbourSide(
      board,
      destinationCoordinate,
      destinationSpace.unitPresence.facing,
      adjacentCoordinate,
    );

    // From a flanking space: always allowed. The defender will be dragged
    // round to face the attacker (§6.2.1).
    if (approach === 'flank') {
      return true;
    }

    // From a back space: only if the move began behind the defender. A unit
    // cannot loop round a flank and take it in the rear in one order (§6.2.2).
    if (approach === 'back') {
      const startedBehind = getSpacesBehind(
        board,
        destinationCoordinate,
        destinationSpace.unitPresence.facing,
      ).has(moveStartCoordinate);
      return startedBehind;
    }

    // From a front space: only if the unit can square up head-on as it
    // closes, which costs a point unless it already faces that way
    // (§6.2.3). `getEngagementEndFacing` says what squaring costs.
    if (approach === 'front') {
      const squaring = getEngagementEndFacing(
        board,
        destinationCoordinate,
        adjacentCoordinate,
        currentFacing,
      );
      const canSquareUp =
        squaring !== undefined &&
        squaring.flexibilitySpent <= remainingFlexibility;
      return canSquareUp;
    }

    // Not stepping in from next to the defender at all.
    return false;
  } catch {
    // Any error means we cannot engage the enemy.
    // TODO(wrong): this catch wraps the whole body, so a fault in the state
    // (not a rule) is answered as "this engagement is not legal". Settled by
    // listing which throws are expected negatives (off-board lookups) and
    // letting the rest through, or by reporting the message as `isValidLine`
    // does. See AUDIT.md `legality`.
    return false;
  }
}
