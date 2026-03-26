import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal for {@link CompleteCleanupPhaseEvent.effectType}. Round boundary: cleanup phase
 * completes, round advances, play-cards phase begins. Payload is only discriminators—transition
 * details come from pure transforms + current state.
 */
export const COMPLETE_CLEANUP_PHASE_EFFECT_TYPE =
  'completeCleanupPhase' as const;

/** Event to complete the cleanup phase, advance round, and reset to play cards phase. */
export interface CompleteCleanupPhaseEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeCleanupPhase' = 'completeCleanupPhase',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_CLEANUP_PHASE_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _completeCleanupPhaseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_CLEANUP_PHASE_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
});

type CompleteCleanupPhaseEventSchemaType = z.infer<
  typeof _completeCleanupPhaseEventSchemaObject
>;

const _assertExactCompleteCleanupPhaseEvent: AssertExact<
  CompleteCleanupPhaseEvent<Board>,
  CompleteCleanupPhaseEventSchemaType
> = true;

/** The schema for a complete cleanup phase event. */
export const completeCleanupPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeCleanupPhase'>;
  eventNumber: z.ZodNumber;
}> = _completeCleanupPhaseEventSchemaObject;
