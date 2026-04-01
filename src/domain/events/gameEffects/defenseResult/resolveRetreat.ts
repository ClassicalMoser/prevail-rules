import type {
  Board,
  LargeBoard,
  LargeUnitWithPlacement,
  SmallBoard,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';

import {
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE = 'resolveRetreat' as const;

interface ResolveRetreatEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RETREAT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

export interface StandardResolveRetreatEvent extends ResolveRetreatEventBase {
  boardType: 'standard';
  startingPosition: StandardUnitWithPlacement;
  finalPosition: StandardUnitWithPlacement;
}

export interface SmallResolveRetreatEvent extends ResolveRetreatEventBase {
  boardType: 'small';
  startingPosition: SmallUnitWithPlacement;
  finalPosition: SmallUnitWithPlacement;
}

export interface LargeResolveRetreatEvent extends ResolveRetreatEventBase {
  boardType: 'large';
  startingPosition: LargeUnitWithPlacement;
  finalPosition: LargeUnitWithPlacement;
}

export type ResolveRetreatEventUnion =
  | StandardResolveRetreatEvent
  | SmallResolveRetreatEvent
  | LargeResolveRetreatEvent;

export type ResolveRetreatEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof RESOLVE_RETREAT_EFFECT_TYPE =
    typeof RESOLVE_RETREAT_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardResolveRetreatEvent
  : TBoard extends SmallBoard
    ? SmallResolveRetreatEvent
    : TBoard extends LargeBoard
      ? LargeResolveRetreatEvent
      : ResolveRetreatEventUnion;

const _standardResolveRetreatEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  startingPosition: standardUnitWithPlacementSchema,
  finalPosition: standardUnitWithPlacementSchema,
});

type StandardResolveRetreatEventSchemaType = z.infer<
  typeof _standardResolveRetreatEventSchemaObject
>;

const _assertExactStandardResolveRetreatEvent: AssertExact<
  StandardResolveRetreatEvent,
  StandardResolveRetreatEventSchemaType
> = true;

const _smallResolveRetreatEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  startingPosition: smallUnitWithPlacementSchema,
  finalPosition: smallUnitWithPlacementSchema,
});

type SmallResolveRetreatEventSchemaType = z.infer<
  typeof _smallResolveRetreatEventSchemaObject
>;

const _assertExactSmallResolveRetreatEvent: AssertExact<
  SmallResolveRetreatEvent,
  SmallResolveRetreatEventSchemaType
> = true;

const _largeResolveRetreatEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  startingPosition: largeUnitWithPlacementSchema,
  finalPosition: largeUnitWithPlacementSchema,
});

type LargeResolveRetreatEventSchemaType = z.infer<
  typeof _largeResolveRetreatEventSchemaObject
>;

const _assertExactLargeResolveRetreatEvent: AssertExact<
  LargeResolveRetreatEvent,
  LargeResolveRetreatEventSchemaType
> = true;

const _resolveRetreatEventSchemaObject = z.union([
  _standardResolveRetreatEventSchemaObject,
  _smallResolveRetreatEventSchemaObject,
  _largeResolveRetreatEventSchemaObject,
]);

type ResolveRetreatEventSchemaType = z.infer<
  typeof _resolveRetreatEventSchemaObject
>;

const _assertExactResolveRetreatEvent: AssertExact<
  ResolveRetreatEvent<Board>,
  ResolveRetreatEventSchemaType
> = true;

/** The schema for a resolve retreat event. */
export const resolveRetreatEventSchema: z.ZodType<ResolveRetreatEvent<Board>> =
  _resolveRetreatEventSchemaObject;
