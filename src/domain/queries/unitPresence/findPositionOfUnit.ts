import type { UnitInstance, UnitPlacement } from '@entities';
import type { GameState } from '@game';
import { createUnitIndexKey } from '@factories';
import { getBoardSpace } from '../board/getBoardSpace';
import { getOppositeFacing } from '@queries/facings';
import { isSameUnitInstance } from '../unit/unitEquivalence';
import { hasEngagedUnits } from './hasEngagedUnits';
import { hasSingleUnit } from './hasSingleUnit';

/**
 * Where a unit stands on the board, or `undefined` when it is not on it.
 *
 * A unit may leave the board while it is still listed to act: one routed
 * earlier in the phase is gone but its order is still pending. Not being on the
 * board is an ordinary answer, so this is total. Callers that know the unit
 * must be there use `getPositionOfUnit`.
 *
 * The space comes from the game state's index, which every write keeps in
 * step with the board, so the board is not searched. Which way the unit faces
 * is the space's to say: a lone unit faces as stored, and of two engaged units
 * the primary keeps its stored facing and the secondary faces opposite it.
 *
 * TODO(misleading): this answers a `UnitPlacement`, the space and the facing,
 * so "position" says less than it returns. Settled by a name that says
 * placement, with `getPositionOfUnit` and `findPlayerUnitWithPosition`.
 *
 * @param gameState - The game, for its index and its board
 * @param unit - The unit to find
 * @returns The unit's placement (coordinate and facing), or `undefined` when it is not on the board
 * @throws {Error} If the index puts the unit on a space that does not hold it
 */
export function findPositionOfUnit(
  gameState: GameState,
  unit: UnitInstance,
): UnitPlacement | undefined {
  // Where the index files this unit, if anywhere.
  const key = createUnitIndexKey(unit);
  if (!Object.hasOwn(gameState.index.units, key)) {
    return undefined;
  }
  const entry = gameState.index.units[key];

  // In reserve or routed: not on the board.
  if (entry === 'reserved' || entry === 'routed') {
    return undefined;
  }

  // The space it stands on says which way it faces.
  const coordinate = entry;
  const { unitPresence } = getBoardSpace(gameState.boardState, coordinate);

  // Alone in the space, it faces as stored.
  if (
    hasSingleUnit(unitPresence) &&
    isSameUnitInstance(unitPresence.unit, unit)
  ) {
    const placement: UnitPlacement = {
      coordinate,
      facing: unitPresence.facing,
    };
    return placement;
  }

  if (hasEngagedUnits(unitPresence)) {
    // Engaged, the primary keeps its stored facing.
    if (isSameUnitInstance(unitPresence.primaryUnit, unit)) {
      const placement: UnitPlacement = {
        coordinate,
        facing: unitPresence.primaryFacing,
      };
      return placement;
    }
    // The secondary faces opposite the primary.
    if (isSameUnitInstance(unitPresence.secondaryUnit, unit)) {
      const placement: UnitPlacement = {
        coordinate,
        facing: getOppositeFacing(unitPresence.primaryFacing),
      };
      return placement;
    }
  }

  // Every write keeps the index in step with the board, so a space that does
  // not hold the unit the index puts there is a fault in whatever wrote it.
  throw new Error(
    `The index puts unit ${key} at ${coordinate}, but that space does not hold it`,
  );
}
