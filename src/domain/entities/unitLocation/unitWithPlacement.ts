import type { Board } from '@entities/board';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { UnitPlacement } from './unitPlacement';

import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { unitPlacementSchema } from './unitPlacement';

export interface UnitWithPlacement<TBoard extends Board> {
  unit: UnitInstance;
  placement: UnitPlacement<TBoard>;
}

const _unitWithPlacementSchemaObject = z.object({
  unit: unitInstanceSchema,
  placement: unitPlacementSchema,
});

type UnitWithPlacementSchemaType = z.infer<
  typeof _unitWithPlacementSchemaObject
>;

/**
 * The schema for a unit with its placement.
 */
export const unitWithPlacementSchema: z.ZodType<UnitWithPlacement<Board>> =
  _unitWithPlacementSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitWithPlacement: AssertExact<
  UnitWithPlacement<any>,
  UnitWithPlacementSchemaType
> = true;
