import type { UnitFacing, UnitType, UnitWithPlacement } from '@entities';
import type { Coordinate } from '@ruleValues';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a UnitWithPlacement for testing with sensible defaults.
 *
 * TODO(misleading): the unit is fabricated through {@link createTestUnit}, which the
 * name does not say; `createTestUnitWithPlacement` would match
 * {@link createTestUnit} and `createTestCard`. Callers span 38 files, so the rename
 * is its own decision.
 */
export function createUnitWithPlacement(options?: {
  coordinate?: Coordinate;
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
    morale?: number;
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
