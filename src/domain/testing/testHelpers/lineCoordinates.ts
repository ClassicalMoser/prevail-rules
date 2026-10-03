import type { Coordinate, Line, UnitWithPlacement } from '@entities';

/**
 * Coordinates of the units in a line, in the order the line holds them.
 */
export function coordinatesOfLine(line: Line): Coordinate[] {
  const coordinates = line.unitPlacements.map(
    (withPlacement) => withPlacement.placement.coordinate,
  );
  return coordinates;
}

/**
 * Coordinates of each line in a set, in set iteration order.
 */
export function coordinatesOfLines(lines: Set<Line>): Coordinate[][] {
  const coordinates = [...lines].map((line) => coordinatesOfLine(line));
  return coordinates;
}

/**
 * Coordinates of units in a contiguous segment, in segment order.
 */
export function coordinatesOfSegment(
  segment: UnitWithPlacement[],
): Coordinate[] {
  const coordinates = segment.map(
    (withPlacement) => withPlacement.placement.coordinate,
  );
  return coordinates;
}
