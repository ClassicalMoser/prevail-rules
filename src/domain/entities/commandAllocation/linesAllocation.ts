import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * How a lines command is spent: up to the card's number of separate orders,
 * each given to one line (§4.3.3). Each line is listed unit by unit in rank
 * order from either end; a line of one lists one unit (§4.3.5). Fewer lines
 * than the card allows forfeits the rest, and none at all orders nobody.
 */
export interface LinesAllocation {
  /** A lines command, as the card in play's command size says. */
  allocationType: 'lines';
  /** Each line ordered, every unit of it, in rank order from either end. */
  lines: UnitInstance[][];
}

const _linesAllocationSchemaObject = z
  .object({
    /** A lines command, as the card in play's command size says. */
    allocationType: z.literal('lines'),
    /** Each line ordered, every unit of it, in rank order from either end. */
    lines: z.array(z.array(unitInstanceSchema)),
  })
  .strict();

type LinesAllocationSchemaType = z.infer<typeof _linesAllocationSchemaObject>;

/** The schema for how a lines command is spent. */
export const linesAllocationSchema: z.ZodObject<{
  allocationType: z.ZodLiteral<'lines'>;
  lines: z.ZodArray<z.ZodArray<typeof unitInstanceSchema>>;
}> = _linesAllocationSchemaObject;

// Verify manual type matches schema inference
const _assertExactLinesAllocation: AssertExact<
  LinesAllocation,
  LinesAllocationSchemaType
> = true;
