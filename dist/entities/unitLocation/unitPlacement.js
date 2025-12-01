import z from "zod";
import { boardCoordinateSchema } from "../board/boardCoordinates.js";
import { unitFacingSchema } from "../unit/unitFacing.js";
export const unitPlacementSchema = z.object({
    coordinate: boardCoordinateSchema,
    facing: unitFacingSchema,
});
export const _assertExactUnitPlacement = true;
