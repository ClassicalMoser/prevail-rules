import type { Line, UnitWithPlacement } from '@entities';
import { MAX_LINE_LENGTH } from '@ruleValues';

import { indexOfUnitInSegment } from './indexOfUnitInSegment';

/**
 * Lines of at most {@link MAX_LINE_LENGTH} units taken from a contiguous
 * segment, each still containing `unit`.
 *
 * A short segment is one line. A longer segment slides an eight-unit window
 * across every start that keeps that unit inside the window.
 *
 * @param segment - Contiguous units already ordered along the line
 * @param unit - The unit that must appear in every line
 * @returns The set of lines that include that unit
 * @throws {Error} If `unit` is not in the segment
 */
export function linesIncludingUnitFromSegment(
  segment: UnitWithPlacement[],
  unit: UnitWithPlacement,
): Set<Line> {
  const lines = new Set<Line>();
  const unitIndex = indexOfUnitInSegment(segment, unit);

  // If the segment fits, it is a single valid line.
  if (segment.length <= MAX_LINE_LENGTH) {
    const line: Line = { unitPlacements: segment };
    lines.add(line);
    return lines;
  }

  // Slide a MAX_LINE_LENGTH-unit window across starts that still include the unit.
  const maxStart = Math.min(unitIndex, segment.length - MAX_LINE_LENGTH);
  const minStart = Math.max(0, unitIndex - (MAX_LINE_LENGTH - 1));

  for (let start = minStart; start <= maxStart; start++) {
    const end = start + MAX_LINE_LENGTH;
    const unitPlacements = segment.slice(start, end);
    const line: Line = { unitPlacements };
    lines.add(line);
  }

  return lines;
}
