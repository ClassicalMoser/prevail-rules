import type { UnitInstance, UnitPlacement } from '@entities';
import type { GameState } from '@game';
import { getUnitWithPlacementOnBoard } from '@queries';
import { fileUnitInIndex } from '../gameStateIndex/fileUnitInIndex';
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
 * The board and the unit's entry in the index change in the same write.
 *
 * @param state - The game, with the unit on the board
 * @param unit - Who the unit is; it must be on the board
 * @param to - Where it is set down: the space and the way it faces
 * @returns The state with the unit at its new placement, and filed there
 * @throws {Error} If the unit is not on the board, or cannot be set down there
 */
export function moveUnitOnBoard<S extends GameState>(
  state: S,
  unit: UnitInstance,
  to: UnitPlacement,
): S {
  // The unit as the board holds it, wherever it stands now.
  const held = getUnitWithPlacementOnBoard(state, unit);

  // It leaves its space, and is set down at the new placement as the same
  // unit the board held.
  const lifted = removeUnitFromBoard(state.boardState, held);
  const moved = addUnitToBoard(lifted, { placement: to, unit: held.unit });

  // The new board, and the unit filed at the space it was set down on.
  const written: S = {
    ...state,
    boardState: moved,
    index: fileUnitInIndex(state.index, held.unit, to.coordinate),
  };
  return written;
}
