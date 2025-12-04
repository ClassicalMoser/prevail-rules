import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { z } from 'zod';

/** To perform a rally, a player must burn a random card from their played commands.
 * Afterwards, they return all discarded and played cards to their hand.
 * After performing a rally, they must check unit support.
 */

/** A command to resolve a rally. */
export interface ResolveRallyEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  /** The player who is resolving the rally. */
  player: PlayerSide;
  /** The card to burn */
  card: Card;
}

const _resolveRallyEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect' as const),
  /** The player who is resolving the rally. */
  player: playerSideSchema,
  /** The card to burn */
  card: cardSchema,
});

type ResolveRallyEventSchemaType = z.infer<
  typeof _resolveRallyEventSchemaObject
>;

const _assertExactResolveRallyEvent: AssertExact<
  ResolveRallyEvent,
  ResolveRallyEventSchemaType
> = true;

/** The schema for a resolve rally event. */
export const resolveRallyEventSchema: z.ZodType<ResolveRallyEvent> =
  _resolveRallyEventSchemaObject;
