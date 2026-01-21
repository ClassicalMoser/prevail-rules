import type { Board } from '@entities';
import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_ROUT_DISCARD_EFFECT_TYPE } from './gameEffect';

/**
 * An event to resolve discarding cards as a penalty for routed units.
 * The specified cards are moved from hand to the general discard pile.
 */
export interface ResolveRoutDiscardEvent {
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
  cardIds: z.array(z.uuid()),
});

type ResolveRoutDiscardEventSchemaType = z.infer<
  typeof _resolveRoutDiscardEventSchemaObject
>;

const _assertExactResolveRoutDiscardEvent: AssertExact<
  ResolveRoutDiscardEvent,
  ResolveRoutDiscardEventSchemaType
> = true;

/** The schema for a resolve rout discard event. */
export const resolveRoutDiscardEventSchema: z.ZodType<ResolveRoutDiscardEvent> =
  _resolveRoutDiscardEventSchemaObject;
