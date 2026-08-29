import type { AssertExact } from '@utils';
import type { UnitWithPlacement } from '@entities/unitLocation';
import { z } from 'zod';
import { unitWithPlacementSchema } from '@entities/unitLocation';

/**
 * A line is a group of friendly units that are beside each other
 * and facing the same or opposite direction.
 */
export interface Line {
  unitPlacements: UnitWithPlacement[];
}

const _lineSchemaObject = z.object({
  unitPlacements: z.array(unitWithPlacementSchema),
});

type LineSchemaType = z.infer<typeof _lineSchemaObject>;

/**
 * The schema for a line of units.
 *
 * Note that this does not enforce correctness of geometry, only object structure.
 */
export const lineSchema: z.ZodType<Line> = _lineSchemaObject;

// Verify manual type matches schema inference
const _assertExactLine: AssertExact<Line, LineSchemaType> = true;
