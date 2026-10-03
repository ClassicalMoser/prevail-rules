import type { UnitWithPlacement } from '@entities';

/**
 * Index of `unit` in a contiguous segment, by its placement coordinate.
 * A line segment holds at most one unit per space.
 *
 * @param segment - Contiguous units already ordered along the line
 * @param unit - The unit whose place in the segment is needed
 * @returns The index of that unit in `segment`
 * @throws {Error} If no unit in the segment occupies that coordinate
 */
export function indexOfUnitInSegment(
  segment: UnitWithPlacement[],
  unit: UnitWithPlacement,
): number {
  const coordinate = unit.placement.coordinate;
  const unitIndex = segment.findIndex(
    (withPlacement) => withPlacement.placement.coordinate === coordinate,
  );
  if (unitIndex === -1) {
    throw new Error('Unit is not in the segment');
  }
  return unitIndex;
}
