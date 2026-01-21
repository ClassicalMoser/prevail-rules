import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE } from './gameEffect';

/** Event to complete the issue commands phase and advance to resolve melee phase. */
export interface CompleteIssueCommandsPhaseEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE;
}

const _completeIssueCommandsPhaseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
});

type CompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _completeIssueCommandsPhaseEventSchemaObject
>;

const _assertExactCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEvent<Board>,
  CompleteIssueCommandsPhaseEventSchemaType
> = true;

/** The schema for a complete issue commands phase event. */
export const completeIssueCommandsPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeIssueCommandsPhase'>;
}> = _completeIssueCommandsPhaseEventSchemaObject;
