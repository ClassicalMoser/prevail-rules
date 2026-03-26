import type {
  Board,
  BoardCoordinate,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  boardCoordinateSchema,
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE = 'resolveMelee' as const;

/**
 * Deterministic melee resolution after engagement, supports, and committed cards.
 * Initiative orders substeps; the procedure computes attack outcomes and snapshots anything
 * apply would otherwise have to re-query from the board.
 *
 * **Payload notes**
 * - `whiteUnitWithPlacement` / `blackUnitWithPlacement`: engaged units at `location` (not
 *   “defender” wording—melee is mutual).
 * - `*LegalRetreatOptions`: precomputed by the procedure when that side retreats; empty `Set`
 *   otherwise so apply never calls `getLegalRetreats`.
 */
export interface ResolveMeleeEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveMelee' = 'resolveMelee',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The location of the melee. */
  location: BoardCoordinate<Board>;
  /** White side’s engaged unit at `location` (procedure snapshot for apply). */
  whiteUnitWithPlacement: UnitWithPlacement<Board>;
  /** Black side’s engaged unit at `location` (procedure snapshot for apply). */
  blackUnitWithPlacement: UnitWithPlacement<Board>;
  /**
   * Legal retreats for the white unit when `whiteUnitRetreated`; otherwise empty.
   * Filled by the procedure; apply does not call `getLegalRetreats`.
   */
  whiteLegalRetreatOptions: Set<UnitPlacement<Board>>;
  /**
   * Legal retreats for the black unit when `blackUnitRetreated`; otherwise empty.
   */
  blackLegalRetreatOptions: Set<UnitPlacement<Board>>;
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

const _resolveMeleeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** The location of the melee. */
  location: boardCoordinateSchema,
  /** White side’s engaged unit at `location` (procedure snapshot for apply). */
  whiteUnitWithPlacement: unitWithPlacementSchema,
  /** Black side’s engaged unit at `location` (procedure snapshot for apply). */
  blackUnitWithPlacement: unitWithPlacementSchema,
  /**
   * Legal retreats for the white unit when `whiteUnitRetreated`; otherwise empty.
   * Filled by the procedure; apply does not call `getLegalRetreats`.
   */
  whiteLegalRetreatOptions: z.set(unitPlacementSchema),
  /**
   * Legal retreats for the black unit when `blackUnitRetreated`; otherwise empty.
   */
  blackLegalRetreatOptions: z.set(unitPlacementSchema),
  /** Whether the white player's unit is routed. */
  whiteUnitRouted: z.boolean(),
  /** Whether the black player's unit is routed. */
  blackUnitRouted: z.boolean(),
  /** Whether the white player's unit is retreated. */
  whiteUnitRetreated: z.boolean(),
  /** Whether the black player's unit is retreated. */
  blackUnitRetreated: z.boolean(),
  /** Whether the white player's unit is reversed. */
  whiteUnitReversed: z.boolean(),
  /** Whether the black player's unit is reversed. */
  blackUnitReversed: z.boolean(),
});

type ResolveMeleeEventSchemaType = z.infer<
  typeof _resolveMeleeEventSchemaObject
>;

const _assertExactResolveMeleeEvent: AssertExact<
  ResolveMeleeEvent<Board>,
  ResolveMeleeEventSchemaType
> = true;

/** The schema for a resolve melee event. */
export const resolveMeleeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveMelee'>;
  eventNumber: z.ZodNumber;
  location: typeof boardCoordinateSchema;
  whiteUnitWithPlacement: typeof unitWithPlacementSchema;
  blackUnitWithPlacement: typeof unitWithPlacementSchema;
  whiteLegalRetreatOptions: z.ZodSet<typeof unitPlacementSchema>;
  blackLegalRetreatOptions: z.ZodSet<typeof unitPlacementSchema>;
  whiteUnitRouted: z.ZodBoolean;
  blackUnitRouted: z.ZodBoolean;
  whiteUnitRetreated: z.ZodBoolean;
  blackUnitRetreated: z.ZodBoolean;
  whiteUnitReversed: z.ZodBoolean;
  blackUnitReversed: z.ZodBoolean;
}> = _resolveMeleeEventSchemaObject;
