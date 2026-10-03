import type { Board, UnitType, UnitWithPlacement } from '@entities';
import { getForwardSpacesToEdge } from '@queries/board';
import {
  getLeftFacing,
  getOppositeFacing,
  getRightFacing,
} from '@queries/facings';
import type { Trait } from '@ruleValues';

import { canJoinLine } from './canJoinLine';

/**
 * Contiguous friendly segment that contains `unit`, along the perpendicular of
 * that unit's facing. Expansion stops at an empty space, an enemy, a wrong
 * facing, or a missed trait/type requirement.
 *
 * The segment is not capped at line length. Where `unit` sits in the segment,
 * and which windows are valid lines, are separate steps.
 *
 * @param board - The board state
 * @param unit - The unit the segment must include
 * @param traitRequirements - Traits every joining unit must have
 * @param unitTypeRequirements - Unit types a joining unit must be one of
 * @returns The contiguous segment, ordered left to right along the perpendicular
 */
export function getLineSegmentContainingUnit(
  board: Board,
  unit: UnitWithPlacement,
  traitRequirements: Trait[],
  unitTypeRequirements: UnitType[],
): UnitWithPlacement[] {
  const friendlySide = unit.unit.playerSide;
  const unitFacing = unit.placement.facing;
  const oppositeUnitFacing = getOppositeFacing(unitFacing);
  const coordinate = unit.placement.coordinate;

  // Left and right relative to facing. Facing north, left is west and right is east.
  const leftDirection = getLeftFacing(unitFacing);
  const rightDirection = getRightFacing(unitFacing);

  // Structure: [units left] + [our unit] + [units right]
  const segment: UnitWithPlacement[] = [unit];

  // Expand leftward. Stop at empty space, enemy, wrong facing, or missed requirements.
  const spacesToTheLeft = getForwardSpacesToEdge(
    board,
    coordinate,
    leftDirection,
  );
  for (const nextCoordinate of spacesToTheLeft) {
    const joiningUnit = canJoinLine(
      board,
      nextCoordinate,
      friendlySide,
      unitFacing,
      oppositeUnitFacing,
      traitRequirements,
      unitTypeRequirements,
    );
    if (joiningUnit === undefined) {
      break;
    }
    segment.unshift(joiningUnit);
  }

  // Expand rightward with the same stop conditions.
  const spacesToTheRight = getForwardSpacesToEdge(
    board,
    coordinate,
    rightDirection,
  );
  for (const nextCoordinate of spacesToTheRight) {
    const joiningUnit = canJoinLine(
      board,
      nextCoordinate,
      friendlySide,
      unitFacing,
      oppositeUnitFacing,
      traitRequirements,
      unitTypeRequirements,
    );
    if (joiningUnit === undefined) {
      break;
    }
    segment.push(joiningUnit);
  }

  return segment;
}
