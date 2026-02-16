import type { Board, Command } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the complete move commanders phase game effect. */
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
  /** The commands available to the first player (initiative holder). */
  firstPlayerCommands: Set<Command>;
  /** The commands available to the second player. */
  secondPlayerCommands: Set<Command>;
}

const _completeMoveCommandersPhaseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE),
  /** The commands available to the first player (initiative holder). */
  firstPlayerCommands: z.set(commandSchema),
  /** The commands available to the second player. */
  secondPlayerCommands: z.set(commandSchema),
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
  firstPlayerCommands: z.ZodSet<typeof commandSchema>;
  secondPlayerCommands: z.ZodSet<typeof commandSchema>;
}> = _completeMoveCommandersPhaseEventSchemaObject;
