import type {
  PlayerSide,
  UnitInstance,
  UnitStatName,
  UnitType,
} from '@entities';
import { tempUnits } from '@sampleValues';
import { createUnitInstance } from '@transforms';
import { getUnitByStatValue } from './getUnitByStatValue';

/**
 * Creates a unit instance for testing with sensible defaults.
 * This is a convenience wrapper around createUnitInstance that makes tests
 * less verbose while maintaining flexibility.
 *
 * @param playerSide - Which player the unit belongs to
 * @param options - Optional configuration for the unit
 * @param options.unitType - Specific unit type to use (if not provided, will use stat-based lookup)
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
 * @param options.routPenalty - Rout penalty stat value (used if unitType not provided)
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
    routPenalty?: number;
  },
): UnitInstance {
  const instanceNumber = options?.instanceNumber ?? 1;

  if (options?.unitType) {
    return createUnitInstance(playerSide, options.unitType, instanceNumber);
  }

  // Collect all specified stats
  const specifiedStats: Array<{ stat: UnitStatName; value: number }> = [];
  if (options?.flexibility !== undefined) {
    specifiedStats.push({ stat: 'flexibility', value: options.flexibility });
  }
  if (options?.attack !== undefined) {
    specifiedStats.push({ stat: 'attack', value: options.attack });
  }
  if (options?.speed !== undefined) {
    specifiedStats.push({ stat: 'speed', value: options.speed });
  }
  if (options?.range !== undefined) {
    specifiedStats.push({ stat: 'range', value: options.range });
  }
  if (options?.reverse !== undefined) {
    specifiedStats.push({ stat: 'reverse', value: options.reverse });
  }
  if (options?.retreat !== undefined) {
    specifiedStats.push({ stat: 'retreat', value: options.retreat });
  }
  if (options?.rout !== undefined) {
    specifiedStats.push({ stat: 'rout', value: options.rout });
  }

  // Find a unit matching all specified stats
  if (specifiedStats.length > 0) {
    const unitType = tempUnits.find((unit) =>
      specifiedStats.every(({ stat, value }) => unit.stats[stat] === value),
    );
    if (!unitType) {
      const statDescriptions = specifiedStats
        .map(({ stat, value }) => `${stat}=${value}`)
        .join(', ');
      throw new Error(
        `No unit found matching all specified stats: ${statDescriptions}.`,
      );
    }
    return createUnitInstance(playerSide, unitType, instanceNumber);
  }

  // Default: use attack value 3 (common in tests)
  const unitType = getUnitByStatValue('attack', 3);
  if (!unitType) {
    throw new Error('No unit found with attack value 3.');
  }
  return createUnitInstance(playerSide, unitType, instanceNumber);
}

/**
 * Creates a unit instance by looking up a unit with a specific stat value.
 * This is a convenience wrapper around getUnitByStatValue and createUnitInstance.
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
  if (!unitType) {
    throw new Error(`No unit found with ${stat} value ${value}.`);
  }
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
    routPenalty?: number;
  },
): UnitInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUnit(playerSide, {
      ...options,
      instanceNumber: i + 1,
    }),
  );
}
