import type { UnitInstance, UnitPlacement } from '@entities';
import type { GameState } from '@game';
import { getUnitWithPlacementOnBoard } from '@queries';
import { fileUnitInIndex } from '../gameStateIndex/fileUnitInIndex';
import { addEngagingUnitToBoard } from './addEngagingUnitToBoard';
import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * A unit moves into a lone enemy's space and engages it: lifted from where it
 * stands and set down in the enemy's space as the engaging unit, keeping its
 * facing, with the defender turned to face it. It is the unit the board
 * holds that engages, whatever the event named it with.
 *
 * The board and the unit's entry in the index change in the same write; the
 * defender has not moved, so its entry stands.
 *
 * @param state - The game, with the unit on the board
 * @param unit - Who the engaging unit is; it must be on the board
 * @param to - The enemy's space, and the way the engaging unit faces
 * @returns The state with the pair engaged there, and the unit filed there
 * @throws {Error} If the unit is not on the board, or no lone enemy stands there
 */
export function moveUnitIntoEngagement<S extends GameState>(
  state: S,
  unit: UnitInstance,
  to: UnitPlacement,
): S {
  // The unit as the board holds it, wherever it stands now.
  const held = getUnitWithPlacementOnBoard(state, unit);

  // It leaves its space and joins the enemy in theirs.
  const lifted = removeUnitFromBoard(state.boardState, held);
  const engaged = addEngagingUnitToBoard(lifted, {
    placement: to,
    unit: held.unit,
  });

  // The new board, and the unit filed at the space it engages in.
  const written: S = {
    ...state,
    boardState: engaged,
    index: fileUnitInIndex(state.index, held.unit, to.coordinate),
  };

  // The game with the two engaged, to be fought in Phase 4 unless the
  // defender may and does fall back (§6.3.2).
  return written;
}
