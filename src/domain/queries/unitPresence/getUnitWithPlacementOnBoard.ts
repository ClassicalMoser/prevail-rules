import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { findPlayerUnitWithPosition } from './findPlayerUnitWithPosition';
import { getPositionOfUnit } from './getPositionOfUnit';

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
  // Where it stands; this insists, as a unit that is named must be there.
  const placement = getPositionOfUnit(gameState, unit);

  // The unit held in that space, which is the board's copy and not the name's.
  const held = findPlayerUnitWithPosition(
    gameState.boardState,
    placement.coordinate,
    unit.playerSide,
  );
  // TODO(composition): this cannot be reached. `getPositionOfUnit` has
  // already found this unit on that space, and the side's unit there is the
  // one it found, so coverage and the nightly mutants stop here. Settled by a
  // reader that answers the board's unit and its placement in one walk, which
  // `findPositionOfUnit` already makes.
  if (held === undefined) {
    throw new Error('Unit not found on board');
  }

  // The board's own unit, standing where the board says.
  return held;
}
