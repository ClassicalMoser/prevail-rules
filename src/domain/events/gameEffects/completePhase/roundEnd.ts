import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal for {@link RoundEndEvent.effectType}. The round ends: the cleanup phase
 * completes, the round advances, and the play-cards phase of the next begins. Payload is only
 * discriminators; transition details come from pure transforms and a simple
 * lookup against current state.
 */
// TODO(misleading): round 0 (setup) also ends with this effect, with no cleanup phase before it; the interface below says so, this does not.
export const ROUND_END_EFFECT_TYPE = 'roundEnd' as const;

/**
 * Ends the round once Cleanup is done, and begins the next with Phase 1
 * (§4.5.4). It also ends round 0, once both armies are deployed.
 *
 * `generateRoundEndEvent` writes it, and `applyRoundEndEvent` applies it.
 */
export interface RoundEndEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof ROUND_END_EFFECT_TYPE;
}

const _roundEndEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(ROUND_END_EFFECT_TYPE),
  })
  .strict();

type RoundEndEventSchemaType = z.infer<typeof _roundEndEventSchemaObject>;

const _assertExactRoundEndEvent: AssertExact<
  RoundEndEvent,
  RoundEndEventSchemaType
> = true;

/** The schema for a round end event. */
export const roundEndEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'roundEnd'>;
}> = _roundEndEventSchemaObject;
