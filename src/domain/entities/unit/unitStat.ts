import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * The names of all possible unit stats.
 * Every stat is required on every unit type.
 */
export const unitStatNames = [
  'attack',
  'range',
  'speed',
  'flexibility',
  'reverse',
  'retreat',
  'rout',
] as const;

export type UnitStatName = (typeof unitStatNames)[number];

const _unitStatNameSchemaObject = z.enum(unitStatNames);

type UnitStatNameSchemaType = z.infer<typeof _unitStatNameSchemaObject>;

export const unitStatNameSchema: z.ZodType<UnitStatName> =
  _unitStatNameSchemaObject;

// Assert type match at compile time
const _assertExactUnitStatName: AssertExact<
  UnitStatName,
  UnitStatNameSchemaType
> = true;

/**
 * Unit stats with all stat names as required keys.
 * This ensures type safety: all keys from UnitStatName must be present.
 * TypeScript will error if any key is missing.
 */
export type UnitStats = {
  [K in UnitStatName]: number;
};

// Build schema shape dynamically from unitStatNames to ensure all keys are required
const _unitStatsSchemaShape = {} as Record<UnitStatName, z.ZodType<number>>;
for (const statName of unitStatNames) {
  _unitStatsSchemaShape[statName] = z.number();
}

const _unitStatsSchemaObject = z.object(_unitStatsSchemaShape);

type UnitStatsSchemaType = z.infer<typeof _unitStatsSchemaObject>;

/**
 * The schema for unit stats.
 * Ensures all stat names are present as required keys at runtime.
 */
export const unitStatsSchema: z.ZodType<UnitStats> = _unitStatsSchemaObject;

// Assert type match at compile time
const _assertExactUnitStats: AssertExact<UnitStats, UnitStatsSchemaType> = true;
