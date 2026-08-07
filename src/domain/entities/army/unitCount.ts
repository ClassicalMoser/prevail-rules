import type { UnitType } from '@entities/unit';
import type { AssertExact } from '@utils';
import { unitTypeSchema } from '@entities/unit';
import { z } from 'zod';
import { MAX_ARMY_UNIT_TYPE_COUNT } from '@ruleValues';

/**
 * A count of units of a specific type.
 */
export interface UnitCount {
  /** The unit type. */
  unitType: UnitType;
  /** The number of units. */
  count: number;
}

const _unitCountSchemaObject = z.object(
  {
    /** The unit type. */
    unitType: unitTypeSchema,
    /** The number of units. */
    count: z.int().min(1).max(MAX_ARMY_UNIT_TYPE_COUNT),
  },
  {
    message: `Unit must be valid and count must be between 1 and ${MAX_ARMY_UNIT_TYPE_COUNT}.`,
  },
);

type UnitCountSchemaType = z.infer<typeof _unitCountSchemaObject>;

/**
 * The schema for a unit count.
 */
export const unitCountSchema: z.ZodType<UnitCount> = _unitCountSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitCount: AssertExact<UnitCount, UnitCountSchemaType> = true;
