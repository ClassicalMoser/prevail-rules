import type { Coordinate } from '@ruleValues';
import type { UnitFacing } from './unitFacing';
import type { AssertExact } from '@utils';

import { coordinateSchema } from '@ruleValues';
import { unitFacingSchema } from './unitFacing';
import { z } from 'zod';

/**
 * The position and facing of a unit on the board.
 */
export interface UnitPlacement {
  coordinate: Coordinate;
  facing: UnitFacing;
}

const _unitPlacementSchemaObject = z
  .object({
    coordinate: coordinateSchema,
    facing: unitFacingSchema,
  })
  .strict();

type UnitPlacementSchemaType = z.infer<typeof _unitPlacementSchemaObject>;

/** The schema for a unit placement. */
export const unitPlacementSchema: z.ZodType<UnitPlacement> =
  _unitPlacementSchemaObject;

const _assertExactUnitPlacement: AssertExact<
  UnitPlacement,
  UnitPlacementSchemaType
> = true;
