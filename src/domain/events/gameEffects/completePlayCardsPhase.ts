import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE } from './gameEffect';

/** Event to complete the play cards phase and advance to move commanders phase. */
export interface CompletePlayCardsPhaseEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE;
}

const _completePlayCardsPhaseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE),
});

type CompletePlayCardsPhaseEventSchemaType = z.infer<
  typeof _completePlayCardsPhaseEventSchemaObject
>;

const _assertExactCompletePlayCardsPhaseEvent: AssertExact<
  CompletePlayCardsPhaseEvent<Board>,
  CompletePlayCardsPhaseEventSchemaType
> = true;

/** The schema for a complete play cards phase event. */
export const completePlayCardsPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completePlayCardsPhase'>;
}> = _completePlayCardsPhaseEventSchemaObject;
