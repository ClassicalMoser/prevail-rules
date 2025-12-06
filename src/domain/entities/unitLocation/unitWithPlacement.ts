import type { AssertExact } from '@utils';
import type { Board } from '../board';
import type { UnitInstance } from '../unit';
import type { UnitPlacement } from './unitPlacement';

import { z } from 'zod';
import { unitInstanceSchema } from '../unit';
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
