import type { Board, Line, UnitType, UnitWithPlacement } from '@entities';
import { isAtPlacement } from '@queries/unitPresence';
import type { Trait } from '@ruleValues';

import { getLineSegmentContainingUnit } from './getLineSegmentContainingUnit';
import { linesIncludingUnitFromSegment } from './linesIncludingUnitFromSegment';

/**
 * Get all possible lines that include a given unit.
 *
 * A line is a group of up to MAX_LINE_LENGTH friendly units that are:
 * - Contiguous (no gaps between units)
 * - Facing the same or opposite direction
 * - Matching optional trait/unitType requirements
 *
 * Lines form perpendicular to a unit's facing. For example, a unit facing
 * "north" forms lines going "east-west" (perpendicular to north).
 *
 * If the contiguous segment is longer than MAX_LINE_LENGTH units,
 * multiple MAX_LINE_LENGTH-unit lines are generated,
 * each including the given unit.
 *
 * @param board - The board state
 * @param unit - The unit to find lines for
 * @param traitRequirements - Optional trait requirements (units must have all traits)
 * @param unitTypeRequirements - Optional unit type requirements (units must be one of these types)
 * @returns Set of all lines that include the given unit
 * @throws {Error} If the unit is not at its reported placement
 */
export function getLinesFromUnit(
  board: Board,
  unit: UnitWithPlacement,
  traitRequirements: Trait[] = [],
  unitTypeRequirements: UnitType[] = [],
): Set<Line> {
  // Validate that the unit is actually at the reported position
  const { result: isAtPlacementResult } = isAtPlacement(board, unit);
  if (!isAtPlacementResult) {
    throw new Error('Unit is not at reported placement');
  }

  // Whole contiguous segment, then the valid windows that still include this unit.
  const segment = getLineSegmentContainingUnit(
    board,
    unit,
    traitRequirements,
    unitTypeRequirements,
  );
  const lines = linesIncludingUnitFromSegment(segment, unit);
  return lines;
}
