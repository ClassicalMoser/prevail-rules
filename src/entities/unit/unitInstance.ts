import type { AssertExact } from "../../utils/assertExact.js";
import type { UnitType } from "./unitType.js";

import { z } from "zod";
import { unitTypeSchema } from "./unitType.js";

/**
 * The schema for a unit instance.
 */
export const unitInstanceSchema = z.object({
  instanceNumber: z.number().min(1).max(20),
  unitType: unitTypeSchema,
});

// Helper type to check match of type against schema
type UnitInstanceSchemaType = z.infer<typeof unitInstanceSchema>;

/**
 * An individual instance of a unit.
 */
export interface UnitInstance {
  /** Which instance of the unit this is. */
  instanceNumber: number;
  /** The type of unit this is an instance of. */
  unitType: UnitType;
}

const _assertExactUnitInstance: AssertExact<
  UnitInstance,
  UnitInstanceSchemaType
> = true;
