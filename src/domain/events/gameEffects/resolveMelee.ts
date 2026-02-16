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
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE = 'resolveMelee' as const;

/** The event for the game resolution of a melee.
 * After the engagement is chosen, supports are applied,
 * and cards are committed, the resolution follows deterministically.
 * The steps are resolved in order, and the player with initiative
 * resolves each step first.
 */

export interface ResolveMeleeEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveMelee' = 'resolveMelee',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** The location of the melee. */
  location: BoardCoordinate<Board>;
  /** The white unit with its placement. */
  whiteUnit: UnitWithPlacement<Board>;
  /** The black unit with its placement. */
  blackUnit: UnitWithPlacement<Board>;
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
  /** Legal retreat options for the white unit (empty if not retreating). */
  whiteLegalRetreats: Set<UnitPlacement<Board>>;
  /** Legal retreat options for the black unit (empty if not retreating). */
  blackLegalRetreats: Set<UnitPlacement<Board>>;
}

const _resolveMeleeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
  /** The location of the melee. */
  location: boardCoordinateSchema,
  /** The white unit with its placement. */
  whiteUnit: unitWithPlacementSchema,
  /** The black unit with its placement. */
  blackUnit: unitWithPlacementSchema,
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
  /** Legal retreat options for the white unit (empty if not retreating). */
  whiteLegalRetreats: z.set(unitPlacementSchema),
  /** Legal retreat options for the black unit (empty if not retreating). */
  blackLegalRetreats: z.set(unitPlacementSchema),
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
  location: typeof boardCoordinateSchema;
  whiteUnit: typeof unitWithPlacementSchema;
  blackUnit: typeof unitWithPlacementSchema;
  whiteUnitRouted: z.ZodBoolean;
  blackUnitRouted: z.ZodBoolean;
  whiteUnitRetreated: z.ZodBoolean;
  blackUnitRetreated: z.ZodBoolean;
  whiteUnitReversed: z.ZodBoolean;
  blackUnitReversed: z.ZodBoolean;
  whiteLegalRetreats: z.ZodSet<typeof unitPlacementSchema>;
  blackLegalRetreats: z.ZodSet<typeof unitPlacementSchema>;
}> = _resolveMeleeEventSchemaObject;
