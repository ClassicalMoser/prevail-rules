import type { Board, UnitWithPlacement } from '@entities';
import { hasEngagedUnits } from '@validation';
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

  // Collect unengaged friendly units - check engagement first to avoid unnecessary unit lookups
  const potentialSupportUnits: UnitWithPlacement<Board>[] = [];
  for (const space of adjacentSpacesNotBehind) {
    const boardSpace = getBoardSpace(board, space);
    // Skip engaged units - they cannot provide support
    if (hasEngagedUnits(boardSpace.unitPresence)) {
      continue;
    }
    // Otherwise, get the friendly unit at the space
    const unit = getPlayerUnitWithPosition(board, space, playerSide);
    // If the unit is found, add it to the potential support units
    if (unit !== undefined) {
      potentialSupportUnits.push(unit);
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
