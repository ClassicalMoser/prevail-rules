import type { Board, BoardCoordinate } from '@entities/board';
import type { UnitFacing } from '@entities/unit';
import type { AssertExact } from '@utils';

import { boardCoordinateSchema } from '@entities/board';
import { unitFacingSchema } from '@entities/unit';
import z from 'zod';

/** The position and facing of a unit on the board. */
export interface UnitPlacement<TBoard extends Board> {
  coordinate: BoardCoordinate<TBoard>;
  facing: UnitFacing;
}

const _unitPlacementSchemaObject = z.object({
  coordinate: boardCoordinateSchema,
  facing: unitFacingSchema,
});

type UnitPlacementSchemaType = z.infer<typeof _unitPlacementSchemaObject>;

/**
 * The schema for a unit placement.
 */
export const unitPlacementSchema: z.ZodType<UnitPlacement<Board>> =
  _unitPlacementSchemaObject;

// Verify manual type matches schema inference
const _assertExactUnitPlacement: AssertExact<
  UnitPlacement<any>,
  UnitPlacementSchemaType
> = true;
