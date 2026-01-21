import type { Board, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve rout discard game effect. */
export const RESOLVE_ROUT_DISCARD_EFFECT_TYPE = 'resolveRoutDiscard' as const;

/**
 * An event to resolve discarding cards as a penalty for routed units.
 * The specified cards are moved from hand to the general discard pile.
 */
export interface ResolveRoutDiscardEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ROUT_DISCARD_EFFECT_TYPE;
  /** The player whose cards are being discarded. */
  player: PlayerSide;
  /** The IDs of the cards being discarded. */
  cardIds: string[];
}

const _resolveRoutDiscardEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ROUT_DISCARD_EFFECT_TYPE),
  /** The player whose cards are being discarded. */
  player: playerSideSchema,
  /** The IDs of the cards being discarded. */
  cardIds: z.array(z.string()),
});

type ResolveRoutDiscardEventSchemaType = z.infer<
  typeof _resolveRoutDiscardEventSchemaObject
>;

const _assertExactResolveRoutDiscardEvent: AssertExact<
  ResolveRoutDiscardEvent<Board>,
  ResolveRoutDiscardEventSchemaType
> = true;

/** The schema for a resolve rout discard event. */
export const resolveRoutDiscardEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRoutDiscard'>;
  player: typeof playerSideSchema;
  cardIds: z.ZodArray<z.ZodString>;
}> = _resolveRoutDiscardEventSchemaObject;
