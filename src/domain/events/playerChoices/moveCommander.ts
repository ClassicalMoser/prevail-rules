import type {
  Board,
  LargeBoard,
  LargeBoardCoordinate,
  PlayerSide,
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
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

interface MoveCommanderEventBase {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_COMMANDER_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is moving the commander. */
  player: PlayerSide;
}

export interface StandardMoveCommanderEvent extends MoveCommanderEventBase {
  boardType: "standard";
  from: StandardBoardCoordinate;
  to: StandardBoardCoordinate;
}

export interface SmallMoveCommanderEvent extends MoveCommanderEventBase {
  boardType: "small";
  from: SmallBoardCoordinate;
  to: SmallBoardCoordinate;
}

export interface LargeMoveCommanderEvent extends MoveCommanderEventBase {
  boardType: "large";
  from: LargeBoardCoordinate;
  to: LargeBoardCoordinate;
}

export type MoveCommanderEventUnion =
  | StandardMoveCommanderEvent
  | SmallMoveCommanderEvent
  | LargeMoveCommanderEvent;

export type MoveCommanderEvent<
  TBoard extends Board = Board,
  _TChoiceType extends typeof MOVE_COMMANDER_CHOICE_TYPE = typeof MOVE_COMMANDER_CHOICE_TYPE,
> = TBoard extends StandardBoard
  ? StandardMoveCommanderEvent
  : TBoard extends SmallBoard
    ? SmallMoveCommanderEvent
    : TBoard extends LargeBoard
      ? LargeMoveCommanderEvent
      : MoveCommanderEventUnion;

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
  StandardMoveCommanderEvent,
  StandardMoveCommanderEventSchemaType
> = true;

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
  SmallMoveCommanderEvent,
  SmallMoveCommanderEventSchemaType
> = true;

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
  LargeMoveCommanderEvent,
  LargeMoveCommanderEventSchemaType
> = true;

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
  MoveCommanderEvent<Board>,
  MoveCommanderEventSchemaType
> = true;

/** The schema for a move commander event. */
export const moveCommanderEventSchema: typeof _moveCommanderEventSchemaObject =
  _moveCommanderEventSchemaObject;
