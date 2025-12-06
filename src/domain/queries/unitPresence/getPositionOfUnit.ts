import type { Board, UnitInstance, UnitPlacement } from '@entities';
import { hasNoUnit, hasSingleUnit, isSameUnitInstance } from '@validation';
import { getBoardCoordinates, getBoardSpace } from '../boardSpace';
import { getOppositeFacing } from '../facings';


/**
 * Finds the position of a unit on the board by searching all coordinates.
 * Optimized to check unitPresence directly instead of using helper functions.
 *
 * @param board - The board to search
 * @param unit - The unit to find
 * @returns The unit's placement (coordinate and facing)
 * @throws {Error} If the unit is not found on the board
 *
 * @example
 * ```typescript
 * const unit = createUnitInstance("black", someUnitType, 1);
 * const placement = getPositionOfUnit(board, unit);
 * console.log(`Unit is at ${placement.coordinate} facing ${placement.facing}`);
 * ```
 */
export function getPositionOfUnit<TBoard extends Board>(
  board: TBoard,
  unit: UnitInstance,
): UnitPlacement<TBoard> {
  // Get all coordinates for the board
  const coordinates = getBoardCoordinates(board);

  for (const coordinate of coordinates) {
    // Use getBoardSpace for type-safe access - it handles the generic type alignment
    const space = getBoardSpace(board, coordinate);
    const unitPresence = space.unitPresence;

    // Skip empty spaces
    if (hasNoUnit(unitPresence)) {
      continue;
    }

    // Check single unit presence
    if (hasSingleUnit(unitPresence)) {
      if (isSameUnitInstance(unitPresence.unit, unit)) {
        return {
          coordinate,
          facing: unitPresence.facing,
        };
      }
      continue;
    }

    // Check engaged units (primary or secondary)
    if (isSameUnitInstance(unitPresence.primaryUnit, unit)) {
      return {
        coordinate,
        facing: unitPresence.primaryFacing,
      };
    }
    if (isSameUnitInstance(unitPresence.secondaryUnit, unit)) {
      return {
        coordinate,
        facing: getOppositeFacing(unitPresence.primaryFacing),
      };
    }
  }

  throw new Error('Unit not found on board');
}
