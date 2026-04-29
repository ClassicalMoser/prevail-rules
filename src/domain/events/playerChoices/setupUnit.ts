import type {
  Board,
  LargeBoard,
  LargeUnitWithPlacement,
  PlayerSide,
  SmallBoard,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitWithPlacement,
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

interface SetupUnitsEventBase {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof SETUP_UNITS_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is setting up the units. */
  player: PlayerSide;
}

export interface StandardSetupUnitsEvent extends SetupUnitsEventBase {
  boardType: "standard";
  /** The units to setup, each with its placement. */
  unitPlacements: Set<StandardUnitWithPlacement>;
}

export interface SmallSetupUnitsEvent extends SetupUnitsEventBase {
  boardType: "small";
  unitPlacements: Set<SmallUnitWithPlacement>;
}

export interface LargeSetupUnitsEvent extends SetupUnitsEventBase {
  boardType: "large";
  unitPlacements: Set<LargeUnitWithPlacement>;
}

export type SetupUnitsEventUnion =
  | StandardSetupUnitsEvent
  | SmallSetupUnitsEvent
  | LargeSetupUnitsEvent;

export type SetupUnitsEvent<
  TBoard extends Board = Board,
  _TChoiceType extends typeof SETUP_UNITS_CHOICE_TYPE = typeof SETUP_UNITS_CHOICE_TYPE,
> = TBoard extends StandardBoard
  ? StandardSetupUnitsEvent
  : TBoard extends SmallBoard
    ? SmallSetupUnitsEvent
    : TBoard extends LargeBoard
      ? LargeSetupUnitsEvent
      : SetupUnitsEventUnion;

const _standardSetupUnitsEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof SETUP_UNITS_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"standard">;
  unitPlacements: z.ZodSet<typeof standardUnitWithPlacementSchema>;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(SETUP_UNITS_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  unitPlacements: z.set(standardUnitWithPlacementSchema),
});

type StandardSetupUnitsEventSchemaType = z.infer<typeof _standardSetupUnitsEventSchemaObject>;

const _assertExactStandardSetupUnitsEvent: AssertExact<
  StandardSetupUnitsEvent,
  StandardSetupUnitsEventSchemaType
> = true;

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
  SmallSetupUnitsEvent,
  SmallSetupUnitsEventSchemaType
> = true;

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
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  unitPlacements: z.set(largeUnitWithPlacementSchema),
});

type LargeSetupUnitsEventSchemaType = z.infer<typeof _largeSetupUnitsEventSchemaObject>;

const _assertExactLargeSetupUnitsEvent: AssertExact<
  LargeSetupUnitsEvent,
  LargeSetupUnitsEventSchemaType
> = true;

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

const _assertExactSetupUnitsEvent: AssertExact<
  SetupUnitsEvent<Board>,
  SetupUnitsEventSchemaType
> = true;

/** The schema for a setup units event. */
export const setupUnitsEventSchema: typeof _setupUnitsEventSchemaObject =
  _setupUnitsEventSchemaObject;
