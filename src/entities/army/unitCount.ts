import type { AssertExact } from "../../utils/assertExact.js";
import type { UnitType } from "../unit/unitType.js";
import { z } from "zod";
import { unitTypeSchema } from "../unit/unitType.js";

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
