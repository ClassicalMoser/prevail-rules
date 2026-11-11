import type { Board, UnitInstance, UnitPlacement } from '@entities';
import { getUnitWithPlacementOnBoard } from '@queries';
import { addUnitToBoard } from './addUnitToBoard';
import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * A unit changes where it stands: lifted from the space it is in and set down
 * at its new placement. Whatever the reason it moves (a move order, a retreat,
 * a turn to face a flank attack, or a reverse that turns it where it stands),
 * the board changes the same way, and it is always the unit the board holds
 * that is set down. An event names a unit by who it is; the stats it carries
 * are the board's to say.
 *
 * @param board - The board the unit stands on
 * @param unit - Who the unit is; it must be on the board
 * @param to - Where it is set down: the space and the way it faces
 * @returns A new board with the unit set down at its new placement
 * @throws {Error} If the unit is not on the board, or cannot be set down there
 */
export function moveUnitOnBoard(
  board: Board,
  unit: UnitInstance,
  to: UnitPlacement,
): Board {
  // The unit as the board holds it, wherever it stands now.
  const held = getUnitWithPlacementOnBoard(board, unit);

  // It leaves its space, and is set down at the new placement as the same
  // unit the board held.
  const lifted = removeUnitFromBoard(board, held);
  const moved = addUnitToBoard(lifted, { placement: to, unit: held.unit });
  return moved;
}
