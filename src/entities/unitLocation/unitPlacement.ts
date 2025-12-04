import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema, unitFacingSchema } from '@entities';
import z from 'zod';

const _unitPlacementSchemaObject = z.object({
  coordinate: boardCoordinateSchema,
  facing: unitFacingSchema,
});

type UnitPlacementSchemaType = z.infer<typeof _unitPlacementSchemaObject>;
export const unitPlacementSchema: z.ZodType<UnitPlacement<Board>> =
  _unitPlacementSchemaObject;

export interface UnitPlacement<TBoard extends Board> {
  coordinate: BoardCoordinate<TBoard>;
  facing: UnitFacing;
}

const _assertExactUnitPlacement: AssertExact<
  UnitPlacement<any>,
  UnitPlacementSchemaType
> = true;
