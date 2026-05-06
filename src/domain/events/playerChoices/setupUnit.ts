import type {
  Board,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
  UnitWithPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  largeUnitWithPlacementSchema,
  playerSideSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { PLAYER_CHOICE_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the setup units event. */
export const SETUP_UNITS_CHOICE_TYPE = "setupUnits" as const;

export interface SetupUnitsEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof SETUP_UNITS_CHOICE_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The units to setup, each with its placement. */
  unitPlacements: Set<UnitWithPlacement<TBoard>>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is setting up the units. */
  player: PlayerSide;
}

export type SetupUnitsEvent =
  | SetupUnitsEventForBoard<StandardBoard>
  | SetupUnitsEventForBoard<SmallBoard>
  | SetupUnitsEventForBoard<LargeBoard>;

const _standardSetupUnitsEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  boardType: z.ZodLiteral<"standard">;
  unitPlacements: z.ZodSet<typeof standardUnitWithPlacementSchema>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  unitPlacements: z.set(standardUnitWithPlacementSchema),
  player: playerSideSchema,
  eventNumber: z.number(),
});

type StandardSetupUnitsEventSchemaType = z.infer<typeof _standardSetupUnitsEventSchemaObject>;

const _assertExactStandardSetupUnitsEvent: AssertExact<
  SetupUnitsEventForBoard<StandardBoard>,
  StandardSetupUnitsEventSchemaType
> = true;

export const standardSetupUnitsEventSchema: typeof _standardSetupUnitsEventSchemaObject =
  _standardSetupUnitsEventSchemaObject;

const _smallSetupUnitsEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"small">;
  unitPlacements: z.ZodSet<typeof smallUnitWithPlacementSchema>;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  unitPlacements: z.set(smallUnitWithPlacementSchema),
});

type SmallSetupUnitsEventSchemaType = z.infer<typeof _smallSetupUnitsEventSchemaObject>;

const _assertExactSmallSetupUnitsEvent: AssertExact<
  SetupUnitsEventForBoard<SmallBoard>,
  SmallSetupUnitsEventSchemaType
> = true;

export const smallSetupUnitsEventSchema: typeof _smallSetupUnitsEventSchemaObject =
  _smallSetupUnitsEventSchemaObject;

const _largeSetupUnitsEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"large">;
  unitPlacements: z.ZodSet<typeof largeUnitWithPlacementSchema>;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("large"),
  unitPlacements: z.set(largeUnitWithPlacementSchema),
});

type LargeSetupUnitsEventSchemaType = z.infer<typeof _largeSetupUnitsEventSchemaObject>;

const _assertExactLargeSetupUnitsEvent: AssertExact<
  SetupUnitsEventForBoard<LargeBoard>,
  LargeSetupUnitsEventSchemaType
> = true;

export const largeSetupUnitsEventSchema: typeof _largeSetupUnitsEventSchemaObject =
  _largeSetupUnitsEventSchemaObject;

type _SetupUnitsEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardSetupUnitsEventSchemaObject,
    typeof _smallSetupUnitsEventSchemaObject,
    typeof _largeSetupUnitsEventSchemaObject,
  ],
  "boardType"
>;

const _setupUnitsEventSchemaObject: _SetupUnitsEventDiscriminatedUnion = z.discriminatedUnion(
  "boardType",
  [
    _standardSetupUnitsEventSchemaObject,
    _smallSetupUnitsEventSchemaObject,
    _largeSetupUnitsEventSchemaObject,
  ],
);

type SetupUnitsEventSchemaType = z.infer<typeof _setupUnitsEventSchemaObject>;

const _assertExactSetupUnitsEvent: AssertExact<SetupUnitsEvent, SetupUnitsEventSchemaType> = true;

/** The schema for a setup units event. */
export const setupUnitsEventSchema: typeof _setupUnitsEventSchemaObject =
  _setupUnitsEventSchemaObject;
