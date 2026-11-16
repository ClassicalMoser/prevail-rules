import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete issuing commands game effect. */
export const COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE =
  'completeIssuingCommands' as const;

/**
 * In Phase 3 a player issues all their orders, then carries them out (§4.3).
 * Once no order is left to issue, given or forfeited by stopping (§4.3.3),
 * this moves the player on to carrying out the orders given.
 *
 * `generateCompleteIssuingCommandsEvent` writes it, and
 * `applyCompleteIssuingCommandsEvent` applies it.
 */
export interface CompleteIssuingCommandsEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE;
}

const _completeIssuingCommandsEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE),
  })
  .strict();

type CompleteIssuingCommandsEventSchemaType = z.infer<
  typeof _completeIssuingCommandsEventSchemaObject
>;

const _assertExactCompleteIssuingCommandsEvent: AssertExact<
  CompleteIssuingCommandsEvent,
  CompleteIssuingCommandsEventSchemaType
> = true;

/** The schema for a complete issuing commands event. */
export const completeIssuingCommandsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeIssuingCommands'>;
}> = _completeIssuingCommandsEventSchemaObject;
