import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { UnitPlacement } from './unitPlacement';

import { z } from 'zod';
import { unitInstanceSchema } from '@entities/unit';
import { unitPlacementSchema } from './unitPlacement';

export interface UnitWithPlacement {
  unit: UnitInstance;
  placement: UnitPlacement;
}

const _unitWithPlacementSchemaObject = z.object({
  unit: unitInstanceSchema,
  placement: unitPlacementSchema,
});

type UnitWithPlacementSchemaType = z.infer<
  typeof _unitWithPlacementSchemaObject
>;

/**
 * The schema for a unit with its placement (any board type).
 */
export const unitWithPlacementSchema: z.ZodType<UnitWithPlacement> =
  _unitWithPlacementSchemaObject;

const _assertExactUnitWithPlacement: AssertExact<
  UnitWithPlacement,
  UnitWithPlacementSchemaType
> = true;
