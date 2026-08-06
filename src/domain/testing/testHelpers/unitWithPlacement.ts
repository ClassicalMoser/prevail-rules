import type { StandardBoardCoordinate, UnitFacing, UnitType, UnitWithPlacement } from '@entities';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a UnitWithPlacement for testing with sensible defaults.
 */
export function createUnitWithPlacement(options?: {
  coordinate?: StandardBoardCoordinate;
  facing?: UnitFacing;
  playerSide?: 'black' | 'white';
  unitOptions?: {
    unitType?: UnitType;
    instanceNumber?: number;
    flexibility?: number;
    attack?: number;
    speed?: number;
    range?: number;
    reverse?: number;
    retreat?: number;
    rout?: number;
    cost?: number;
    limit?: number;
    routPenalty?: number;
  };
}): UnitWithPlacement {
  const playerSide = options?.playerSide ?? 'black';
  const unit = createTestUnit(playerSide, options?.unitOptions);
  return {
    placement: {
      coordinate: options?.coordinate ?? 'E-5',
      facing: options?.facing ?? 'north',
    },
    unit,
  };
}
