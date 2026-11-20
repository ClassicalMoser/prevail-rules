import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the complete move commanders phase game effect. */
export const COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE =
  'completeMoveCommandersPhase' as const;

/**
 * Ends Phase 2, Move Commanders, and begins Phase 3, Issue Commands (§4.3),
 * with the initiative player issuing first.
 *
 * Each player's orders come from the command on their card in play (§4.3.1),
 * which the state already holds, so this carries nothing.
 *
 * `generateCompleteMoveCommandersPhaseEvent` writes it, and `applyCompleteMoveCommandersPhaseEvent` applies it.
 */
export interface CompleteMoveCommandersPhaseEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE;
}

const _completeMoveCommandersPhaseEventSchemaObject = z
  .object({
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE),
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  })
  .strict();

type CompleteMoveCommandersPhaseEventSchemaType = z.infer<
  typeof _completeMoveCommandersPhaseEventSchemaObject
>;

const _assertExactCompleteMoveCommandersPhaseEvent: AssertExact<
  CompleteMoveCommandersPhaseEvent,
  CompleteMoveCommandersPhaseEventSchemaType
> = true;

/** The schema for a complete move commanders phase event. */
export const completeMoveCommandersPhaseEventSchema: z.ZodObject<{
  effectType: z.ZodLiteral<typeof COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
}> = _completeMoveCommandersPhaseEventSchemaObject;
