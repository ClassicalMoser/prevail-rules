import type { Coordinate, UnitFacing, UnitPlacement } from '@entities';

/**
 * A placement from the space stood on and the direction faced.
 *
 * Both arguments are string literal types, so the call states the fact and the
 * field names add nothing the values do not already say.
 *
 * @param coordinate - The space stood on
 * @param facing - The direction faced
 * @returns The placement
 */
export function createUnitPlacement(
  coordinate: Coordinate,
  facing: UnitFacing,
): UnitPlacement {
  return { coordinate, facing };
}
