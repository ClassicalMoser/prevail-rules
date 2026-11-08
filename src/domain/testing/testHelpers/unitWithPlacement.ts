import type {
  Coordinate,
  UnitFacing,
  UnitInstance,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import { createUnitPlacement } from '@factories';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Creates a UnitWithPlacement for testing with sensible defaults.
 *
 * TODO(misleading): the unit is fabricated through `createTestUnit`, which the
 * name does not say; `createTestUnitWithPlacement` would match
 * `createTestUnit` and `createTestCard`. Callers span 38 files, so the rename
 * is its own decision. See AUDIT.md `factories and testing`.
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
  return { placement: createUnitPlacement(coordinate, facing), unit };
}
