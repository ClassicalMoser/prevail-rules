import type {
  Board,
  LargeBoard,
  LargeUnitWithPlacement,
  PlayerSide,
  SmallBoard,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeUnitWithPlacementSchema,
  playerSideSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the perform ranged attack event. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = 'performRangedAttack' as const;

interface PerformRangedAttackEventBase {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is performing the ranged attack. */
  player: PlayerSide;
}

export interface StandardPerformRangedAttackEvent extends PerformRangedAttackEventBase {
  boardType: 'standard';
  /** The unit that is performing the ranged attack. */
  unit: StandardUnitWithPlacement;
  /** The target unit that is being attacked. */
  targetUnit: StandardUnitWithPlacement;
  /** Any supporting units. */
  supportingUnits: Set<StandardUnitWithPlacement>;
}

export interface SmallPerformRangedAttackEvent extends PerformRangedAttackEventBase {
  boardType: 'small';
  unit: SmallUnitWithPlacement;
  targetUnit: SmallUnitWithPlacement;
  supportingUnits: Set<SmallUnitWithPlacement>;
}

export interface LargePerformRangedAttackEvent extends PerformRangedAttackEventBase {
  boardType: 'large';
  unit: LargeUnitWithPlacement;
  targetUnit: LargeUnitWithPlacement;
  supportingUnits: Set<LargeUnitWithPlacement>;
}

export type PerformRangedAttackEventUnion =
  | StandardPerformRangedAttackEvent
  | SmallPerformRangedAttackEvent
  | LargePerformRangedAttackEvent;

export type PerformRangedAttackEvent<
  TBoard extends Board = Board,
  _TChoiceType extends typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE =
    typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE,
> = TBoard extends StandardBoard
  ? StandardPerformRangedAttackEvent
  : TBoard extends SmallBoard
    ? SmallPerformRangedAttackEvent
    : TBoard extends LargeBoard
      ? LargePerformRangedAttackEvent
      : PerformRangedAttackEventUnion;

const _standardPerformRangedAttackEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  unit: standardUnitWithPlacementSchema,
  targetUnit: standardUnitWithPlacementSchema,
  supportingUnits: z.set(standardUnitWithPlacementSchema),
});

type StandardPerformRangedAttackEventSchemaType = z.infer<
  typeof _standardPerformRangedAttackEventSchemaObject
>;

const _assertExactStandardPerformRangedAttackEvent: AssertExact<
  StandardPerformRangedAttackEvent,
  StandardPerformRangedAttackEventSchemaType
> = true;

const _smallPerformRangedAttackEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  unit: smallUnitWithPlacementSchema,
  targetUnit: smallUnitWithPlacementSchema,
  supportingUnits: z.set(smallUnitWithPlacementSchema),
});

type SmallPerformRangedAttackEventSchemaType = z.infer<
  typeof _smallPerformRangedAttackEventSchemaObject
>;

const _assertExactSmallPerformRangedAttackEvent: AssertExact<
  SmallPerformRangedAttackEvent,
  SmallPerformRangedAttackEventSchemaType
> = true;

const _largePerformRangedAttackEventSchemaObject = z.object({
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  eventNumber: z.number(),
  player: playerSideSchema,
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  unit: largeUnitWithPlacementSchema,
  targetUnit: largeUnitWithPlacementSchema,
  supportingUnits: z.set(largeUnitWithPlacementSchema),
});

type LargePerformRangedAttackEventSchemaType = z.infer<
  typeof _largePerformRangedAttackEventSchemaObject
>;

const _assertExactLargePerformRangedAttackEvent: AssertExact<
  LargePerformRangedAttackEvent,
  LargePerformRangedAttackEventSchemaType
> = true;

const _performRangedAttackEventSchemaObject = z.union([
  _standardPerformRangedAttackEventSchemaObject,
  _smallPerformRangedAttackEventSchemaObject,
  _largePerformRangedAttackEventSchemaObject,
]);

type PerformRangedAttackEventSchemaType = z.infer<
  typeof _performRangedAttackEventSchemaObject
>;

const _assertExactPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEvent<Board>,
  PerformRangedAttackEventSchemaType
> = true;

/** The schema for a perform ranged attack event. */
export const performRangedAttackEventSchema: z.ZodType<
  PerformRangedAttackEvent<Board>
> = _performRangedAttackEventSchemaObject;
