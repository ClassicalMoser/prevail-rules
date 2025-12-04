import type { UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities';
import { z } from 'zod';

/** An event to resolve a rout.
 * A unit that is routed is permanently removed from the game.
 * The player must discard a number of cards equal to its rout penalty.
 */
export interface ResolveRoutEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  /** The unit instance that is being routed. */
  unitInstance: UnitInstance;
  /** The penalty for routing the unit. */
  penalty: number;
}

const _resolveRoutEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect' as const),
  /** The unit instance that is being routed. */
  unitInstance: unitInstanceSchema,
  /** The penalty for routing the unit. */
  penalty: z.number(),
});

type ResolveRoutEventSchemaType = z.infer<typeof _resolveRoutEventSchemaObject>;

const _assertExactResolveRoutEvent: AssertExact<
  ResolveRoutEvent,
  ResolveRoutEventSchemaType
> = true;

/** The schema for a resolve rout event. */
export const resolveRoutEventSchema: z.ZodType<ResolveRoutEvent> =
  _resolveRoutEventSchemaObject;
