import type {
  PlayerSide,
  Coordinate,
  UnitFacing,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import { createTestUnit } from '@testing/unitHelpers';

/**
 * Short-hand unit placement specification for bootstrapping test scenarios.
 * Supports multiple syntaxes for flexibility:
 *
 * 1. Tuple syntax: ['E-5', 'black'] or ['E-5', 'black', 'north']
 * 2. Object syntax: { coord: 'E-5', player: 'black' }
 * 3. Full control: { coord: 'E-5', player: 'black', facing: 'north', attack: 3 }
 */
export type UnitPlacementSpec =
  | [Coordinate, PlayerSide]
  | [Coordinate, PlayerSide, UnitFacing]
  | {
      coord: Coordinate;
      player: PlayerSide;
      facing?: UnitFacing;
      unitType?: UnitType;
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
      instanceNumber?: number;
    };

/**
 * Extracts the explicitly specified instance number from a spec, if any.
 */
export function getExplicitInstanceNumber(
  spec: UnitPlacementSpec,
): number | undefined {
  if (Array.isArray(spec)) {
    return undefined;
  }
  return spec.instanceNumber;
}

/**
 * Normalizes a unit placement spec into a {@link UnitWithPlacement}.
 */
export function normalizeUnitPlacement(
  spec: UnitPlacementSpec,
  instanceNumber: number,
): UnitWithPlacement {
  if (Array.isArray(spec)) {
    const [coord, player, facing = 'north'] = spec;
    const unit = createTestUnit(player, { instanceNumber });
    const withPlacement: UnitWithPlacement = {
      placement: { coordinate: coord, facing },
      unit,
    };
    return withPlacement;
  }

  const {
    coord,
    player,
    facing = 'north',
    instanceNumber: explicitInstanceNumber = instanceNumber,
    ...unitOptions
  } = spec;

  const unit = createTestUnit(player, {
    instanceNumber: explicitInstanceNumber,
    ...unitOptions,
  });
  const withPlacement: UnitWithPlacement = {
    placement: { coordinate: coord, facing },
    unit,
  };
  return withPlacement;
}

/**
 * Assigns instance numbers to specs.
 * Auto-assigned numbers count up from 1 for each player's units of each type,
 * as an army numbers its copies of a unit type (§3.1), so no layout of one
 * side passes the limit on copies of a type. A spec that names no unit type
 * counts with the others that name none.
 * Explicitly specified numbers are preserved (duplicates allowed).
 */
export function assignInstanceNumbers(
  specs: UnitPlacementSpec[],
): { spec: UnitPlacementSpec; instanceNumber: number }[] {
  // The last number given to each player's units of each type.
  const lastNumber = new Map<string, number>();
  const result: { spec: UnitPlacementSpec; instanceNumber: number }[] = [];

  for (const spec of specs) {
    const explicit = getExplicitInstanceNumber(spec);
    if (explicit !== undefined) {
      result.push({ instanceNumber: explicit, spec });
      continue;
    }
    const [player, unitTypeId] = Array.isArray(spec)
      ? [spec[1], undefined]
      : [spec.player, spec.unitType?.id];
    const key = `${player}:${unitTypeId ?? 'default'}`;
    const instanceNumber = (lastNumber.get(key) ?? 0) + 1;
    lastNumber.set(key, instanceNumber);
    result.push({ instanceNumber, spec });
  }

  return result;
}
