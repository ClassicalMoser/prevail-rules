import type { Board, UnitInstance, UnitPlacement } from '@entities';
import { findPositionOfUnit } from './findPositionOfUnit';

/**
 * Where a unit stands on the board, for a caller that knows it must be there.
 * Use `findPositionOfUnit` to ask whether it is on the board at all.
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
  const placement = findPositionOfUnit(board, unit);
  if (placement === undefined) {
    throw new Error('Unit not found on board');
  }
  return placement;
}
