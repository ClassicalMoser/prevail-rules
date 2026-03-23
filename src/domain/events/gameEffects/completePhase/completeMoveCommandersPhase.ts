import type { Board, Command } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal discriminator for {@link CompleteMoveCommandersPhaseEvent.effectType}.
 *
 * Phase transition: move commanders → issue commands. Next phase needs each player’s remaining
 * command set from in-play cards; that derivation stays in the procedure so apply only writes
 * the sets onto state.
 */
export const COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE =
  'completeMoveCommandersPhase' as const;

/** Event to complete the move commanders phase and advance to issue commands phase. */
export interface CompleteMoveCommandersPhaseEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeMoveCommandersPhase' =
    'completeMoveCommandersPhase',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE;
  /**
   * Remaining commands for the initiative player for the new issue-commands phase.
   * Derived from that player's in-play card when the procedure runs; apply trusts the log.
   */
  remainingCommandsFirstPlayer: Set<Command>;
  /**
   * Remaining commands for the non-initiative player for the new issue-commands phase.
   */
  remainingCommandsSecondPlayer: Set<Command>;
}

const _completeMoveCommandersPhaseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE>;
  remainingCommandsFirstPlayer: z.ZodSet<typeof commandSchema>;
  remainingCommandsSecondPlayer: z.ZodSet<typeof commandSchema>;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE),
  /** Mirrors `remainingCommandsFirstPlayer` on {@link CompleteMoveCommandersPhaseEvent}. */
  remainingCommandsFirstPlayer: z.set(commandSchema),
  /** Mirrors `remainingCommandsSecondPlayer` on {@link CompleteMoveCommandersPhaseEvent}. */
  remainingCommandsSecondPlayer: z.set(commandSchema),
});

type CompleteMoveCommandersPhaseEventSchemaType = z.infer<
  typeof _completeMoveCommandersPhaseEventSchemaObject
>;

const _assertExactCompleteMoveCommandersPhaseEvent: AssertExact<
  CompleteMoveCommandersPhaseEvent<Board>,
  CompleteMoveCommandersPhaseEventSchemaType
> = true;

/** The schema for a complete move commanders phase event. */
export const completeMoveCommandersPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeMoveCommandersPhase'>;
  remainingCommandsFirstPlayer: z.ZodSet<typeof commandSchema>;
  remainingCommandsSecondPlayer: z.ZodSet<typeof commandSchema>;
}> = _completeMoveCommandersPhaseEventSchemaObject;
