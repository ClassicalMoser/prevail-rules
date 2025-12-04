import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { z } from 'zod';

/** The event to resolve the initiative.
 * Which player has initiative for the round.
 * The player with the lower initiative value receives initiative.
 * In a tie, the player with initiative keeps it.
 */
export interface ResolveInitiativeEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  /** The player with initiative. */
  player: PlayerSide;
}

const _resolveInitiativeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect' as const),
  /** The player with initiative. */
  player: playerSideSchema,
});

type ResolveInitiativeEventSchemaType = z.infer<
  typeof _resolveInitiativeEventSchemaObject
>;

const _assertExactResolveInitiativeEvent: AssertExact<
  ResolveInitiativeEvent,
  ResolveInitiativeEventSchemaType
> = true;

/** The schema for a resolve initiative event. */
export const resolveInitiativeEventSchema: z.ZodType<ResolveInitiativeEvent> =
  _resolveInitiativeEventSchemaObject;
