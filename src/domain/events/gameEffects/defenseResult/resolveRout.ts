/**
 * Resolve-rout effect: works out what the routing player owes and drives the
 * rout substep (§9.3).
 *
 * The event names the player who pays; the player names the rout, so applying it
 * needs nothing about where the rout sits. The routed units are the rout's own,
 * recorded when it opened.
 */
import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';

import { z } from 'zod';

/** The type of the resolve rout game effect. */
export const RESOLVE_ROUT_EFFECT_TYPE = 'resolveRout' as const;

/**
 * Applies rout resolution: units leave the game and the owning player pays discard penalty.
 */
export interface ResolveRoutEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ROUT_EFFECT_TYPE;
  /** The player whose units routed, who pays the penalty (§9.3.2). */
  player: PlayerSide;
  /** The penalty for routing the units (sum of all units' rout penalties). */
  penalty: number;
}

const _resolveRoutEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(RESOLVE_ROUT_EFFECT_TYPE),
    /** The player whose units routed, who pays the penalty. */
    player: playerSideSchema,
    /** The penalty for routing the units (sum of all units' rout penalties). */
    penalty: z.number(),
  })
  .strict();

type ResolveRoutEventSchemaType = z.infer<typeof _resolveRoutEventSchemaObject>;

const _assertExactResolveRoutEvent: AssertExact<
  ResolveRoutEvent,
  ResolveRoutEventSchemaType
> = true;

/** The schema for a resolve rout event. */
export const resolveRoutEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRout'>;
  player: typeof playerSideSchema;
  penalty: z.ZodNumber;
}> = _resolveRoutEventSchemaObject;
