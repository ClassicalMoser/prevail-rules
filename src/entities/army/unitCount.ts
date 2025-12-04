import type { UnitType } from '@entities';
import type { AssertExact } from '@utils';
import { unitTypeSchema } from '@entities';
import { z } from 'zod';

const _unitCountSchemaObject = z.object({
  /** The unit type. */
  unitType: unitTypeSchema,
  /** The number of units. */
  count: z.number().int().min(1).max(20),
});

type UnitCountSchemaType = z.infer<typeof _unitCountSchemaObject>;
export const unitCountSchema: z.ZodType<UnitCount> = _unitCountSchemaObject;

/**
 * A count of units of a specific type.
 */
export interface UnitCount {
  /** The unit type. */
  unitType: UnitType;
  /** The number of units. */
  count: number;
}

/**
 * Check that the unit count type matches the schema.
 */
const _assertExactUnitCount: AssertExact<UnitCount, UnitCountSchemaType> = true;
