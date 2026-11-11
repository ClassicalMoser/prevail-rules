import type { Coordinate } from '@entities/board';
import type { UnitFacing } from '@entities/unit';
import type { AssertExact } from '@utils';

import { coordinateSchema } from '@entities/board';
import { unitFacingSchema } from '@entities/unit';
import { z } from 'zod';

/**
 * The position and facing of a unit on the board.
 *
 * TODO(misleading): nothing in this value is specific to a unit; it is a
 * coordinate and a facing. Renaming reaches every layer, so it is recorded
 * rather than done.
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
