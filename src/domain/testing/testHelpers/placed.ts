import type { UnitFacing, UnitInstance, UnitWithPlacement } from '@entities';
import type { Coordinate } from '@ruleValues';
import { createUnitPlacement } from '@factories';

/**
 * A unit the caller already has, put at a coordinate and facing.
 *
 * Composes {@link createUnitPlacement} with the unit, which is the whole of
 * what a spec needs when two units must be positioned relative to each other.
 * {@link createUnitWithPlacement} builds the unit as well, from stat options.
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
  const withPlacement: UnitWithPlacement = {
    placement: createUnitPlacement(coordinate, facing),
    unit,
  };
  return withPlacement;
}
