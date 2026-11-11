import type { Board, UnitInstance, UnitWithPlacement } from '@entities';
import { findPlayerUnitWithPosition } from './findPlayerUnitWithPosition';
import { getPositionOfUnit } from './getPositionOfUnit';

/**
 * A unit as the board holds it, and where it stands. An event names a unit by
 * who it is (its side, its type and its number); what the unit is, its stats,
 * is what the board says. A caller that has only a name reads the unit here
 * before it acts on it.
 *
 * @param board - The board to search
 * @param unit - Who the unit is, as an event or an order names it
 * @returns The board's own unit with its placement
 * @throws {Error} If the unit is not on the board
 */
export function getUnitWithPlacementOnBoard(
  board: Board,
  unit: UnitInstance,
): UnitWithPlacement {
  // Where it stands; this insists, as a unit that is named must be there.
  const placement = getPositionOfUnit(board, unit);

  // The unit held in that space, which is the board's copy and not the name's.
  const held = findPlayerUnitWithPosition(
    board,
    placement.coordinate,
    unit.playerSide,
  );
  if (held === undefined) {
    throw new Error('Unit not found on board');
  }
  return held;
}
