import type { Board, UnitInstance, UnitPlacement } from '@entities';
import { getBoardCoordinates } from '../board/getBoardCoordinates';
import { getBoardSpace } from '../board/getBoardSpace';
import { getOppositeFacing } from '@queries/facings';
import { isSameUnitInstance } from '../unit/unitEquivalence';
import { hasNoUnit } from './hasNoUnit';
import { hasSingleUnit } from './hasSingleUnit';

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
 * the secondary faces opposite it.
 *
 * @param board - The board to search
 * @param unit - The unit to find
 * @returns The unit's placement (coordinate and facing), or `undefined` when it is not on the board
 */
export function findPositionOfUnit(
  board: Board,
  unit: UnitInstance,
): UnitPlacement | undefined {
  for (const coordinate of getBoardCoordinates(board)) {
    const { unitPresence } = getBoardSpace(board, coordinate);

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

  return undefined;
}
