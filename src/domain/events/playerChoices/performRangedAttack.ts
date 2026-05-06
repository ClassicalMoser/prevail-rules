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

/** The type of the perform ranged attack event. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = "performRangedAttack" as const;

export interface PerformRangedAttackEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit that is performing the ranged attack. */
  unit: UnitWithPlacement<TBoard>;
  /** The target unit that is being attacked. */
  targetUnit: UnitWithPlacement<TBoard>;
  /** Any supporting units. */
  supportingUnits: Set<UnitWithPlacement<TBoard>>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is performing the ranged attack. */
  player: PlayerSide;
}

export type PerformRangedAttackEvent =
  | PerformRangedAttackEventForBoard<StandardBoard>
  | PerformRangedAttackEventForBoard<SmallBoard>
  | PerformRangedAttackEventForBoard<LargeBoard>;

const _standardPerformRangedAttackEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"standard">;
  unit: typeof standardUnitWithPlacementSchema;
  targetUnit: typeof standardUnitWithPlacementSchema;
  supportingUnits: z.ZodSet<typeof standardUnitWithPlacementSchema>;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  unit: standardUnitWithPlacementSchema,
  targetUnit: standardUnitWithPlacementSchema,
  supportingUnits: z.set(standardUnitWithPlacementSchema),
});

export const standardPerformRangedAttackEventSchema: typeof _standardPerformRangedAttackEventSchemaObject =
  _standardPerformRangedAttackEventSchemaObject;

type StandardPerformRangedAttackEventSchemaType = z.infer<
  typeof _standardPerformRangedAttackEventSchemaObject
>;

const _assertExactStandardPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEventForBoard<StandardBoard>,
  StandardPerformRangedAttackEventSchemaType
> = true;

const _smallPerformRangedAttackEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"small">;
  unit: typeof smallUnitWithPlacementSchema;
  targetUnit: typeof smallUnitWithPlacementSchema;
  supportingUnits: z.ZodSet<typeof smallUnitWithPlacementSchema>;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  unit: smallUnitWithPlacementSchema,
  targetUnit: smallUnitWithPlacementSchema,
  supportingUnits: z.set(smallUnitWithPlacementSchema),
});

export const smallPerformRangedAttackEventSchema: typeof _smallPerformRangedAttackEventSchemaObject =
  _smallPerformRangedAttackEventSchemaObject;

type SmallPerformRangedAttackEventSchemaType = z.infer<
  typeof _smallPerformRangedAttackEventSchemaObject
>;

const _assertExactSmallPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEventForBoard<SmallBoard>,
  SmallPerformRangedAttackEventSchemaType
> = true;

const _largePerformRangedAttackEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  boardType: z.ZodLiteral<"large">;
  unit: typeof largeUnitWithPlacementSchema;
  targetUnit: typeof largeUnitWithPlacementSchema;
  supportingUnits: z.ZodSet<typeof largeUnitWithPlacementSchema>;
}> = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  unit: largeUnitWithPlacementSchema,
  targetUnit: largeUnitWithPlacementSchema,
  supportingUnits: z.set(largeUnitWithPlacementSchema),
});

export const largePerformRangedAttackEventSchema: typeof _largePerformRangedAttackEventSchemaObject =
  _largePerformRangedAttackEventSchemaObject;

type LargePerformRangedAttackEventSchemaType = z.infer<
  typeof _largePerformRangedAttackEventSchemaObject
>;

const _assertExactLargePerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEventForBoard<LargeBoard>,
  LargePerformRangedAttackEventSchemaType
> = true;

type _PerformRangedAttackEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardPerformRangedAttackEventSchemaObject,
    typeof _smallPerformRangedAttackEventSchemaObject,
    typeof _largePerformRangedAttackEventSchemaObject,
  ],
  "boardType"
>;

const _performRangedAttackEventSchemaObject: _PerformRangedAttackEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardPerformRangedAttackEventSchemaObject,
    _smallPerformRangedAttackEventSchemaObject,
    _largePerformRangedAttackEventSchemaObject,
  ]);

type PerformRangedAttackEventSchemaType = z.infer<typeof _performRangedAttackEventSchemaObject>;

const _assertExactPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEvent,
  PerformRangedAttackEventSchemaType
> = true;

/** The schema for a perform ranged attack event. */
export const performRangedAttackEventSchema: typeof _performRangedAttackEventSchemaObject =
  _performRangedAttackEventSchemaObject;
