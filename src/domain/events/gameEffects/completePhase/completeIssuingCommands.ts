import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the complete issuing commands game effect. */
export const COMPLETE_ISSUING_COMMANDS_EFFECT_TYPE =
  'completeIssuingCommands' as const;

/**
 * A player's issuing is over. In Phase 3 each player issues all their
 * commands before resolving any, the first player and then the second
 * (§4.3). Issuing ends when the card has no order left: every one has been
 * given, or the player stopped and forfeited the rest (§4.3.3). The player
 * then resolves the orders they gave.
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
