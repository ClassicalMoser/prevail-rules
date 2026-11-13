import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete movement command game effect. */
export const COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE =
  'completeMovementCommand' as const;

/**
 * Ends a Move order once none of the units it ordered is left to move, so
 * the player's next order may begin (§4.3.9).
 *
 * `generateCompleteMovementCommandEvent` writes it, and `applyCompleteMovementCommandEvent` applies it.
 */
export interface CompleteMovementCommandEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE;
}

const _completeMovementCommandEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE),
  })
  .strict();

type CompleteMovementCommandEventSchemaType = z.infer<
  typeof _completeMovementCommandEventSchemaObject
>;

const _assertExactCompleteMovementCommandEvent: AssertExact<
  CompleteMovementCommandEvent,
  CompleteMovementCommandEventSchemaType
> = true;

/** The schema for a complete movement command event. */
export const completeMovementCommandEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeMovementCommand'>;
}> = _completeMovementCommandEventSchemaObject;
