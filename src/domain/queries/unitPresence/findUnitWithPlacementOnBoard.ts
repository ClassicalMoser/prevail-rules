import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { createUnitIndexKey } from '@factories';
import { getBoardSpace } from '../board/getBoardSpace';
import { getOppositeFacing } from '@queries/facings';
import { isSameUnitInstance } from '../unit/unitEquivalence';
import { hasEngagedUnits } from './hasEngagedUnits';
import { hasSingleUnit } from './hasSingleUnit';

/**
 * A unit as the board holds it, with where it stands, or `undefined` when it
 * is not on the board.
 *
 * The space comes from the game state's index, which every write keeps in
 * step with the board, so the board is not searched. The unit answered is the
 * one standing there, so its stats are the board's whatever copy named it.
 * Which way it faces is the space's to say: a lone unit faces as stored, and
 * of two engaged units the primary keeps its stored facing and the secondary
 * faces opposite it.
 *
 * @param gameState - The game, for its index and its board
 * @param unit - The unit to find, by who it is
 * @returns The board's own unit with its placement, or `undefined` when it is not on the board
 * @throws {Error} If the index puts the unit on a space that does not hold it
 */
export function findUnitWithPlacementOnBoard(
  gameState: GameState,
  unit: UnitInstance,
): UnitWithPlacement | undefined {
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
    const found: UnitWithPlacement = {
      placement: { coordinate, facing: unitPresence.facing },
      unit: unitPresence.unit,
    };
    return found;
  }

  if (hasEngagedUnits(unitPresence)) {
    // Engaged, the primary keeps its stored facing.
    if (isSameUnitInstance(unitPresence.primaryUnit, unit)) {
      const found: UnitWithPlacement = {
        placement: { coordinate, facing: unitPresence.primaryFacing },
        unit: unitPresence.primaryUnit,
      };
      return found;
    }
    // The secondary faces opposite the primary.
    if (isSameUnitInstance(unitPresence.secondaryUnit, unit)) {
      const found: UnitWithPlacement = {
        placement: {
          coordinate,
          facing: getOppositeFacing(unitPresence.primaryFacing),
        },
        unit: unitPresence.secondaryUnit,
      };
      return found;
    }
  }

  // Every write keeps the index in step with the board, so a space that does
  // not hold the unit the index puts there is a fault in whatever wrote it.
  throw new Error(
    `The index puts unit ${key} at ${coordinate}, but that space does not hold it`,
  );
}
