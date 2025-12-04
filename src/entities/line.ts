import type { UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitWithPlacementSchema } from '@entities';
import { z } from 'zod';

/**
 * A line is a group of friendly units that are beside each other
 * and facing the same or opposite direction.
 */
export interface Line {
  unitPlacements: UnitWithPlacement<any>[];
}

const _lineSchemaObject = z.object({
  unitPlacements: z.array(unitWithPlacementSchema),
});

type LineSchemaType = z.infer<typeof _lineSchemaObject>;

/**
 * The schema for a line of units.
 */
export const lineSchema: z.ZodType<Line> = _lineSchemaObject;

// Verify manual type matches schema inference
const _assertExactLine: AssertExact<Line, LineSchemaType> = true;
