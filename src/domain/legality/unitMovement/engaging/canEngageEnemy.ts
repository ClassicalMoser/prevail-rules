import type { Board, Coordinate, PlayerSide } from '@entities';
import {
  getBoardSpace,
  findNeighbourSide,
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
 * @param remainingFlexibility - The remaining flexibility at the time of this check
 * @returns True if we can engage an enemy at the given coordinate with the given facing, false otherwise
 * @throws Error when the coordinate is not on the board: the caller names a
 * space it has already found, so an absent one is a fault, not a refusal
 */
export function canEngageEnemy(
  unitSide: PlayerSide,
  board: Board,
  destinationCoordinate: Coordinate,
  adjacentCoordinate: Coordinate,
  moveStartCoordinate: Coordinate,
  remainingFlexibility: number,
): boolean {
  // Check if the destination has an enemy unit
  // An engagement is made by stepping into a space held by a single enemy
  // (§6.1.1). Open ground is not an engagement, an engaged space may not be
  // entered at all (§2.2.3), and a friend's space is never a place to stop
  // (§5.3).
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
  const approach = findNeighbourSide(
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
    // Behind means the whole half of the board beyond the defender's back
    // rank, not a narrow wedge (§2.3.3).
    const behindDefender = getSpacesBehind(
      board,
      destinationCoordinate,
      destinationSpace.unitPresence.facing,
    );
    const startedBehind = behindDefender.has(moveStartCoordinate);
    return startedBehind;
  }

  // From a front space: only if the unit can square up head-on as it
  // closes, which costs a point unless it already faces that way
  // (§6.2.3). `getEngagementEndFacing` says what squaring costs.
  // (Were this test dropped, a step from a space that is not a neighbour
  // would still be refused: `getEngagementEndFacing` finds no squaring for
  // it.)
  if (approach === 'front') {
    const squaring = getEngagementEndFacing(
      board,
      destinationCoordinate,
      adjacentCoordinate,
    );
    // `squaring` is never absent here, since a lone defender and a
    // neighbouring space were both settled above; the test is for the type.
    // A square approach costs nothing; an oblique one needs a point left.
    const canSquareUp =
      squaring !== undefined &&
      (squaring.squaringTurn === null || remainingFlexibility > 0);
    return canSquareUp;
  }

  // Not stepping in from next to the defender at all.
  return false;
}
