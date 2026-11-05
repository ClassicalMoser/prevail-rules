import type {
  Coordinate,
  UnitFacing,
  UnitInstance,
  UnitPlacement,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a UnitWithPlacement for testing with sensible defaults.
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

/**
 * A placement from its two parts.
 *
 * Both arguments are string literal types, so the call states the fact and the
 * keys add nothing to it: `placement('E-5', 'north')`.
 *
 * @param coordinate - The space stood on
 * @param facing - The direction faced
 * @returns The placement
 */
export function placement(
  coordinate: Coordinate,
  facing: UnitFacing,
): UnitPlacement {
  return { coordinate, facing };
}

/**
 * A unit the caller already has, put at a coordinate and facing.
 *
 * {@link createUnitWithPlacement} builds the unit as well, from stat options.
 * This one places a unit that already exists, which is what a spec needs when
 * two units have to be positioned relative to each other.
 *
 * @param unit - The unit to place
 * @param coordinate - The space it stands on
 * @param facing - The direction it faces
 * @returns The unit with its placement
 */
export function placed(
  unit: UnitInstance,
  coordinate: Coordinate,
  facing: UnitFacing,
): UnitWithPlacement {
  return { placement: placement(coordinate, facing), unit };
}
