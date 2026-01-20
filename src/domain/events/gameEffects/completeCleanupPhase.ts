import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { COMPLETE_CLEANUP_PHASE_EFFECT_TYPE } from './gameEffect';

/** Event to complete the cleanup phase, advance round, and reset to play cards phase. */
export interface CompleteCleanupPhaseEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_CLEANUP_PHASE_EFFECT_TYPE;
}

const _completeCleanupPhaseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_CLEANUP_PHASE_EFFECT_TYPE),
});

type CompleteCleanupPhaseEventSchemaType = z.infer<
  typeof _completeCleanupPhaseEventSchemaObject
>;

const _assertExactCompleteCleanupPhaseEvent: AssertExact<
  CompleteCleanupPhaseEvent,
  CompleteCleanupPhaseEventSchemaType
> = true;

/** The schema for a complete cleanup phase event. */
export const completeCleanupPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_CLEANUP_PHASE_EFFECT_TYPE>;
}> = _completeCleanupPhaseEventSchemaObject;
