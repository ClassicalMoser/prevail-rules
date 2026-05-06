import type { Board, LargeBoard, SmallBoard, StandardBoard } from "@entities/board";
import type { UnitInstance } from "@entities/unit";
import type { AssertExact } from "@utils";
import type { UnitPlacement } from "./unitPlacement";

import { unitInstanceSchema } from "@entities/unit";
import { z } from "zod";
import {
  largeUnitPlacementSchema,
  smallUnitPlacementSchema,
  standardUnitPlacementSchema,
} from "./unitPlacement";

export interface UnitWithPlacement<TBoard extends Board> {
  boardType: TBoard["boardType"];
  unit: UnitInstance;
  placement: UnitPlacement<TBoard>;
}

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardUnitWithPlacementSchemaObject = z.object({
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  unit: unitInstanceSchema,
  placement: standardUnitPlacementSchema,
});

type StandardUnitWithPlacementSchemaType = z.infer<typeof _standardUnitWithPlacementSchemaObject>;

const _assertExactStandardUnitWithPlacement: AssertExact<
  UnitWithPlacement<StandardBoard>,
  StandardUnitWithPlacementSchemaType
> = true;

export const standardUnitWithPlacementSchema: z.ZodType<UnitWithPlacement<StandardBoard>> =
  _standardUnitWithPlacementSchemaObject;

const _smallUnitWithPlacementSchemaObject = z.object({
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  unit: unitInstanceSchema,
  placement: smallUnitPlacementSchema,
});

type SmallUnitWithPlacementSchemaType = z.infer<typeof _smallUnitWithPlacementSchemaObject>;

const _assertExactSmallUnitWithPlacement: AssertExact<
  UnitWithPlacement<SmallBoard>,
  SmallUnitWithPlacementSchemaType
> = true;

export const smallUnitWithPlacementSchema: z.ZodType<UnitWithPlacement<SmallBoard>> =
  _smallUnitWithPlacementSchemaObject;

const _largeUnitWithPlacementSchemaObject = z.object({
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  unit: unitInstanceSchema,
  placement: largeUnitPlacementSchema,
});

type LargeUnitWithPlacementSchemaType = z.infer<typeof _largeUnitWithPlacementSchemaObject>;

const _assertExactLargeUnitWithPlacement: AssertExact<
  UnitWithPlacement<LargeBoard>,
  LargeUnitWithPlacementSchemaType
> = true;

export const largeUnitWithPlacementSchema: z.ZodType<UnitWithPlacement<LargeBoard>> =
  _largeUnitWithPlacementSchemaObject;

// ---------------------------------------------------------------------------
// Wide (union) schema — validates any board's unit-with-placement
// ---------------------------------------------------------------------------

const _unitWithPlacementSchemaObject = z.discriminatedUnion("boardType", [
  _standardUnitWithPlacementSchemaObject,
  _smallUnitWithPlacementSchemaObject,
  _largeUnitWithPlacementSchemaObject,
]);

type UnitWithPlacementSchemaType = z.infer<typeof _unitWithPlacementSchemaObject>;

const _assertExactUnitWithPlacement: AssertExact<
  UnitWithPlacement<SmallBoard> | UnitWithPlacement<StandardBoard> | UnitWithPlacement<LargeBoard>,
  UnitWithPlacementSchemaType
> = true;

/**
 * The schema for a unit with its placement (any board type).
 * Per-variant {@link AssertExact} checks above; wide union not asserted (same reason as
 * unitPlacementSchema).
 */
export const unitWithPlacementSchema: z.ZodType<UnitWithPlacement<Board>> =
  _unitWithPlacementSchemaObject;
