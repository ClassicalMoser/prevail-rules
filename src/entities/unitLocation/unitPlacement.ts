import type { Board, BoardCoordinate, UnitFacing } from "@entities";
import type { AssertExact } from "@utils";
import { boardCoordinateSchema, unitFacingSchema } from "@entities";
import z from "zod";

export const unitPlacementSchema = z.object({
  coordinate: boardCoordinateSchema,
  facing: unitFacingSchema,
});

type UnitPlacementSchemaType = z.infer<typeof unitPlacementSchema>;

export interface UnitPlacement<TBoard extends Board> {
  coordinate: BoardCoordinate<TBoard>;
  facing: UnitFacing;
}

export const _assertExactUnitPlacement: AssertExact<
  UnitPlacement<any>,
  UnitPlacementSchemaType
> = true;
