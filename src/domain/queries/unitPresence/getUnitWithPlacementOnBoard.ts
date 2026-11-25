import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { throwIfUndefined } from '@utils';
import { findUnitWithPlacementOnBoard } from './findUnitWithPlacementOnBoard';

/**
 * A unit as the board holds it, and where it stands. An event names a unit by
 * who it is (its side, its type and its number); what the unit is, its stats,
 * is what the board says. A caller that has only a name reads the unit here
 * before it acts on it.
 *
 * @param gameState - The game, for its index and its board
 * @param unit - Who the unit is, as an event or an order names it
 * @returns The board's own unit with its placement
 * @throws {Error} If the unit is not on the board
 */
export function getUnitWithPlacementOnBoard(
  gameState: GameState,
  unit: UnitInstance,
): UnitWithPlacement {
  // The board's own unit and where it stands; a unit that is named must be
  // there.
  const held = throwIfUndefined(
    findUnitWithPlacementOnBoard(gameState, unit),
    'Unit not found on board',
  );

  // The board's own unit, standing where the board says.
  return held;
}
