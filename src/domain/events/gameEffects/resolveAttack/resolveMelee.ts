import type {
  Board,
  LargeBoard,
  LargeBoardCoordinate,
  LargeUnitPlacement,
  LargeUnitWithPlacement,
  SmallBoard,
  SmallBoardCoordinate,
  SmallUnitPlacement,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardBoardCoordinate,
  StandardUnitPlacement,
  StandardUnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeBoardCoordinateSchema,
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallBoardCoordinateSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardBoardCoordinateSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE = 'resolveMelee' as const;

interface ResolveMeleeEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** Whether the white player's unit is routed. */
  whiteUnitRouted: boolean;
  /** Whether the black player's unit is routed. */
  blackUnitRouted: boolean;
  /** Whether the white player's unit is retreated. */
  whiteUnitRetreated: boolean;
  /** Whether the black player's unit is retreated. */
  blackUnitRetreated: boolean;
  /** Whether the white player's unit is reversed. */
  whiteUnitReversed: boolean;
  /** Whether the black player's unit is reversed. */
  blackUnitReversed: boolean;
}

/**
 * Deterministic melee resolution after engagement, supports, and committed cards.
 * Initiative orders substeps; the procedure computes attack outcomes and snapshots anything
 * apply would otherwise have to re-query from the board.
 */
export interface StandardResolveMeleeEvent extends ResolveMeleeEventBase {
  boardType: 'standard';
  location: StandardBoardCoordinate;
  whiteUnitWithPlacement: StandardUnitWithPlacement;
  blackUnitWithPlacement: StandardUnitWithPlacement;
  whiteLegalRetreatOptions: Set<StandardUnitPlacement>;
  blackLegalRetreatOptions: Set<StandardUnitPlacement>;
}

export interface SmallResolveMeleeEvent extends ResolveMeleeEventBase {
  boardType: 'small';
  location: SmallBoardCoordinate;
  whiteUnitWithPlacement: SmallUnitWithPlacement;
  blackUnitWithPlacement: SmallUnitWithPlacement;
  whiteLegalRetreatOptions: Set<SmallUnitPlacement>;
  blackLegalRetreatOptions: Set<SmallUnitPlacement>;
}

export interface LargeResolveMeleeEvent extends ResolveMeleeEventBase {
  boardType: 'large';
  location: LargeBoardCoordinate;
  whiteUnitWithPlacement: LargeUnitWithPlacement;
  blackUnitWithPlacement: LargeUnitWithPlacement;
  whiteLegalRetreatOptions: Set<LargeUnitPlacement>;
  blackLegalRetreatOptions: Set<LargeUnitPlacement>;
}

export type ResolveMeleeEventUnion =
  | StandardResolveMeleeEvent
  | SmallResolveMeleeEvent
  | LargeResolveMeleeEvent;

export type ResolveMeleeEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof RESOLVE_MELEE_EFFECT_TYPE =
    typeof RESOLVE_MELEE_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardResolveMeleeEvent
  : TBoard extends SmallBoard
    ? SmallResolveMeleeEvent
    : TBoard extends LargeBoard
      ? LargeResolveMeleeEvent
      : ResolveMeleeEventUnion;

const _standardResolveMeleeEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  location: standardBoardCoordinateSchema,
  whiteUnitWithPlacement: standardUnitWithPlacementSchema,
  blackUnitWithPlacement: standardUnitWithPlacementSchema,
  whiteLegalRetreatOptions: z.set(standardUnitPlacementSchema),
  blackLegalRetreatOptions: z.set(standardUnitPlacementSchema),
  whiteUnitRouted: z.boolean(),
  blackUnitRouted: z.boolean(),
  whiteUnitRetreated: z.boolean(),
  blackUnitRetreated: z.boolean(),
  whiteUnitReversed: z.boolean(),
  blackUnitReversed: z.boolean(),
});

type StandardResolveMeleeEventSchemaType = z.infer<
  typeof _standardResolveMeleeEventSchemaObject
>;

const _assertExactStandardResolveMeleeEvent: AssertExact<
  StandardResolveMeleeEvent,
  StandardResolveMeleeEventSchemaType
> = true;

const _smallResolveMeleeEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  location: smallBoardCoordinateSchema,
  whiteUnitWithPlacement: smallUnitWithPlacementSchema,
  blackUnitWithPlacement: smallUnitWithPlacementSchema,
  whiteLegalRetreatOptions: z.set(smallUnitPlacementSchema),
  blackLegalRetreatOptions: z.set(smallUnitPlacementSchema),
  whiteUnitRouted: z.boolean(),
  blackUnitRouted: z.boolean(),
  whiteUnitRetreated: z.boolean(),
  blackUnitRetreated: z.boolean(),
  whiteUnitReversed: z.boolean(),
  blackUnitReversed: z.boolean(),
});

type SmallResolveMeleeEventSchemaType = z.infer<
  typeof _smallResolveMeleeEventSchemaObject
>;

const _assertExactSmallResolveMeleeEvent: AssertExact<
  SmallResolveMeleeEvent,
  SmallResolveMeleeEventSchemaType
> = true;

const _largeResolveMeleeEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  location: largeBoardCoordinateSchema,
  whiteUnitWithPlacement: largeUnitWithPlacementSchema,
  blackUnitWithPlacement: largeUnitWithPlacementSchema,
  whiteLegalRetreatOptions: z.set(largeUnitPlacementSchema),
  blackLegalRetreatOptions: z.set(largeUnitPlacementSchema),
  whiteUnitRouted: z.boolean(),
  blackUnitRouted: z.boolean(),
  whiteUnitRetreated: z.boolean(),
  blackUnitRetreated: z.boolean(),
  whiteUnitReversed: z.boolean(),
  blackUnitReversed: z.boolean(),
});

type LargeResolveMeleeEventSchemaType = z.infer<
  typeof _largeResolveMeleeEventSchemaObject
>;

const _assertExactLargeResolveMeleeEvent: AssertExact<
  LargeResolveMeleeEvent,
  LargeResolveMeleeEventSchemaType
> = true;

const _resolveMeleeEventSchemaObject = z.union([
  _standardResolveMeleeEventSchemaObject,
  _smallResolveMeleeEventSchemaObject,
  _largeResolveMeleeEventSchemaObject,
]);

type ResolveMeleeEventSchemaType = z.infer<
  typeof _resolveMeleeEventSchemaObject
>;

const _assertExactResolveMeleeEvent: AssertExact<
  ResolveMeleeEvent<Board>,
  ResolveMeleeEventSchemaType
> = true;

/** The schema for a resolve melee event. */
export const resolveMeleeEventSchema: z.ZodType<ResolveMeleeEvent<Board>> =
  _resolveMeleeEventSchemaObject;
