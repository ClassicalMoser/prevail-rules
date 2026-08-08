import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE =
  'completeMovementCommand' as const;

export interface CompleteMovementCommandEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _completeMovementCommandEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
});

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
  eventNumber: z.ZodNumber;
}> = _completeMovementCommandEventSchemaObject;
