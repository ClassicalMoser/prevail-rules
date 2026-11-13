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

/**
 * Ends Phase 3, Issue Commands, and begins Phase 4, Resolve Melee (§4.4).
 * Every engaged space fights in that phase (§4.4.1), and the event records
 * which spaces those are.
 *
 * `generateCompleteIssueCommandsPhaseEvent` writes it, and `applyCompleteIssueCommandsPhaseEvent` applies it.
 */
export interface CompleteIssueCommandsPhaseEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE;
  /** The engaged spaces, each to be fought in Phase 4. */
  remainingEngagements: Coordinate[];
}

const _completeIssueCommandsPhaseEventSchemaObject = z
  .object({
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The engaged spaces, each to be fought in Phase 4. */
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
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  remainingEngagements: z.ZodArray<typeof coordinateSchema>;
}> = _completeIssueCommandsPhaseEventSchemaObject;
