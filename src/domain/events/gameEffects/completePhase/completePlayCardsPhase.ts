import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the complete play cards phase game effect. */
export const COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE =
  'completePlayCardsPhase' as const;

/**
 * Ends Phase 1, Play Cards, and begins Phase 2, Move Commanders (§4.2).
 *
 * `generateCompletePlayCardsPhaseEvent` writes it, and `applyCompletePlayCardsPhaseEvent` applies it.
 */
export interface CompletePlayCardsPhaseEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE;
}

const _completePlayCardsPhaseEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE),
  })
  .strict();

type CompletePlayCardsPhaseEventSchemaType = z.infer<
  typeof _completePlayCardsPhaseEventSchemaObject
>;

const _assertExactCompletePlayCardsPhaseEvent: AssertExact<
  CompletePlayCardsPhaseEvent,
  CompletePlayCardsPhaseEventSchemaType
> = true;

/** The schema for a complete play cards phase event. */
export const completePlayCardsPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completePlayCardsPhase'>;
}> = _completePlayCardsPhaseEventSchemaObject;
