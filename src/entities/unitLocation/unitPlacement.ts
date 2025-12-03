import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import type { AssertExact } from "@utils/assertExact.js";
import { boardCoordinateSchema } from "@entities/board/boardCoordinates.js";
import { unitFacingSchema } from "@entities/unit/unitFacing.js";
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
