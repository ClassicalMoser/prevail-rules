import type { UnitInstance, UnitPlacement } from '@entities';
import type { GameState } from '@game';
import { findPositionOfUnit } from './findPositionOfUnit';

/**
 * Where a unit stands on the board, for a caller that knows it must be there.
 * Use {@link findPositionOfUnit} to ask whether it is on the board at all.
 *
 * @param gameState - The game, for its index and its board
 * @param unit - The unit to find
 * @returns The unit's placement (coordinate and facing)
 * @throws {Error} If the unit is not found on the board
 *
 * @example
 * ```typescript
 * const unit = createUnitInstance("black", someUnitType, 1);
 * const placement = getPositionOfUnit(gameState, unit);
 * console.log(`Unit is at ${placement.coordinate} facing ${placement.facing}`);
 * ```
 */
export function getPositionOfUnit(
  gameState: GameState,
  unit: UnitInstance,
): UnitPlacement {
  const placement = findPositionOfUnit(gameState, unit);
  if (placement === undefined) {
    throw new Error('Unit not found on board');
  }
  return placement;
}
