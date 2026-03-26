import type { Board, BoardCoordinate } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema } from '@entities';
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

/** Event to complete the issue commands phase and advance to resolve melee phase. */
export interface CompleteIssueCommandsPhaseEvent<
  TBoard extends Board,
  _TEffectType extends 'completeIssueCommandsPhase' =
    'completeIssueCommandsPhase',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /**
   * Board coordinates with engaged units to resolve in the resolve-melee phase.
   * Produced by the procedure from the board at transition time; apply trusts the log.
   */
  remainingEngagements: Set<BoardCoordinate<TBoard>>;
}

const _completeIssueCommandsPhaseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  remainingEngagements: z.ZodSet<z.ZodType<BoardCoordinate<Board>>>;
}> = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** Engaged spaces to queue for melee resolution. */
  remainingEngagements: z.set(boardCoordinateSchema),
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
  eventNumber: z.ZodNumber;
  remainingEngagements: z.ZodSet<z.ZodType<BoardCoordinate<Board>>>;
}> = _completeIssueCommandsPhaseEventSchemaObject;
