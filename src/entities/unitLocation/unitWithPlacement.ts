import type { Board } from "@entities/board/board.js";
import type { UnitInstance } from "@entities/unit/unitInstance.js";
import type { UnitPlacement } from "@entities/unitLocation/unitPlacement.js";
import type { AssertExact } from "@utils/assertExact.js";

import { unitInstanceSchema } from "@entities/unit/unitInstance.js";
import { unitPlacementSchema } from "@entities/unitLocation/unitPlacement.js";
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
