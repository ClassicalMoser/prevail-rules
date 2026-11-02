import type { Board, UnitInstance, UnitPlacement } from '@entities';
import { hasNoUnit, hasSingleUnit } from '@entities';
import { getBoardCoordinates } from '../board/getBoardCoordinates';
import { getBoardSpace } from '../board/getBoardSpace';
import { getOppositeFacing } from '@queries/facings';
import { isSameUnitInstance } from '../unit/unitEquivalence';

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
export function getPositionOfUnit(
  board: Board,
  unit: UnitInstance,
): UnitPlacement {
  // Get all coordinates for the board
  const coordinates = getBoardCoordinates(board);

  for (const coordinate of coordinates) {
    // Use getBoardSpace for type-safe access - it handles the generic type alignment
    const space = getBoardSpace(board, coordinate);
    const { unitPresence } = space;

    // Skip empty spaces
    if (hasNoUnit(unitPresence)) {
      continue;
    }

    // Check single unit presence
    if (hasSingleUnit(unitPresence)) {
      if (isSameUnitInstance(unitPresence.unit, unit).result) {
        const placement: UnitPlacement = {
          coordinate,
          facing: unitPresence.facing,
        };
        return placement;
      }
      continue;
    }

    // Engaged. The primary keeps its stored facing.
    if (isSameUnitInstance(unitPresence.primaryUnit, unit).result) {
      const primaryPlacement: UnitPlacement = {
        coordinate,
        facing: unitPresence.primaryFacing,
      };
      return primaryPlacement;
    }
    // The secondary faces opposite the primary.
    if (isSameUnitInstance(unitPresence.secondaryUnit, unit).result) {
      const secondaryPlacement: UnitPlacement = {
        coordinate,
        facing: getOppositeFacing(unitPresence.primaryFacing),
      };
      return secondaryPlacement;
    }
  }

  throw new Error('Unit not found on board');
}
