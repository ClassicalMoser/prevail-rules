import type { Coordinate } from '@entities';
import type { AssertExact } from '@utils';
import { coordinateSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal discriminator for {@link CompleteIssueCommandsPhaseEvent.effectType}.
 *
 * Phase transition: issue commands → resolve melee. `remainingEngagements` is a board-derived
 * snapshot so apply does not scan for engaged coordinates at transition time.
 */
export const COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE =
  'completeIssueCommandsPhase' as const;

export interface CompleteIssueCommandsPhaseEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE;
  /** The remaining engagements. */
  remainingEngagements: Coordinate[];
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _completeIssueCommandsPhaseEventSchemaObject = z
  .object({
    effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
    eventNumber: z.number(),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    remainingEngagements: z.array(coordinateSchema),
  })
  .strict();

type CompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _completeIssueCommandsPhaseEventSchemaObject
>;

const _assertExactCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEvent,
  CompleteIssueCommandsPhaseEventSchemaType
> = true;

/** The schema for a complete issue commands phase event. */
export const completeIssueCommandsPhaseEventSchema: z.ZodObject<{
  effectType: z.ZodLiteral<typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  remainingEngagements: z.ZodArray<typeof coordinateSchema>;
}> = _completeIssueCommandsPhaseEventSchemaObject;
