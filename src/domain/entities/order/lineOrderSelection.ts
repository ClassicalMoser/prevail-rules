import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * A line, listed unit by unit in rank order from either end; a line of one
 * lists one unit (§4.3.5). Every unit listed is ordered, and validation
 * checks that the list is a whole legal line.
 */
export interface LineOrderSelection {
  /** A line order. */
  selectionType: 'line';
  /** Every unit of the line, in rank order from either end. */
  units: UnitInstance[];
}

const _lineOrderSelectionSchemaObject = z
  .object({
    /** A line order. */
    selectionType: z.literal('line'),
    /** Every unit of the line, in rank order from either end. */
    units: z.array(unitInstanceSchema),
  })
  .strict();

type LineOrderSelectionSchemaType = z.infer<
  typeof _lineOrderSelectionSchemaObject
>;

/** The schema for the line a line order commands. */
export const lineOrderSelectionSchema: z.ZodObject<{
  selectionType: z.ZodLiteral<'line'>;
  units: z.ZodArray<typeof unitInstanceSchema>;
}> = _lineOrderSelectionSchemaObject;

// Verify manual type matches schema inference
const _assertExactLineOrderSelection: AssertExact<
  LineOrderSelection,
  LineOrderSelectionSchemaType
> = true;
