import type { Board, Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_RALLY_EFFECT_TYPE } from './gameEffect';

/** To perform a rally, a player must burn a random card from their played commands.
 * Afterwards, they return all discarded and played cards to their hand.
 * After performing a rally, they must check unit support.
 */

/** A command to resolve a rally. */
export interface ResolveRallyEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RALLY_EFFECT_TYPE;
  /** The player who is resolving the rally. */
  player: PlayerSide;
  /** The card to burn */
  card: Card;
}

const _resolveRallyEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_RALLY_EFFECT_TYPE),
  /** The player who is resolving the rally. */
  player: playerSideSchema,
  /** The card to burn */
  card: cardSchema,
});

type ResolveRallyEventSchemaType = z.infer<
  typeof _resolveRallyEventSchemaObject
>;

const _assertExactResolveRallyEvent: AssertExact<
  ResolveRallyEvent<Board>,
  ResolveRallyEventSchemaType
> = true;

/** The schema for a resolve rally event. */
export const resolveRallyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRally'>;
  player: typeof playerSideSchema;
  card: typeof cardSchema;
}> = _resolveRallyEventSchemaObject;
