import type { Board, UnitInstance } from "@entities";
import type { UnitPlacement } from "@entities/unitLocation";
import type { AssertExact } from "@utils";
import { unitInstanceSchema } from "@entities";
import { unitPlacementSchema } from "@entities/unitLocation";
import { z } from "zod";
export const unitWithPlacementSchema = z.object({
  unit: unitInstanceSchema,
  placement: unitPlacementSchema,
});

export type UnitWithPlacementSchemaType = z.infer<
  typeof unitWithPlacementSchema
>;

export interface UnitWithPlacement<TBoard extends Board> {
  unit: UnitInstance;
  placement: UnitPlacement<TBoard>;
}

export const _assertExactUnitWithPlacement: AssertExact<
  UnitWithPlacement<any>,
  UnitWithPlacementSchemaType
> = true;
