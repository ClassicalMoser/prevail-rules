import type {
  PlayerSide,
  UnitInstance,
  UnitStatName,
  UnitType,
} from '@entities';
import { tempUnits } from '@sampleValues';
import { createUnitInstance } from '@factories';
import { getUnitByStatValue } from './getUnitByStatValue';

/**
 * Creates a unit instance for testing with sensible defaults.
 * This is a convenience wrapper around createUnitInstance that makes tests
 * less verbose while maintaining flexibility.
 *
 * @param playerSide - Which player the unit belongs to
 * @param options - Optional configuration for the unit
 * @param options.unitType - Specific unit type to use (if not provided, will use stat-based lookup in `tempUnits`)
 * @param options.instanceNumber - Unit instance number (defaults to 1)
 * @param options.flexibility - Flexibility stat value (used if unitType not provided)
 * @param options.attack - Attack stat value (used if unitType not provided)
 * @param options.speed - Speed stat value (used if unitType not provided)
 * @param options.range - Range stat value (used if unitType not provided)
 * @param options.reverse - Reverse stat value (used if unitType not provided)
 * @param options.retreat - Retreat stat value (used if unitType not provided)
 * @param options.rout - Rout stat value (used if unitType not provided)
 * @param options.cost - Cost stat value (used if unitType not provided)
 * @param options.limit - Limit stat value (used if unitType not provided)
 * @param options.morale - Morale stat value (used if unitType not provided)
 * @returns A unit instance configured for testing
 */
export function createTestUnit(
  playerSide: PlayerSide,
  options?: {
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
  },
): UnitInstance {
  const instanceNumber = options?.instanceNumber ?? 1;

  if (options?.unitType) {
    return createUnitInstance(playerSide, options.unitType, instanceNumber);
  }

  // Each asked-for value narrows the catalog. Stats live under `stats`; the
  // cost, limit and Morale of a unit type sit on the type itself, so a spec
  // can ask for a unit by what its rout costs (§9.3) as readily as by Speed.
  const wanted: { label: string; matches: (unitType: UnitType) => boolean }[] =
    [];
  const stats: UnitStatName[] = [
    'flexibility',
    'attack',
    'speed',
    'range',
    'reverse',
    'retreat',
    'rout',
  ];
  for (const stat of stats) {
    const value = options?.[stat];
    if (value !== undefined) {
      wanted.push({
        label: `${stat}=${value}`,
        matches: (unitType) => unitType.stats[stat] === value,
      });
    }
  }
  for (const field of ['cost', 'limit', 'morale'] as const) {
    const value = options?.[field];
    if (value !== undefined) {
      wanted.push({
        label: `${field}=${value}`,
        matches: (unitType) => unitType[field] === value,
      });
    }
  }

  if (wanted.length > 0) {
    const unitType = tempUnits.find((unit) =>
      wanted.every(({ matches }) => matches(unit)),
    );
    if (!unitType) {
      const description = wanted.map(({ label }) => label).join(', ');
      throw new Error(
        `No unit found matching all specified stats: ${description}.`,
      );
    }
    return createUnitInstance(playerSide, unitType, instanceNumber);
  }

  const unitType = getUnitByStatValue('attack', 3);
  return createUnitInstance(playerSide, unitType, instanceNumber);
}

/**
 * Creates a unit instance by looking up a unit with a specific stat value in `tempUnits`.
 *
 * @param playerSide - The player side of the unit
 * @param stat - The stat name to search by
 * @param value - The stat value to match
 * @param instanceNumber - Unit instance number (defaults to 1)
 * @returns A unit instance with the specified stat value
 */
export function createUnitByStat(
  playerSide: PlayerSide,
  stat: UnitStatName,
  value: number,
  instanceNumber: number = 1,
): UnitInstance {
  const unitType = getUnitByStatValue(stat, value);
  return createUnitInstance(playerSide, unitType, instanceNumber);
}

/**
 * Creates multiple unit instances with sequential instance numbers.
 * This is useful for tests that need multiple units of the same type.
 * Returns an array of unit instances with sequential instance numbers starting from 1.
 * @see createTestUnit - For details on available options
 */
export function createTestUnits(
  playerSide: PlayerSide,
  count: number,
  options?: {
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
  },
): UnitInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUnit(playerSide, {
      ...options,
      instanceNumber: i + 1,
    }),
  );
}
