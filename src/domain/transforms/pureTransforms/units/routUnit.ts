import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getUnitWithPlacementOnBoard, hasUnitInArray } from '@queries';
import { fileUnitInIndex } from '../gameStateIndex/fileUnitInIndex';
import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * A unit routs: it leaves the board and is out of the game for good, in one
 * write. The board, the routed units and the index change together, so no
 * state has the unit both standing and routed.
 *
 * Only the unit goes. A commander that falls with it in combat (§4.2.8) is
 * its caller's to say: the support check's rout (§10.4) takes no commander.
 *
 * @param state - The game, with the unit on the board
 * @param unit - Who the unit is; it must be on the board
 * @returns The state with the unit off the board, among the routed, and filed as routed
 * @throws When the unit is not on the board, or is already routed
 */
export function routUnit<S extends GameState>(state: S, unit: UnitInstance): S {
  // A unit routs once; it is out of the game after that.
  if (hasUnitInArray(state.routedUnits, unit)) {
    throw new Error('Unit already routed');
  }

  // The unit as the board holds it, and where it stands.
  const held = getUnitWithPlacementOnBoard(state, unit);

  // Off the board, among the routed, and filed as routed.
  const written: S = {
    ...state,
    boardState: removeUnitFromBoard(state.boardState, held),
    index: fileUnitInIndex(state.index, held.unit, 'routed'),
    routedUnits: [...state.routedUnits, held.unit],
  };
  return written;
}
