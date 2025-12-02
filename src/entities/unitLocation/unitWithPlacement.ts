import type { AssertExact } from "src/utils/assertExact.js";
import type { Board } from "../board/board.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import type { UnitPlacement } from "./unitPlacement.js";

import { z } from "zod";
import { unitInstanceSchema } from "../unit/unitInstance.js";
import { unitPlacementSchema } from "./unitPlacement.js";
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
