import type { PlayerSide, Board, UnitFacing, UnitType } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getUnitByStatValue } from '@testing/getUnitByStatValue';
import { createUnitInstance } from '@factories';
import { createBoardWithUnits } from './boardWithUnits';

/**
 * Creates a board with a single unit at a coordinate.
 * Uses createBoardWithUnits (and thus addUnitToBoard) for consistency with pure transforms.
 *
 * TODO(composition): the unit is chosen here by hand rather than through
 * `createTestUnit`, and the two differ when a spec gives both Flexibility and
 * Attack: this takes the Flexibility alone, `createTestUnit` wants both. To
 * settle: decide whether a single unit is asked for as `createTestUnit` asks,
 * then build it with that.
 */
export function createBoardWithSingleUnit(
  coord: Coordinate,
  playerSide: PlayerSide,
  options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    facing?: UnitFacing;
    instanceNumber?: number;
  },
): Board {
  // Facing north, the first of its type, unless the spec says otherwise.
  const facing = options?.facing ?? 'north';
  const instanceNumber = options?.instanceNumber ?? 1;

  // The unit type the spec named, or the first stand-in with the stat it
  // asked for; a unit of Attack 3 when it asked for nothing.
  let unitType: UnitType;
  if (options?.unitType) {
    unitType = options.unitType;
  } else if (options?.flexibility !== undefined) {
    unitType = getUnitByStatValue('flexibility', options.flexibility);
  } else if (options?.attack !== undefined) {
    unitType = getUnitByStatValue('attack', options.attack);
  } else {
    unitType = getUnitByStatValue('attack', 3);
  }
  const unit = createUnitInstance(playerSide, unitType, instanceNumber);

  // That one unit, alone on an empty standard board.

  const board = createBoardWithUnits([
    { placement: { coordinate: coord, facing }, unit },
  ]);

  // The board with only that unit on it.
  return board;
}
