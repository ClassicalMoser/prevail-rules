import type { UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitWithPlacementSchema } from '@entities';
import { z } from 'zod';

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
