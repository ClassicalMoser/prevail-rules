import type {
  Board,
  BoardCoordinate,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
} from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  largeBoardCoordinateSchema,
  playerSideSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from "@entities";
import { PLAYER_CHOICE_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the move commander event. */
export const MOVE_COMMANDER_CHOICE_TYPE = "moveCommander" as const;

export interface MoveCommanderEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_COMMANDER_CHOICE_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The coordinate the commander is moving from. */
  from: BoardCoordinate<TBoard>;
  /** The coordinate the commander is moving to. */
  to: BoardCoordinate<TBoard>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is moving the commander. */
  player: PlayerSide;
}

export type MoveCommanderEvent =
  | MoveCommanderEventForBoard<StandardBoard>
  | MoveCommanderEventForBoard<SmallBoard>
  | MoveCommanderEventForBoard<LargeBoard>;

const _standardMoveCommanderEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_COMMANDER_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"standard">;
  from: typeof standardBoardCoordinateSchema;
  to: typeof standardBoardCoordinateSchema;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_COMMANDER_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  from: standardBoardCoordinateSchema,
  to: standardBoardCoordinateSchema,
});

type StandardMoveCommanderEventSchemaType = z.infer<typeof _standardMoveCommanderEventSchemaObject>;

const _assertExactStandardMoveCommanderEvent: AssertExact<
  MoveCommanderEventForBoard<StandardBoard>,
  StandardMoveCommanderEventSchemaType
> = true;

export const standardMoveCommanderEventSchema: typeof _standardMoveCommanderEventSchemaObject =
  _standardMoveCommanderEventSchemaObject;

const _smallMoveCommanderEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_COMMANDER_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"small">;
  from: typeof smallBoardCoordinateSchema;
  to: typeof smallBoardCoordinateSchema;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_COMMANDER_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  from: smallBoardCoordinateSchema,
  to: smallBoardCoordinateSchema,
});

type SmallMoveCommanderEventSchemaType = z.infer<typeof _smallMoveCommanderEventSchemaObject>;

const _assertExactSmallMoveCommanderEvent: AssertExact<
  MoveCommanderEventForBoard<SmallBoard>,
  SmallMoveCommanderEventSchemaType
> = true;

export const smallMoveCommanderEventSchema: typeof _smallMoveCommanderEventSchemaObject =
  _smallMoveCommanderEventSchemaObject;

const _largeMoveCommanderEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_COMMANDER_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"large">;
  from: typeof largeBoardCoordinateSchema;
  to: typeof largeBoardCoordinateSchema;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(MOVE_COMMANDER_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  from: largeBoardCoordinateSchema,
  to: largeBoardCoordinateSchema,
});

type LargeMoveCommanderEventSchemaType = z.infer<typeof _largeMoveCommanderEventSchemaObject>;

const _assertExactLargeMoveCommanderEvent: AssertExact<
  MoveCommanderEventForBoard<LargeBoard>,
  LargeMoveCommanderEventSchemaType
> = true;

export const largeMoveCommanderEventSchema: typeof _largeMoveCommanderEventSchemaObject =
  _largeMoveCommanderEventSchemaObject;

type _MoveCommanderEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardMoveCommanderEventSchemaObject,
    typeof _smallMoveCommanderEventSchemaObject,
    typeof _largeMoveCommanderEventSchemaObject,
  ],
  "boardType"
>;

const _moveCommanderEventSchemaObject: _MoveCommanderEventDiscriminatedUnion = z.discriminatedUnion(
  "boardType",
  [
    _standardMoveCommanderEventSchemaObject,
    _smallMoveCommanderEventSchemaObject,
    _largeMoveCommanderEventSchemaObject,
  ],
);

type MoveCommanderEventSchemaType = z.infer<typeof _moveCommanderEventSchemaObject>;

const _assertExactMoveCommanderEvent: AssertExact<
  MoveCommanderEvent,
  MoveCommanderEventSchemaType
> = true;

/** The schema for a move commander event. */
export const moveCommanderEventSchema: typeof _moveCommanderEventSchemaObject =
  _moveCommanderEventSchemaObject;
