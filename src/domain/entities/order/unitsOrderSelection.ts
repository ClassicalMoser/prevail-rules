import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * The units a units order commands: one to the order's number (§4.3.2), in
 * any order.
 */
export interface UnitsOrderSelection {
  /** A units order. */
  selectionType: 'units';
  /** The units ordered. */
  units: UnitInstance[];
}

const _unitsOrderSelectionSchemaObject = z
  .object({
    /** A units order. */
    selectionType: z.literal('units'),
    /** The units ordered. */
    units: z.array(unitInstanceSchema),
  })
  .strict();

type UnitsOrderSelectionSchemaType = z.infer<
  typeof _unitsOrderSelectionSchemaObject
>;

/** The schema for the units a units order commands. */
export const unitsOrderSelectionSchema: z.ZodObject<{
  selectionType: z.ZodLiteral<'units'>;
  units: z.ZodArray<typeof unitInstanceSchema>;
}> = _unitsOrderSelectionSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitsOrderSelection: AssertExact<
  UnitsOrderSelection,
  UnitsOrderSelectionSchemaType
> = true;
