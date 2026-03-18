import type {
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitType,
} from '@entities';
import { getUnitByStatValue } from '@testing/getUnitByStatValue';
import { createUnitInstance } from '@transforms';
import { createBoardWithUnits } from './boardWithUnits';

/**
 * Creates a board with a single unit at a coordinate.
 * Uses createBoardWithUnits (and thus addUnitToBoard) for consistency with pure transforms.
 */
export function createBoardWithSingleUnit(
  coord: StandardBoardCoordinate,
  playerSide: PlayerSide,
  options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    facing?: UnitFacing;
    instanceNumber?: number;
  },
): StandardBoard {
  const facing = options?.facing ?? 'north';
  const instanceNumber = options?.instanceNumber ?? 1;

  let unit: UnitInstance;
  if (options?.unitType) {
    unit = createUnitInstance(playerSide, options.unitType, instanceNumber);
  } else if (options?.flexibility !== undefined) {
    const unitType = getUnitByStatValue('flexibility', options.flexibility);
    unit = createUnitInstance(playerSide, unitType, instanceNumber);
  } else if (options?.attack !== undefined) {
    const unitType = getUnitByStatValue('attack', options.attack);
    unit = createUnitInstance(playerSide, unitType, instanceNumber);
  } else {
    const unitType = getUnitByStatValue('attack', 3);
    unit = createUnitInstance(playerSide, unitType, instanceNumber);
  }

  return createBoardWithUnits([{ unit, coordinate: coord, facing }]);
}
