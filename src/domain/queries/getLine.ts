import type {
  Board,
  BoardCoordinate,
  Line,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import type { Trait } from '@ruleValues';
import { MAX_LINE_LENGTH } from '@ruleValues';
import { isAtPlacement, matchesUnitRequirements } from '@validation';
import { getForwardSpacesToEdge } from './boardSpace';
import { getLeftFacing, getOppositeFacing, getRightFacing } from './facings';
import { getPlayerUnitWithPosition } from './unitPresence';

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
 * @param traits - Optional trait requirements (units must have all traits)
 * @param unitTypes - Optional unit type requirements (units must be one of these types)
 * @returns Set of all lines that include the given unit
 * @throws {Error} If the unit is not at its reported placement
 */
export function getLinesFromUnit<TBoard extends Board>(
  board: TBoard,
  unit: UnitWithPlacement<TBoard>,
  traits: Trait[] = [],
  unitTypes: UnitType[] = [],
): Set<Line> {
  // Validate that the unit is actually at the reported position
  const { result: isAtPlacementResult } = isAtPlacement(board, unit);
  if (!isAtPlacementResult) {
    throw new Error('Unit is not at reported placement');
  }

  const friendlySide = unit.unit.playerSide;
  const lines = new Set<Line>();
  const unitFacing = unit.placement.facing;
  const oppositeUnitFacing = getOppositeFacing(unitFacing);

  // Get the two directions along the perpendicular line (left and right relative to facing)
  // Example: If unit faces "north", left is "west" and right is "east"
  const leftDirection = getLeftFacing(unitFacing);
  const rightDirection = getRightFacing(unitFacing);

  /**
   * Check if a unit at the given coordinate can join the line.
   * Returns:
   * - The unit if it can join (friendly, correct facing, matches requirements)
   * - undefined if we should stop expanding (empty space, enemy unit, wrong facing, or doesn't match requirements)
   */
  const canJoinLine = (
    coordinate: BoardCoordinate<TBoard>,
  ): UnitWithPlacement<TBoard> | undefined => {
    const playerUnit = getPlayerUnitWithPosition(
      board,
      coordinate,
      friendlySide,
    );
    // No friendly unit: stop expanding (empty space or enemy unit)
    if (!playerUnit) {
      return undefined;
    }

    // Check facing: must match our unit's facing or its opposite
    const playerFacing = playerUnit.placement.facing;
    if (playerFacing !== unitFacing && playerFacing !== oppositeUnitFacing) {
      // Wrong facing: stop expanding
      return undefined;
    }

    // Check requirements: must match traits/unitTypes if specified
    const { result: matchesUnitRequirementsResult } = matchesUnitRequirements(
      playerUnit.unit.unitType,
      traits,
      unitTypes.map((unitType) => unitType.id),
    );
    if (!matchesUnitRequirementsResult) {
      // Doesn't match requirements: stop expanding
      return undefined;
    }

    // Unit matches all requirements: can join
    return playerUnit;
  };

  // Build the contiguous segment containing our unit
  // Structure: [units left] + [our unit] + [units right]
  const segment: UnitWithPlacement<TBoard>[] = [unit];

  // Tracking where the unit will end up in the segment
  let unitIndex = 0;

  // Expand leftward: add units sequentially to the beginning of the segment
  // Stop immediately when we hit: empty space, enemy unit, wrong facing, or non-matching requirements
  for (const coordinate of getForwardSpacesToEdge(
    board,
    unit.placement.coordinate,
    leftDirection,
  )) {
    const joiningUnit = canJoinLine(coordinate);
    if (!joiningUnit) {
      break;
    }
    // Add the unit to the beginning of the segment
    segment.unshift(joiningUnit);
    unitIndex++;
  }

  // Expand rightward: add units sequentially to the end of the segment
  // Stop immediately when we hit: empty space, enemy unit, wrong facing, or non-matching requirements
  for (const coordinate of getForwardSpacesToEdge(
    board,
    unit.placement.coordinate,
    rightDirection,
  )) {
    const joiningUnit = canJoinLine(coordinate);
    if (!joiningUnit) {
      break;
    }
    // Add the unit to the end of the segment
    segment.push(joiningUnit);
  }

  // If segment fits (≤MAX_LINE_LENGTH units), it's a single valid line
  if (segment.length <= MAX_LINE_LENGTH) {
    lines.add({ unitPlacements: segment });
    return lines;
  }

  // Segment is longer than MAX_LINE_LENGTH units: create multiple MAX_LINE_LENGTH-unit lines
  // Each line must include our unit, so we slide a MAX_LINE_LENGTH-unit window across the segment
  // Our unit is at index leftCount, so we calculate valid window start positions
  const maxStart = Math.min(unitIndex, segment.length - MAX_LINE_LENGTH);
  const minStart = Math.max(0, unitIndex - (MAX_LINE_LENGTH - 1));

  for (let start = minStart; start <= maxStart; start++) {
    lines.add({
      unitPlacements: segment.slice(start, start + MAX_LINE_LENGTH),
    });
  }

  return lines;
}
