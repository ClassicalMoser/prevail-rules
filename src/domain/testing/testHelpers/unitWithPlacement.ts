import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitType,
  UnitWithPlacement,
} from '@entities';
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
}): UnitWithPlacement<StandardBoard> {
  const playerSide = options?.playerSide ?? 'black';
  const unit = createTestUnit(playerSide, options?.unitOptions);
  return {
    unit,
    placement: {
      coordinate: options?.coordinate ?? 'E-5',
      facing: options?.facing ?? 'north',
    },
  };
}
