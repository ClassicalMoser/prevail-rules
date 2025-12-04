import type { UnitType } from '@entities';
import type { AssertExact } from '@utils';
import { unitTypeSchema } from '@entities';
import { z } from 'zod';

/**
 * A count of units of a specific type.
 */
export interface UnitCount {
  /** The unit type. */
  unitType: UnitType;
  /** The number of units. */
  count: number;
}

const _unitCountSchemaObject = z.object({
  /** The unit type. */
  unitType: unitTypeSchema,
  /** The number of units. */
  count: z.int().min(1).max(20),
});

type UnitCountSchemaType = z.infer<typeof _unitCountSchemaObject>;

/**
 * The schema for a unit count.
 */
export const unitCountSchema: z.ZodType<UnitCount> = _unitCountSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitCount: AssertExact<UnitCount, UnitCountSchemaType> = true;
