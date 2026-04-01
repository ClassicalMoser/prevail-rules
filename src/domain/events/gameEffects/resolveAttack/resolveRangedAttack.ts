import type {
  Board,
  LargeBoard,
  LargeUnitPlacement,
  LargeUnitWithPlacement,
  SmallBoard,
  SmallUnitPlacement,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitPlacement,
  StandardUnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE = 'resolveRangedAttack' as const;

interface ResolveRangedAttackEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** Whether the unit is routed. */
  routed: boolean;
  /** Whether the unit is reversed. */
  reversed: boolean;
  /** Whether the unit is retreated. */
  retreated: boolean;
}

export interface StandardResolveRangedAttackEvent extends ResolveRangedAttackEventBase {
  boardType: 'standard';
  defenderWithPlacement: StandardUnitWithPlacement;
  legalRetreatOptions: Set<StandardUnitPlacement>;
}

export interface SmallResolveRangedAttackEvent extends ResolveRangedAttackEventBase {
  boardType: 'small';
  defenderWithPlacement: SmallUnitWithPlacement;
  legalRetreatOptions: Set<SmallUnitPlacement>;
}

export interface LargeResolveRangedAttackEvent extends ResolveRangedAttackEventBase {
  boardType: 'large';
  defenderWithPlacement: LargeUnitWithPlacement;
  legalRetreatOptions: Set<LargeUnitPlacement>;
}

export type ResolveRangedAttackEventUnion =
  | StandardResolveRangedAttackEvent
  | SmallResolveRangedAttackEvent
  | LargeResolveRangedAttackEvent;

export type ResolveRangedAttackEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE =
    typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardResolveRangedAttackEvent
  : TBoard extends SmallBoard
    ? SmallResolveRangedAttackEvent
    : TBoard extends LargeBoard
      ? LargeResolveRangedAttackEvent
      : ResolveRangedAttackEventUnion;

const _standardResolveRangedAttackEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  defenderWithPlacement: standardUnitWithPlacementSchema,
  legalRetreatOptions: z.set(standardUnitPlacementSchema),
  routed: z.boolean(),
  reversed: z.boolean(),
  retreated: z.boolean(),
});

type StandardResolveRangedAttackEventSchemaType = z.infer<
  typeof _standardResolveRangedAttackEventSchemaObject
>;

const _assertExactStandardResolveRangedAttackEvent: AssertExact<
  StandardResolveRangedAttackEvent,
  StandardResolveRangedAttackEventSchemaType
> = true;

const _smallResolveRangedAttackEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  defenderWithPlacement: smallUnitWithPlacementSchema,
  legalRetreatOptions: z.set(smallUnitPlacementSchema),
  routed: z.boolean(),
  reversed: z.boolean(),
  retreated: z.boolean(),
});

type SmallResolveRangedAttackEventSchemaType = z.infer<
  typeof _smallResolveRangedAttackEventSchemaObject
>;

const _assertExactSmallResolveRangedAttackEvent: AssertExact<
  SmallResolveRangedAttackEvent,
  SmallResolveRangedAttackEventSchemaType
> = true;

const _largeResolveRangedAttackEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  defenderWithPlacement: largeUnitWithPlacementSchema,
  legalRetreatOptions: z.set(largeUnitPlacementSchema),
  routed: z.boolean(),
  reversed: z.boolean(),
  retreated: z.boolean(),
});

type LargeResolveRangedAttackEventSchemaType = z.infer<
  typeof _largeResolveRangedAttackEventSchemaObject
>;

const _assertExactLargeResolveRangedAttackEvent: AssertExact<
  LargeResolveRangedAttackEvent,
  LargeResolveRangedAttackEventSchemaType
> = true;

const _resolveRangedAttackEventSchemaObject = z.union([
  _standardResolveRangedAttackEventSchemaObject,
  _smallResolveRangedAttackEventSchemaObject,
  _largeResolveRangedAttackEventSchemaObject,
]);

type ResolveRangedAttackEventSchemaType = z.infer<
  typeof _resolveRangedAttackEventSchemaObject
>;

const _assertExactResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEvent<Board>,
  ResolveRangedAttackEventSchemaType
> = true;

/** The schema for a resolve ranged attack event. */
export const resolveRangedAttackEventSchema: z.ZodType<
  ResolveRangedAttackEvent<Board>
> = _resolveRangedAttackEventSchemaObject;
