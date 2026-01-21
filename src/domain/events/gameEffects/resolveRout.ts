import type { Board, UnitInstance  } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_ROUT_EFFECT_TYPE } from './gameEffect';

/** An event to resolve a rout.
 * A unit that is routed is permanently removed from the game.
 * The player must discard a number of cards equal to its rout penalty.
 */
export interface ResolveRoutEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ROUT_EFFECT_TYPE;
  /** The unit instance that is being routed. */
  unitInstance: UnitInstance;
  /** The penalty for routing the unit. */
  penalty: number;
}

const _resolveRoutEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ROUT_EFFECT_TYPE),
  /** The unit instance that is being routed. */
  unitInstance: unitInstanceSchema,
  /** The penalty for routing the unit. */
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
  unitInstance: typeof unitInstanceSchema;
  penalty: z.ZodNumber;
}> = _resolveRoutEventSchemaObject;
