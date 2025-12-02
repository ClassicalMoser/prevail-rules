import type { AssertExact } from "src/utils/assertExact.js";
import type { UnitWithPlacement } from "./unitLocation/unitWithPlacement.js";
import { z } from "zod";
import { unitWithPlacementSchema } from "./unitLocation/unitWithPlacement.js";

/**
 * The schema for a line.
 */
export const lineSchema = z.object({
  unitPlacements: z.array(unitWithPlacementSchema),
});

export type LineSchemaType = z.infer<typeof lineSchema>;

/**
 * A line is a group of friendly units that are beside each other
 * and facing the same or opposite direction.
 */
export interface Line {
  unitPlacements: UnitWithPlacement<any>[];
}

export const _assertExactLine: AssertExact<Line, LineSchemaType> = true;
