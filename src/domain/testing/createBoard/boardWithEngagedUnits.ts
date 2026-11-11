import type { Board, Coordinate, UnitFacing, UnitInstance } from '@entities';
import { createEmptyStandardBoard } from '@factories';
import { getOppositeFacing } from '@queries';
import { addUnitToBoard } from '@transforms';

/**
 * Creates a board with engaged units at a coordinate: the primary unit
 * stands there, and the secondary is added facing it (§6.1), as a move into
 * an enemy does.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param secondaryUnit - The secondary unit in the engagement, an enemy of the primary
 * @param coord - The coordinate where the engagement occurs (defaults to "E-5")
 * @param primaryFacing - The facing of the primary unit (defaults to "north")
 */
export function createBoardWithEngagedUnits(
  primaryUnit: UnitInstance,
  secondaryUnit: UnitInstance,
  coord: Coordinate = 'E-5',
  primaryFacing: UnitFacing = 'north',
): Board {
  const standing = addUnitToBoard(createEmptyStandardBoard(), {
    placement: { coordinate: coord, facing: primaryFacing },
    unit: primaryUnit,
  });
  const engaged = addUnitToBoard(standing, {
    placement: { coordinate: coord, facing: getOppositeFacing(primaryFacing) },
    unit: secondaryUnit,
  });
  return engaged;
}
