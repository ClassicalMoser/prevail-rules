import type { AssertExact } from "src/utils/assertExact.js";
import type { Board } from "../board/board.js";
import type { BoardCoordinate } from "../board/boardCoordinates.js";
import type { UnitFacing } from "../unit/unitFacing.js";
import z from "zod";
import { boardCoordinateSchema } from "../board/boardCoordinates.js";
import { unitFacingSchema } from "../unit/unitFacing.js";

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
