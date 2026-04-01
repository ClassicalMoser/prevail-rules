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
import type { AttackResolutionContext } from './attackResolutionContext';
import {
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';

import { z } from 'zod';
import { attackResolutionContextSchema } from './attackResolutionContext';

/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE = 'resolveReverse' as const;

interface ResolveReverseEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /**
   * Ranged vs melee attack-resolution path holding this reverse.
   * Set by `generateResolveReverseEvent` in `src/domain/procedures/`.
   */
  attackResolutionContext: AttackResolutionContext;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

export interface StandardResolveReverseEvent extends ResolveReverseEventBase {
  boardType: 'standard';
  unitInstance: StandardUnitWithPlacement;
  newUnitPlacement: StandardUnitWithPlacement;
}

export interface SmallResolveReverseEvent extends ResolveReverseEventBase {
  boardType: 'small';
  unitInstance: SmallUnitWithPlacement;
  newUnitPlacement: SmallUnitWithPlacement;
}

export interface LargeResolveReverseEvent extends ResolveReverseEventBase {
  boardType: 'large';
  unitInstance: LargeUnitWithPlacement;
  newUnitPlacement: LargeUnitWithPlacement;
}

export type ResolveReverseEventUnion =
  | StandardResolveReverseEvent
  | SmallResolveReverseEvent
  | LargeResolveReverseEvent;

export type ResolveReverseEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof RESOLVE_REVERSE_EFFECT_TYPE =
    typeof RESOLVE_REVERSE_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardResolveReverseEvent
  : TBoard extends SmallBoard
    ? SmallResolveReverseEvent
    : TBoard extends LargeBoard
      ? LargeResolveReverseEvent
      : ResolveReverseEventUnion;

const _standardResolveReverseEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  attackResolutionContext: attackResolutionContextSchema,
  eventNumber: z.number(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  unitInstance: standardUnitWithPlacementSchema,
  newUnitPlacement: standardUnitWithPlacementSchema,
});

type StandardResolveReverseEventSchemaType = z.infer<
  typeof _standardResolveReverseEventSchemaObject
>;

const _assertExactStandardResolveReverseEvent: AssertExact<
  StandardResolveReverseEvent,
  StandardResolveReverseEventSchemaType
> = true;

const _smallResolveReverseEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  attackResolutionContext: attackResolutionContextSchema,
  eventNumber: z.number(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  unitInstance: smallUnitWithPlacementSchema,
  newUnitPlacement: smallUnitWithPlacementSchema,
});

type SmallResolveReverseEventSchemaType = z.infer<
  typeof _smallResolveReverseEventSchemaObject
>;

const _assertExactSmallResolveReverseEvent: AssertExact<
  SmallResolveReverseEvent,
  SmallResolveReverseEventSchemaType
> = true;

const _largeResolveReverseEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  attackResolutionContext: attackResolutionContextSchema,
  eventNumber: z.number(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  unitInstance: largeUnitWithPlacementSchema,
  newUnitPlacement: largeUnitWithPlacementSchema,
});

type LargeResolveReverseEventSchemaType = z.infer<
  typeof _largeResolveReverseEventSchemaObject
>;

const _assertExactLargeResolveReverseEvent: AssertExact<
  LargeResolveReverseEvent,
  LargeResolveReverseEventSchemaType
> = true;

const _resolveReverseEventSchemaObject = z.union([
  _standardResolveReverseEventSchemaObject,
  _smallResolveReverseEventSchemaObject,
  _largeResolveReverseEventSchemaObject,
]);

type ResolveReverseEventSchemaType = z.infer<
  typeof _resolveReverseEventSchemaObject
>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent<Board>,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: z.ZodType<ResolveReverseEvent<Board>> =
  _resolveReverseEventSchemaObject;
