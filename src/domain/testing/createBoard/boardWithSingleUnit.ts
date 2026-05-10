import type {
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
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

  return createBoardWithUnits([{ coordinate: coord, facing, unit }]);
}
