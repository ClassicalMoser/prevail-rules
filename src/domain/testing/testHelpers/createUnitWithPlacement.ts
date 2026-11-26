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
  // A stand-in unit of the side asked for, Black by default, chosen from the
  // catalog by whatever stats the spec asked for.
  const playerSide = options?.playerSide ?? 'black';
  const unit = createTestUnit(playerSide, options?.unitOptions);

  // Standing on E-5 facing north unless the spec says otherwise: a space
  // well inside the standard board, with room on every side. It is not put
  // on a board; a spec does that.
  const withPlacement: UnitWithPlacement = {
    placement: {
      coordinate: options?.coordinate ?? 'E-5',
      facing: options?.facing ?? 'north',
    },
    unit,
  };

  // The unit with where it stands.
  return withPlacement;
}
