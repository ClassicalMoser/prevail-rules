import type { Trait } from '@ruleValues';
import type { AssertExact } from '@utils';
import type { UnitStats } from './unitStat';
import { traitSchema } from '@ruleValues';
import { z } from 'zod';
import { unitStatsSchema } from './unitStat';

/**
 * A unit of troops.
 * A unit is the atomic element of an army in this game.
 */
export interface UnitType {
  /** The unique identifier of the unit. */
  id: string;
  /** The capitalized name of the unit. */
  name: string;
  /** The traits of the unit. */
  traits: Trait[];
  /** The stats of the unit. */
  stats: UnitStats;
  /** The cost of the unit. */
  cost: number;
  /** The limit of units that can be included in a standard army. */
  limit: number;
  /** The number of cards the owner must discard when the unit is routed. */
  routPenalty: number;
}

const _unitTypeSchemaObject = z.object({
  /** Not sure yet how the units will be identified,
   * but we need to have a unique identifier for each unit type.
   */
  id: z.string(),
  /** The name of the unit, capitalized with spaces. */
  name: z.string(),
  /** The traits of the unit. */
  traits: z.array(traitSchema),
  /** The stats of the unit. */
  stats: unitStatsSchema,
  /** The cost of the unit. */
  cost: z.int().min(5).max(100),
  /** The limit of units that can be included in a standard army. */
  limit: z.int().min(1).max(20),
  /** The number of cards the owner must discard when the unit is routed. */
  routPenalty: z.int().min(0).max(5),
});

type UnitTypeSchemaType = z.infer<typeof _unitTypeSchemaObject>;

/**
 * The schema for a unit of troops.
 * A unit is the atomic element of an army in this game.
 */
export const unitTypeSchema: z.ZodType<UnitType> = _unitTypeSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitType: AssertExact<UnitType, UnitTypeSchemaType> = true;
