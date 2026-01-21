import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the reveal cards game effect. */
export const REVEAL_CARDS_EFFECT_TYPE = 'revealCards' as const;

/** Event to reveal cards that are awaiting play.
 * Moves both players' awaitingPlay cards to inPlay simultaneously.
 * This makes hidden information public.
 */
export interface RevealCardsEvent<
  _TBoard extends Board,
  _TEffectType extends 'revealCards' = 'revealCards',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof REVEAL_CARDS_EFFECT_TYPE;
}

const _revealCardsEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(REVEAL_CARDS_EFFECT_TYPE),
});

type RevealCardsEventSchemaType = z.infer<typeof _revealCardsEventSchemaObject>;

const _assertExactRevealCardsEvent: AssertExact<
  RevealCardsEvent<Board>,
  RevealCardsEventSchemaType
> = true;

/** The schema for a reveal cards event. */
export const revealCardsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'revealCards'>;
}> = _revealCardsEventSchemaObject;
