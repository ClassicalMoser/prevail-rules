import type { Board, BoardCoordinate } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_MELEE_EFFECT_TYPE } from './gameEffect';


/** The event for the game resolution of a melee.
 * After the engagement is chosen, supports are applied,
 * and cards are committed, the resolution follows deterministically.
 * The steps are resolved in order, and the player with initiative
 * resolves each step first.
 */

export interface ResolveMeleeEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** The location of the melee. */
  location: BoardCoordinate<Board>;
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
  /** The location of the melee. */
  location: boardCoordinateSchema,
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
  ResolveMeleeEvent,
  ResolveMeleeEventSchemaType
> = true;

/** The schema for a resolve melee event. */
export const resolveMeleeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_MELEE_EFFECT_TYPE>;
  location: typeof boardCoordinateSchema;
  whiteUnitRouted: z.ZodBoolean;
  blackUnitRouted: z.ZodBoolean;
  whiteUnitRetreated: z.ZodBoolean;
  blackUnitRetreated: z.ZodBoolean;
  whiteUnitReversed: z.ZodBoolean;
  blackUnitReversed: z.ZodBoolean;
}> = _resolveMeleeEventSchemaObject;
