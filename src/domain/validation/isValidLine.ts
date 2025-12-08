import type { Board, BoardCoordinate, Line } from '@entities';
import { areSameSide, getFlankingSpaces, getOppositeFacing } from '@queries';
import { MAX_LINE_LENGTH } from '@ruleValues';

/**
 * Determines whether a line is valid according to game rules.
 *
 * A valid line must:
 * - Have between 1 and MAX_LINE_LENGTH units
 * - All units must be on the same side (friendly)
 * - All units must face the same or opposite direction
 * - Units must be contiguous (adjacent to each other)
 *
 * @param board - The board state (needed to check adjacency)
 * @param line - The line to validate
 * @returns True if the line is valid, false otherwise
 */
export function isValidLine<TBoard extends Board>(
  board: TBoard,
  line: Line,
): boolean {
  try {
    const { unitPlacements } = line;

    // Check length: must have at least 1 unit and at most MAX_LINE_LENGTH
    if (
      unitPlacements.length === 0 ||
      unitPlacements.length > MAX_LINE_LENGTH
    ) {
      return false;
    }

    // If only one unit, it's valid (no further checks needed)
    if (unitPlacements.length === 1) {
      return true;
    }

    const firstUnit = unitPlacements[0]!;
    const firstFacing = firstUnit.placement.facing;
    const oppositeFacing = getOppositeFacing(firstFacing);

    // Check all units are same side and face same/opposite direction
    for (let i = 1; i < unitPlacements.length; i++) {
      const unit = unitPlacements[i]!;

      // Check same side
      if (!areSameSide(firstUnit.unit, unit.unit)) {
        return false;
      }

      // Check facing: must match first unit's facing or its opposite
      const unitFacing = unit.placement.facing;
      if (unitFacing !== firstFacing && unitFacing !== oppositeFacing) {
        return false;
      }
    }

    // Check contiguity: each unit must be in the flanking spaces of the previous unit
    // Lines form perpendicular to a unit's facing, so units must be in flanking spaces
    for (let i = 0; i < unitPlacements.length - 1; i++) {
      const currentUnit = unitPlacements[i]!;
      const nextCoord = unitPlacements[i + 1]!.placement
        .coordinate as BoardCoordinate<TBoard>;
      const currentCoord = currentUnit.placement
        .coordinate as BoardCoordinate<TBoard>;
      const currentFacing = currentUnit.placement.facing;

      const flankingSpaces = getFlankingSpaces(
        board,
        currentCoord,
        currentFacing,
      );
      if (!flankingSpaces.has(nextCoord)) {
        return false;
      }
    }

    return true;
  } catch {
    // Any error means the line is invalid
    return false;
  }
}
