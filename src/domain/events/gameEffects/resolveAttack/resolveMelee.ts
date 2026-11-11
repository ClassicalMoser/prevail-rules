import type { Coordinate, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { coordinateSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE = 'resolveMelee' as const;

/**
 * Deterministic melee resolution after engagement, supports, and committed cards.
 * Initiative orders substeps; the procedure computes attack outcomes and snapshots anything
 * apply would otherwise have to re-query from the board.
 * TODO(misleading): legal retreat options are no longer snapshotted here — the
 * retreat opener computes them when that step opens.
 */
export interface ResolveMeleeEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** The coordinate of the engagement. */
  location: Coordinate;
  /** The white player's unit with placement. */
  whiteUnitWithPlacement: UnitWithPlacement;
  /** The black player's unit with placement. */
  blackUnitWithPlacement: UnitWithPlacement;
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

const _resolveMeleeEventSchemaObject = z
  .object({
    blackUnitRetreated: z.boolean(),
    blackUnitReversed: z.boolean(),
    blackUnitRouted: z.boolean(),
    blackUnitWithPlacement: unitWithPlacementSchema,
    effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    location: coordinateSchema,
    whiteUnitRetreated: z.boolean(),
    whiteUnitReversed: z.boolean(),
    whiteUnitRouted: z.boolean(),
    whiteUnitWithPlacement: unitWithPlacementSchema,
  })
  .strict();

type ResolveMeleeEventSchemaType = z.infer<
  typeof _resolveMeleeEventSchemaObject
>;

const _assertExactResolveMeleeEvent: AssertExact<
  ResolveMeleeEvent,
  ResolveMeleeEventSchemaType
> = true;

/** The schema for a resolve melee event. */
export const resolveMeleeEventSchema: z.ZodObject<{
  blackUnitRetreated: z.ZodBoolean;
  blackUnitReversed: z.ZodBoolean;
  blackUnitRouted: z.ZodBoolean;
  blackUnitWithPlacement: typeof unitWithPlacementSchema;
  effectType: z.ZodLiteral<typeof RESOLVE_MELEE_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  location: typeof coordinateSchema;
  whiteUnitRetreated: z.ZodBoolean;
  whiteUnitReversed: z.ZodBoolean;
  whiteUnitRouted: z.ZodBoolean;
  whiteUnitWithPlacement: typeof unitWithPlacementSchema;
}> = _resolveMeleeEventSchemaObject;
