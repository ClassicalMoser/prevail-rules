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

/** The type of the choose melee resolution event. */
export const CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE = "chooseMeleeResolution" as const;

export interface ChooseMeleeResolutionEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The space the melee is occurring in. */
  space: BoardCoordinate<TBoard>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is choosing the melee resolution. */
  player: PlayerSide;
}

export type ChooseMeleeResolutionEvent =
  | ChooseMeleeResolutionEventForBoard<StandardBoard>
  | ChooseMeleeResolutionEventForBoard<SmallBoard>
  | ChooseMeleeResolutionEventForBoard<LargeBoard>;

const _standardChooseMeleeResolutionEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"standard">;
  space: typeof standardBoardCoordinateSchema;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  space: standardBoardCoordinateSchema,
});

type StandardChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _standardChooseMeleeResolutionEventSchemaObject
>;

const _assertExactStandardChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEventForBoard<StandardBoard>,
  StandardChooseMeleeResolutionEventSchemaType
> = true;

export const standardChooseMeleeResolutionEventSchema: typeof _standardChooseMeleeResolutionEventSchemaObject =
  _standardChooseMeleeResolutionEventSchemaObject;

const _smallChooseMeleeResolutionEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"small">;
  space: typeof smallBoardCoordinateSchema;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  space: smallBoardCoordinateSchema,
});

type SmallChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _smallChooseMeleeResolutionEventSchemaObject
>;

const _assertExactSmallChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEventForBoard<SmallBoard>,
  SmallChooseMeleeResolutionEventSchemaType
> = true;

export const smallChooseMeleeResolutionEventSchema: typeof _smallChooseMeleeResolutionEventSchemaObject =
  _smallChooseMeleeResolutionEventSchemaObject;

const _largeChooseMeleeResolutionEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"large">;
  space: typeof largeBoardCoordinateSchema;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(CHOOSE_MELEE_RESOLUTION_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  space: largeBoardCoordinateSchema,
});

type LargeChooseMeleeResolutionEventSchemaType = z.infer<
  typeof _largeChooseMeleeResolutionEventSchemaObject
>;

const _assertExactLargeChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEventForBoard<LargeBoard>,
  LargeChooseMeleeResolutionEventSchemaType
> = true;

export const largeChooseMeleeResolutionEventSchema: typeof _largeChooseMeleeResolutionEventSchemaObject =
  _largeChooseMeleeResolutionEventSchemaObject;

type _ChooseMeleeResolutionEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardChooseMeleeResolutionEventSchemaObject,
    typeof _smallChooseMeleeResolutionEventSchemaObject,
    typeof _largeChooseMeleeResolutionEventSchemaObject,
  ],
  "boardType"
>;

const _chooseMeleeResolutionEventSchemaObject: _ChooseMeleeResolutionEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardChooseMeleeResolutionEventSchemaObject,
    _smallChooseMeleeResolutionEventSchemaObject,
    _largeChooseMeleeResolutionEventSchemaObject,
  ]);

type ChooseMeleeResolutionEventSchemaType = z.infer<typeof _chooseMeleeResolutionEventSchemaObject>;

const _assertExactChooseMeleeResolutionEvent: AssertExact<
  ChooseMeleeResolutionEvent,
  ChooseMeleeResolutionEventSchemaType
> = true;

/** The schema for a choose melee resolution event. */
export const chooseMeleeResolutionEventSchema: typeof _chooseMeleeResolutionEventSchemaObject =
  _chooseMeleeResolutionEventSchemaObject;
