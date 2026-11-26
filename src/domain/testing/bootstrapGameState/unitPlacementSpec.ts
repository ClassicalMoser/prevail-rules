import type {
  PlayerSide,
  UnitFacing,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import type { Coordinate } from '@ruleValues';
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
  // The tuple forms name only a space, a side and a facing, so they leave
  // the number to be counted.
  if (Array.isArray(spec)) {
    return undefined;
  }

  // The object form may carry a number a spec chose by hand.
  return spec.instanceNumber;
}

/**
 * Normalizes a unit placement spec into a {@link UnitWithPlacement}.
 */
export function normalizeUnitPlacement(
  spec: UnitPlacementSpec,
  instanceNumber: number,
): UnitWithPlacement {
  // A tuple asks for any stand-in unit of that side. It faces north unless
  // the spec names a facing: north is a stand-in, and a case that turns on
  // facing says which it means.
  if (Array.isArray(spec)) {
    const [coord, player, facing = 'north'] = spec;
    const unit = createTestUnit(player, { instanceNumber });
    const withPlacement: UnitWithPlacement = {
      placement: { coordinate: coord, facing },
      unit,
    };

    // The unit, standing where the tuple put it.
    return withPlacement;
  }

  // The object form may also ask for a unit by its stats. Those go on to
  // the catalog lookup, and a number given by hand wins over the count.
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

  // The unit with the stats asked for, standing where the spec put it.
  return withPlacement;
}

/**
 * Assigns instance numbers to specs.
 * Auto-assigned numbers count up from 1 for each player's units of each type,
 * as an army numbers its copies of a unit type (§3.1), so no layout of one
 * side passes the limit on copies of a type. A spec that names no unit type
 * counts with the others that name none.
 * Explicitly specified numbers are preserved (duplicates allowed).
 *
 * TODO(wrong): a number given by hand is not counted, so it can collide with
 * one counted for the same side and type: `{ instanceNumber: 1, player:
 * 'black' }` followed by `['E-6', 'black']` gives two black units the same
 * identity, and the game's index keeps only one of them. STYLE.md says setup
 * never uses an identifier twice. To settle: decide whether a collision
 * throws, or the count skips numbers already given by hand.
 */
export function assignInstanceNumbers(
  specs: UnitPlacementSpec[],
): { spec: UnitPlacementSpec; instanceNumber: number }[] {
  // The last number given to each player's units of each type.
  const lastNumber = new Map<string, number>();
  const result: { spec: UnitPlacementSpec; instanceNumber: number }[] = [];

  for (const spec of specs) {
    // A number given by hand is kept as it is.
    const explicit = getExplicitInstanceNumber(spec);
    if (explicit !== undefined) {
      result.push({ instanceNumber: explicit, spec });
      continue;
    }

    // Otherwise the unit takes the next number for its side and type: an
    // army numbers each type's copies from 1, and so does each side.
    const [player, unitTypeId] = Array.isArray(spec)
      ? [spec[1], undefined]
      : [spec.player, spec.unitType?.id];
    const key = `${player}:${unitTypeId ?? 'default'}`;
    const instanceNumber = (lastNumber.get(key) ?? 0) + 1;
    lastNumber.set(key, instanceNumber);
    result.push({ instanceNumber, spec });
  }

  // Every spec in its given order, each with the number it will carry.
  return result;
}
