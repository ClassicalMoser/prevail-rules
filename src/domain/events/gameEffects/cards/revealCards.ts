import type { CommandCard } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the reveal cards game effect. */
export const REVEAL_CARDS_EFFECT_TYPE = 'revealCards' as const;

/** Event to reveal cards that are awaiting play.
 * Moves both players' awaitingPlay cards to inPlay simultaneously.
 * This makes hidden information public.
 * Card identities are baked into the event so seen-visibility applies can
 * promote opponent `'hidden'` awaitingPlay slots without prior knowledge.
 */
export interface RevealCardsEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof REVEAL_CARDS_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** Black's revealed card (was awaiting play). */
  black: CommandCard;
  /** White's revealed card (was awaiting play). */
  white: CommandCard;
}

const _revealCardsEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(REVEAL_CARDS_EFFECT_TYPE),
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
    /** Black's revealed card (was awaiting play). */
    black: commandCardSchema,
    /** White's revealed card (was awaiting play). */
    white: commandCardSchema,
  })
  .strict();

type RevealCardsEventSchemaType = z.infer<typeof _revealCardsEventSchemaObject>;

const _assertExactRevealCardsEvent: AssertExact<
  RevealCardsEvent,
  RevealCardsEventSchemaType
> = true;

/** The schema for a reveal cards event. */
export const revealCardsEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'revealCards'>;
  eventNumber: z.ZodNumber;
  black: z.ZodType<CommandCard>;
  white: z.ZodType<CommandCard>;
}> = _revealCardsEventSchemaObject;
