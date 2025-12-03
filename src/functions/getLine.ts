import type {
  Board,
  Line,
  Trait,
  UnitType,
  UnitWithPlacement,
} from "@entities";
import {
  areSameSide,
  getInlineSpaces,
  getOppositeFacing,
  getPlayerUnitWithPosition,
} from "@functions";
import { isAtPlacement, matchesUnitRequirements } from "@validation";

/** Get the lines from a unit.
 * A line is a group of up to 8 friendly units that are exactly beside each other
 * and facing either the same direction or the opposite direction.
 *
 * For any given unit, there are up to 8 possible lines, one for each position the
 * unit itself could potentially occupy
 *
 * We need a way to iterate over all possible lines and return the set of all eligible lines.
 */

export function getLinesFromUnit(
  board: Board,
  unit: UnitWithPlacement<Board>,
  traits: Trait[] = [],
  unitTypes: UnitType[] = [],
): Set<Line> {
  const notAtPlacement = !isAtPlacement(board, unit);
  if (notAtPlacement) {
    throw new Error("Unit is not at reported placement");
  }

  const friendlySide = unit.unit.playerSide;
  const lines = new Set<Line>();

  // Only consider the unit's actual facing and its opposite
  const unitFacing = unit.placement.facing;
  const oppositeFacing = getOppositeFacing(unitFacing);
  const facingsToCheck = [unitFacing, oppositeFacing];

  for (const potentialFacing of facingsToCheck) {
    // Get all spaces in a straight line perpendicular to this facing (the "inline" spaces)
    const inlineSpaces = getInlineSpaces(
      board,
      unit.placement.coordinate,
      potentialFacing,
    );

    // Build contiguous segments - gaps break the line
    const contiguousSegments: UnitWithPlacement<Board>[][] = [];
    let currentSegment: UnitWithPlacement<Board>[] = [];

    for (const coordinate of inlineSpaces) {
      try {
        const playerUnit = getPlayerUnitWithPosition(
          board,
          coordinate,
          friendlySide,
        );

        // If there's no friendly unit, it breaks the current segment
        if (!playerUnit) {
          if (currentSegment.length > 0) {
            contiguousSegments.push(currentSegment);
            currentSegment = [];
          }
          continue;
        }

        // Check if facing matches (same or opposite direction)
        const facingMatches =
          playerUnit.placement.facing === potentialFacing ||
          playerUnit.placement.facing === getOppositeFacing(potentialFacing);

        if (facingMatches) {
          // Check if unit matches requirements (traits/unitTypes)
          if (
            matchesUnitRequirements(playerUnit.unit.unitType, traits, unitTypes)
          ) {
            currentSegment.push(playerUnit);
          } else {
            // Unit doesn't match requirements - breaks the line
            if (currentSegment.length > 0) {
              contiguousSegments.push(currentSegment);
              currentSegment = [];
            }
          }
        } else {
          // Facing doesn't match - breaks the line
          if (currentSegment.length > 0) {
            contiguousSegments.push(currentSegment);
            currentSegment = [];
          }
        }
      } catch {
        // If coordinate doesn't exist, it breaks the line
        if (currentSegment.length > 0) {
          contiguousSegments.push(currentSegment);
          currentSegment = [];
        }
      }
    }

    // Don't forget the last segment
    if (currentSegment.length > 0) {
      contiguousSegments.push(currentSegment);
    }

    // Process each contiguous segment
    for (const segment of contiguousSegments) {
      // Find the index of the given unit in this segment
      const unitIndex = segment.findIndex(
        (u) =>
          areSameSide(u.unit, unit.unit) &&
          u.unit.unitType === unit.unit.unitType &&
          u.unit.instanceNumber === unit.unit.instanceNumber &&
          u.placement.coordinate === unit.placement.coordinate,
      );

      // If the unit is not in this segment, skip it
      if (unitIndex === -1) {
        continue;
      }

      // If segment is 1-8 units, add it as a single line
      if (segment.length <= 8) {
        lines.add({ unitPlacements: segment });
      } else {
        // If segment is longer than 8 units, create all possible 8-unit lines that include the given unit
        // The unit can be at positions 0-7 within each 8-unit window
        const maxStart = Math.min(unitIndex, segment.length - 8);
        const minStart = Math.max(0, unitIndex - 7);

        for (let start = minStart; start <= maxStart; start++) {
          const end = start + 8;
          const lineSegment = segment.slice(start, end);
          lines.add({ unitPlacements: lineSegment });
        }
      }
    }
  }

  return lines;
}
