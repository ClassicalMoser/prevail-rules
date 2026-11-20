import type { Board, UnitInstance, UnitPlacement } from '@entities';
import { getUnitIdentityKey } from '../unit/unitEquivalence/getUnitIdentityKey';
import { getUnitPlacementsOnBoard } from './getUnitPlacementsOnBoard';

/**
 * Where a unit stands on the board, or `undefined` when it is not on it.
 *
 * A unit may leave the board while it is still listed to act: one routed
 * earlier in the phase is gone but its order is still pending. Not being on the
 * board is an ordinary answer, so this is total. Callers that know the unit
 * must be there use `getPositionOfUnit`.
 *
 * The search reads each space's `unitPresence` for the unit: a lone unit stands
 * as stored, and of two engaged units the primary keeps its stored facing and
 * the secondary faces opposite it. That reading is done once per board, by
 * `getUnitPlacementsOnBoard`, and this looks the unit up in it.
 *
 * @param board - The board to search
 * @param unit - The unit to find
 * @returns The unit's placement (coordinate and facing), or `undefined` when it is not on the board
 */
export function findPositionOfUnit(
  board: Board,
  unit: UnitInstance,
): UnitPlacement | undefined {
  // Where each unit on this board stands, read once for the board; the unit
  // is found there by its identity. Absent means not on the board.
  const placement = getUnitPlacementsOnBoard(board).get(
    getUnitIdentityKey(unit),
  );
  return placement;
}
