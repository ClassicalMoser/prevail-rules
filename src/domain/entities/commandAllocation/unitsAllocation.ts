import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * How a units command is spent: one order, given to between one and the
 * card's number of eligible units, in any order (§4.3.2). No units at all is
 * the player declining to order.
 */
export interface UnitsAllocation {
  /** A units command, as the card in play's command size says. */
  allocationType: 'units';
  /** The units ordered; none declines. */
  units: UnitInstance[];
}

const _unitsAllocationSchemaObject = z
  .object({
    /** A units command, as the card in play's command size says. */
    allocationType: z.literal('units'),
    /** The units ordered; none declines. */
    units: z.array(unitInstanceSchema),
  })
  .strict();

type UnitsAllocationSchemaType = z.infer<typeof _unitsAllocationSchemaObject>;

/** The schema for how a units command is spent. */
export const unitsAllocationSchema: z.ZodObject<{
  allocationType: z.ZodLiteral<'units'>;
  units: z.ZodArray<typeof unitInstanceSchema>;
}> = _unitsAllocationSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitsAllocation: AssertExact<
  UnitsAllocation,
  UnitsAllocationSchemaType
> = true;
