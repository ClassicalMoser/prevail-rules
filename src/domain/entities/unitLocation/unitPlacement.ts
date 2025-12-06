import type { AssertExact } from '@utils';
import type { Board, BoardCoordinate } from '../board';
import type { UnitFacing } from '../unit';

import z from 'zod';
import { boardCoordinateSchema } from '../board';
import { unitFacingSchema } from '../unit';


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
