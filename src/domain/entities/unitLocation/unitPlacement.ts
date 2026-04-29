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

/** {@link UnitPlacement} on a {@link StandardBoard}. */
export type StandardUnitPlacement = UnitPlacement<StandardBoard>;

/** {@link UnitPlacement} on a {@link SmallBoard}. */
export type SmallUnitPlacement = UnitPlacement<SmallBoard>;

/** {@link UnitPlacement} on a {@link LargeBoard}. */
export type LargeUnitPlacement = UnitPlacement<LargeBoard>;

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
  StandardUnitPlacement,
  StandardUnitPlacementSchemaType
> = true;

export const standardUnitPlacementSchema: z.ZodType<StandardUnitPlacement> =
  _standardUnitPlacementSchemaObject;

const _smallUnitPlacementSchemaObject = z.object({
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  coordinate: smallBoardCoordinateSchema,
  facing: unitFacingSchema,
});

type SmallUnitPlacementSchemaType = z.infer<typeof _smallUnitPlacementSchemaObject>;

const _assertExactSmallUnitPlacement: AssertExact<
  SmallUnitPlacement,
  SmallUnitPlacementSchemaType
> = true;

export const smallUnitPlacementSchema: z.ZodType<SmallUnitPlacement> =
  _smallUnitPlacementSchemaObject;

const _largeUnitPlacementSchemaObject = z.object({
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  coordinate: largeBoardCoordinateSchema,
  facing: unitFacingSchema,
});

type LargeUnitPlacementSchemaType = z.infer<typeof _largeUnitPlacementSchemaObject>;

const _assertExactLargeUnitPlacement: AssertExact<
  LargeUnitPlacement,
  LargeUnitPlacementSchemaType
> = true;

export const largeUnitPlacementSchema: z.ZodType<LargeUnitPlacement> =
  _largeUnitPlacementSchemaObject;

// ---------------------------------------------------------------------------
// Wide (union) schema — validates any board's placements
// ---------------------------------------------------------------------------

const _unitPlacementSchemaObject = z.discriminatedUnion("boardType", [
  _standardUnitPlacementSchemaObject,
  _smallUnitPlacementSchemaObject,
  _largeUnitPlacementSchemaObject,
]);

/**
 * The schema for a unit placement (any board type).
 * Per-variant {@link AssertExact} checks above; `z.infer` of the discriminated union
 * is not identical to {@link UnitPlacement}<{@link Board}> at the type level (coordinate
 * literals vs schema inference), so we do not assert the wide union exactly.
 */
export const unitPlacementSchema: z.ZodType<UnitPlacement<Board>> = _unitPlacementSchemaObject;
