import type { Coordinate, UnitWithPlacement } from '@entities';

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
