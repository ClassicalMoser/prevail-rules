import type { UnitWithPlacement } from '@entities';
import type { Coordinate } from '@ruleValues';

/**
 * Coordinates of units in a contiguous segment, in segment order.
 */
export function coordinatesOfSegment(
  segment: UnitWithPlacement[],
): Coordinate[] {
  // Where each unit of the stretch stands, so a spec about which units a
  // line takes in (§4.3.5) can compare spaces rather than whole units.
  const coordinates = segment.map(
    (withPlacement) => withPlacement.placement.coordinate,
  );

  // The spaces, in the stretch's own order.
  return coordinates;
}
