import type { Board, UnitWithPlacement } from '@entities';
import {
  diagonalIsClear,
  getAdjacentSpaces,
  getBoardSpace,
  getDiagonallyAdjacentSpaces,
  findNeighbourSide,
  getBackSpaces,
} from '@queries/board';
import {
  findPlayerUnitWithPosition,
  hasEngagedUnits,
  hasNoUnit,
} from '@queries/unitPresence';

/**
 * What a fighter's friends add to its attack in melee (§7.3.1). A friend lends a
 * hand when it stands beside the fighter, not in its back spaces, free of a
 * fight of its own, and — on a diagonal — with the way between them open.
 * How much it lends depends on where the fighter lies from the friend's point
 * of view, and every qualifying friend counts (§7.3.2).
 *
 * @param board - The board as it stands at this fight (§7.3.3)
 * @param unit - The fighter and where it stands
 * @returns The fighter's total support
 */
export function getMeleeSupportValue(
  board: Board,
  unit: UnitWithPlacement,
): number {
  const { playerSide } = unit.unit;
  const unitCoordinate = unit.placement.coordinate;
  const unitFacing = unit.placement.facing;
  // Get the adjacent spaces
  const adjacentSpaces = getAdjacentSpaces(board, unitCoordinate);
  // A friend in one of the fighter's three back spaces lends nothing (§7.3.1).
  const backSpaces = getBackSpaces(board, unitCoordinate, unitFacing);
  const adjacentSpacesNotBack = [...adjacentSpaces].filter(
    (space) => !backSpaces.has(space),
  );

  // Collect unengaged friendly units that can provide support;
  // - check engagement first to avoid unnecessary unit lookups
  // - filter out the fighter's back spaces
  // - filter out units diagonally blocked by enemy units
  const potentialSupportUnits: UnitWithPlacement[] = [];
  for (const space of adjacentSpacesNotBack) {
    const boardSpace = getBoardSpace(board, space);
    // Skip spaces with no units or engaged units - they cannot provide support
    if (
      hasEngagedUnits(boardSpace.unitPresence) ||
      hasNoUnit(boardSpace.unitPresence)
    ) {
      continue;
    }

    // Otherwise, get the friendly unit at the space
    const friendlyUnit = findPlayerUnitWithPosition(board, space, playerSide);
    if (friendlyUnit === undefined) {
      // Unit is not friendly and so cannot support, skip
      continue;
    }
    // Check if the unit is diagonally adjacent to the primary unit
    const diagonalSpaces = getDiagonallyAdjacentSpaces(board, unitCoordinate);
    if (diagonalSpaces.has(space)) {
      // Unit is diagonally adjacent to the primary unit
      // Check if the diagonal is clear of enemy units blocking it
      if (diagonalIsClear(playerSide, board, unitCoordinate, space)) {
        // Diagonal is clear, add the unit to the possible support units
        potentialSupportUnits.push(friendlyUnit);
      } else {
        // Diagonal is blocked, skip
        continue;
      }
    } else {
      // Unit is orthogonally adjacent to the primary unit
      // Add the unit to the possible support units
      potentialSupportUnits.push(friendlyUnit);
    }
  }

  // Calculate the support value
  let supportValue = 0;

  // Each friend lends by where the fighter lies from its point of view: in
  // its front spaces, looking at it, +2; in its flanking spaces, off to a
  // side, +1; behind it, looking away, nothing.
  for (const potentialSupportUnit of potentialSupportUnits) {
    const side = findNeighbourSide(
      board,
      potentialSupportUnit.placement.coordinate,
      potentialSupportUnit.placement.facing,
      unitCoordinate,
    );
    if (side === 'front') {
      supportValue += 2;
    } else if (side === 'flank') {
      supportValue += 1;
    }
  }

  // Return the total support value
  return supportValue;
}
