import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the skip lost commander move game effect. */
export const SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE =
  'skipLostCommanderMove' as const;

/**
 * In Phase 2 each player in turn moves their commander (§4.2.1). A player
 * whose commander has fallen has nothing to move (§4.2.8), so their turn is
 * passed over: to the second player's, or to the end of the phase.
 *
 * `generateSkipLostCommanderMoveEvent` writes it, and
 * `applySkipLostCommanderMoveEvent` applies it.
 */
export interface SkipLostCommanderMoveEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE;
}

const _skipLostCommanderMoveEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE),
  })
  .strict();

type SkipLostCommanderMoveEventSchemaType = z.infer<
  typeof _skipLostCommanderMoveEventSchemaObject
>;

const _assertExactSkipLostCommanderMoveEvent: AssertExact<
  SkipLostCommanderMoveEvent,
  SkipLostCommanderMoveEventSchemaType
> = true;

/** The schema for a skip lost commander move event. */
export const skipLostCommanderMoveEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'skipLostCommanderMove'>;
}> = _skipLostCommanderMoveEventSchemaObject;
