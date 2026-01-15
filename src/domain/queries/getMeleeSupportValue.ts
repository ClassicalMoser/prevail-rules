import type { Board, UnitWithPlacement } from '@entities';
import { hasEngagedUnits, hasNoUnit } from '@entities';
import { diagonalIsClear } from '@validation';
import {
  getAdjacentSpaces,
  getBoardSpace,
  getDiagonallyAdjacentSpaces,
  getFlankingSpaces,
  getFrontSpaces,
  getSpacesBehind,
} from './boardSpace';
import { getPlayerUnitWithPosition } from './unitPresence';

export function getMeleeSupportValue(
  board: Board,
  unit: UnitWithPlacement<Board>,
): number {
  const playerSide = unit.unit.playerSide;
  const unitCoordinate = unit.placement.coordinate;
  const unitFacing = unit.placement.facing;
  // Get the adjacent spaces
  const adjacentSpaces = getAdjacentSpaces(board, unitCoordinate);
  // Get the spaces behind the primary unit
  const spacesBehind = getSpacesBehind(board, unitCoordinate, unitFacing);
  // Filter out the spaces behind the primary unit
  const adjacentSpacesNotBehind = Array.from(adjacentSpaces).filter(
    (space) => !spacesBehind.has(space),
  );

  // Collect unengaged friendly units that can provide support;
  // - check engagement first to avoid unnecessary unit lookups
  // - filter out spaces behind the primary unit
  // - filter out units diagonally blocked by enemy units
  const potentialSupportUnits: UnitWithPlacement<Board>[] = [];
  for (const space of adjacentSpacesNotBehind) {
    const boardSpace = getBoardSpace(board, space);
    // Skip spaces with no units or engaged units - they cannot provide support
    if (
      hasEngagedUnits(boardSpace.unitPresence) ||
      hasNoUnit(boardSpace.unitPresence)
    ) {
      continue;
    }

    // Otherwise, get the friendly unit at the space
    const unit = getPlayerUnitWithPosition(board, space, playerSide);
    if (unit === undefined) {
      // Unit is not found, skip
      continue;
    }
    // Check if the unit is diagonally adjacent to the primary unit
    const diagonalSpaces = getDiagonallyAdjacentSpaces(board, unitCoordinate);
    if (diagonalSpaces.has(space)) {
      // Unit is diagonally adjacent to the primary unit
      // Check if the diagonal is clear of enemy units blocking it
      const diagonalClear = diagonalIsClear(
        playerSide,
        board,
        unitCoordinate,
        space,
      );
      if (diagonalClear.result) {
        // Diagonal is clear, add the unit to the possible support units
        potentialSupportUnits.push(unit);
      }
    } else {
      // Unit is orthogonally adjacent to the primary unit
      // Add the unit to the possible support units
      potentialSupportUnits.push(unit);
    }
  }

  // Calculate the support value
  let supportValue = 0;

  // Check each potential support unit for support value
  for (const potentialSupportUnit of potentialSupportUnits) {
    // Get the support unit's coordinate and facing
    const supportCoordinate = potentialSupportUnit.placement.coordinate;
    const supportFacing = potentialSupportUnit.placement.facing;
    // Check if the support unit is facing the primary unit
    const frontSpaces = getFrontSpaces(board, supportCoordinate, supportFacing);
    // If it is, add strong support of two
    if (frontSpaces.has(unitCoordinate)) {
      supportValue += 2;
      continue;
    }
    // If it is not, check if it is flanking the primary unit
    const flankingSpaces = getFlankingSpaces(
      board,
      supportCoordinate,
      supportFacing,
    );
    // If it is, add weak support of one
    if (flankingSpaces.has(unitCoordinate)) {
      supportValue += 1;
      continue;
    }
    // Otherwise, no support
    continue;
  }

  // Return the total support value
  return supportValue;
}
