import type {
  Board,
  BoardCoordinate,
  LargeBoard,
  SmallBoard,
  StandardBoard,
} from "@entities/board";
import type { UnitFacing } from "@entities/unit";
import type { AssertExact } from "@utils";

import {
  largeBoardCoordinateSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from "@entities/board";
import { unitFacingSchema } from "@entities/unit";
import z from "zod";

/** The position and facing of a unit on the board. */
export interface UnitPlacement<TBoard extends Board> {
  boardType: TBoard["boardType"];
  coordinate: BoardCoordinate<TBoard>;
  facing: UnitFacing;
}

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardUnitPlacementSchemaObject = z.object({
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  coordinate: standardBoardCoordinateSchema,
  facing: unitFacingSchema,
});

type StandardUnitPlacementSchemaType = z.infer<typeof _standardUnitPlacementSchemaObject>;

const _assertExactStandardUnitPlacement: AssertExact<
  UnitPlacement<StandardBoard>,
  StandardUnitPlacementSchemaType
> = true;

export const standardUnitPlacementSchema: z.ZodType<UnitPlacement<StandardBoard>> =
  _standardUnitPlacementSchemaObject;

const _smallUnitPlacementSchemaObject = z.object({
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  coordinate: smallBoardCoordinateSchema,
  facing: unitFacingSchema,
});

type SmallUnitPlacementSchemaType = z.infer<typeof _smallUnitPlacementSchemaObject>;

const _assertExactSmallUnitPlacement: AssertExact<
  UnitPlacement<SmallBoard>,
  SmallUnitPlacementSchemaType
> = true;

export const smallUnitPlacementSchema: z.ZodType<UnitPlacement<SmallBoard>> =
  _smallUnitPlacementSchemaObject;

const _largeUnitPlacementSchemaObject = z.object({
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  coordinate: largeBoardCoordinateSchema,
  facing: unitFacingSchema,
});

type LargeUnitPlacementSchemaType = z.infer<typeof _largeUnitPlacementSchemaObject>;

const _assertExactLargeUnitPlacement: AssertExact<
  UnitPlacement<LargeBoard>,
  LargeUnitPlacementSchemaType
> = true;

export const largeUnitPlacementSchema: z.ZodType<UnitPlacement<LargeBoard>> =
  _largeUnitPlacementSchemaObject;

// ---------------------------------------------------------------------------
// Wide (union) schema — validates any board's placements
// ---------------------------------------------------------------------------

const _unitPlacementSchemaObject = z.discriminatedUnion("boardType", [
  _standardUnitPlacementSchemaObject,
  _smallUnitPlacementSchemaObject,
  _largeUnitPlacementSchemaObject,
]);

type UnitPlacementSchemaType = z.infer<typeof _unitPlacementSchemaObject>;

const _assertExactUnitPlacement: AssertExact<
  UnitPlacement<SmallBoard> | UnitPlacement<StandardBoard> | UnitPlacement<LargeBoard>,
  UnitPlacementSchemaType
> = true;

/**
 * The schema for a unit placement (any board type).
 * Per-variant {@link AssertExact} checks above; `z.infer` of the discriminated union
 * is not identical to {@link UnitPlacement}<{@link Board}> at the type level (coordinate
 * literals vs schema inference), so we do not assert the wide union exactly.
 */
export const unitPlacementSchema: z.ZodType<UnitPlacement<Board>> = _unitPlacementSchemaObject;
