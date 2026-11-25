import type { UnitWithPlacement } from '@entities';
import type { Coordinate } from '@ruleValues';

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
