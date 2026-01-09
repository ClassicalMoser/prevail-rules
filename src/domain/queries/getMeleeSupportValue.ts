import type { Board, UnitWithPlacement } from '@entities';
import { diagonalIsClear, hasEngagedUnits } from '@validation';
import {
  getAdjacentSpaces,
  getBoardSpace,
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
  const adjacentSpaces = getAdjacentSpaces(board, unitCoordinate);
  const spacesBehind = getSpacesBehind(board, unitCoordinate, unitFacing);
  const adjacentSpacesNotBehind = Array.from(adjacentSpaces).filter(
    (space) => !spacesBehind.has(space),
  );

  // Collect unengaged friendly units;
  // - check engagement first to avoid unnecessary unit lookups
  // - filter out spaces behind the primary unit
  // - filter out units diagonally blocked by enemy units
  const potentialSupportUnits: UnitWithPlacement<Board>[] = [];
  for (const space of adjacentSpacesNotBehind) {
    const boardSpace = getBoardSpace(board, space);
    // Skip engaged units - they cannot provide support
    if (hasEngagedUnits(boardSpace.unitPresence)) {
      continue;
    }
    // Otherwise, get the friendly unit at the space
    const unit = getPlayerUnitWithPosition(board, space, playerSide);
    if (unit !== undefined) {
      // If the unit is found, make sure it is not diagonally blocked by enemy units
      const diagonalClear = diagonalIsClear(
        playerSide,
        board,
        unitCoordinate,
        space,
      );
      if (!diagonalClear.result) {
        // If it is not blocked, add it to the possible support units.
        potentialSupportUnits.push(unit);
      }
    }
  }

  // Calculate the support value
  let supportValue = 0;

  for (const potentialSupportUnit of potentialSupportUnits) {
    // Check if the support unit is facing the primary unit
    const frontSpaces = getFrontSpaces(
      board,
      potentialSupportUnit.placement.coordinate,
      potentialSupportUnit.placement.facing,
    );
    // If it is, add strong support of two
    if (frontSpaces.has(unitCoordinate)) {
      supportValue += 2;
      continue;
    }
    // If it is not, check if it is flanking the primary unit
    const flankingSpaces = getFlankingSpaces(
      board,
      potentialSupportUnit.placement.coordinate,
      potentialSupportUnit.placement.facing,
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
