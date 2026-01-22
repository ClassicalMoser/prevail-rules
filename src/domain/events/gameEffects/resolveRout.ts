import type { Board, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve rout game effect. */
export const RESOLVE_ROUT_EFFECT_TYPE = 'resolveRout' as const;

/** An event to resolve a rout.
 * Units that are routed are permanently removed from the game.
 * The player must discard a number of cards equal to the sum of all routed units' rout penalties.
 */
export interface ResolveRoutEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveRout' = 'resolveRout',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ROUT_EFFECT_TYPE;
  /** The unit instances that are being routed. */
  unitInstances: Set<UnitInstance>;
  /** The penalty for routing the units (sum of all units' rout penalties). */
  penalty: number;
}

const _resolveRoutEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ROUT_EFFECT_TYPE),
  /** The unit instances that are being routed. */
  unitInstances: z.set(unitInstanceSchema),
  /** The penalty for routing the units (sum of all units' rout penalties). */
  penalty: z.number(),
});

type ResolveRoutEventSchemaType = z.infer<typeof _resolveRoutEventSchemaObject>;

const _assertExactResolveRoutEvent: AssertExact<
  ResolveRoutEvent<Board>,
  ResolveRoutEventSchemaType
> = true;

/** The schema for a resolve rout event. */
export const resolveRoutEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRout'>;
  unitInstances: z.ZodSet<typeof unitInstanceSchema>;
  penalty: z.ZodNumber;
}> = _resolveRoutEventSchemaObject;
