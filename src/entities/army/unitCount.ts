import type { UnitType } from "@entities";
import type { AssertExact } from "@utils";
import { unitTypeSchema } from "@entities/unit/unitType";
import { z } from "zod";

export const unitCountSchema = z.object({
  /** The unit type. */
  unitType: unitTypeSchema,
  /** The number of units. */
  count: z.number().int().min(1).max(20),
});

// Helper type to check match of type against schema
type UnitCountSchemaType = z.infer<typeof unitCountSchema>;

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
