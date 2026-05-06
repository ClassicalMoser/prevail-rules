import type {
  Board,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  playerSideSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { PLAYER_CHOICE_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the move unit event. */
export const MOVE_UNIT_CHOICE_TYPE = "moveUnit" as const;

export interface MoveUnitEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_UNIT_CHOICE_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit to move. */
  unit: UnitWithPlacement<TBoard>;
  /** The space the unit is moving to. */
  to: UnitPlacement<TBoard>;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is moving the unit. */
  player: PlayerSide;
}

export type MoveUnitEvent =
  | MoveUnitEventForBoard<StandardBoard>
  | MoveUnitEventForBoard<SmallBoard>
  | MoveUnitEventForBoard<LargeBoard>;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardMoveUnitEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"standard">;
  unit: typeof standardUnitWithPlacementSchema;
  to: typeof standardUnitPlacementSchema;
  moveCommander: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  unit: standardUnitWithPlacementSchema,
  to: standardUnitPlacementSchema,
  moveCommander: z.boolean(),
});

type StandardMoveUnitEventSchemaType = z.infer<typeof _standardMoveUnitEventSchemaObject>;

const _assertExactStandardMoveUnitEvent: AssertExact<
  MoveUnitEventForBoard<StandardBoard>,
  StandardMoveUnitEventSchemaType
> = true;

export const standardMoveUnitEventSchema: typeof _standardMoveUnitEventSchemaObject =
  _standardMoveUnitEventSchemaObject;

const _smallMoveUnitEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"small">;
  unit: typeof smallUnitWithPlacementSchema;
  to: typeof smallUnitPlacementSchema;
  moveCommander: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  unit: smallUnitWithPlacementSchema,
  to: smallUnitPlacementSchema,
  moveCommander: z.boolean(),
});

type SmallMoveUnitEventSchemaType = z.infer<typeof _smallMoveUnitEventSchemaObject>;

const _assertExactSmallMoveUnitEvent: AssertExact<
  MoveUnitEventForBoard<SmallBoard>,
  SmallMoveUnitEventSchemaType
> = true;

export const smallMoveUnitEventSchema: typeof _smallMoveUnitEventSchemaObject =
  _smallMoveUnitEventSchemaObject;

const _largeMoveUnitEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"large">;
  unit: typeof largeUnitWithPlacementSchema;
  to: typeof largeUnitPlacementSchema;
  moveCommander: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  unit: largeUnitWithPlacementSchema,
  to: largeUnitPlacementSchema,
  moveCommander: z.boolean(),
});

type LargeMoveUnitEventSchemaType = z.infer<typeof _largeMoveUnitEventSchemaObject>;

const _assertExactLargeMoveUnitEvent: AssertExact<
  MoveUnitEventForBoard<LargeBoard>,
  LargeMoveUnitEventSchemaType
> = true;

export const largeMoveUnitEventSchema: typeof _largeMoveUnitEventSchemaObject =
  _largeMoveUnitEventSchemaObject;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

type _MoveUnitEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardMoveUnitEventSchemaObject,
    typeof _smallMoveUnitEventSchemaObject,
    typeof _largeMoveUnitEventSchemaObject,
  ],
  "boardType"
>;

const _moveUnitEventSchemaObject: _MoveUnitEventDiscriminatedUnion = z.discriminatedUnion(
  "boardType",
  [
    _standardMoveUnitEventSchemaObject,
    _smallMoveUnitEventSchemaObject,
    _largeMoveUnitEventSchemaObject,
  ],
);

type MoveUnitEventSchemaType = z.infer<typeof _moveUnitEventSchemaObject>;

const _assertExactMoveUnitEvent: AssertExact<MoveUnitEvent, MoveUnitEventSchemaType> = true;

/** The schema for a move unit event. */
export const moveUnitEventSchema: typeof _moveUnitEventSchemaObject = _moveUnitEventSchemaObject;
