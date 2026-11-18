import type { CommandCard } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the reveal cards game effect. */
export const REVEAL_CARDS_EFFECT_TYPE = 'revealCards' as const;

/**
 * Both players' face-down cards are revealed together and go into play
 * (§4.1.2). The cards are written into the event, so a player who could not
 * see the opponent's card learns it from here.
 *
 * `generateRevealCardsEvent` writes it, and `applyRevealCardsEvent` applies it.
 */
export interface RevealCardsEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof REVEAL_CARDS_EFFECT_TYPE;
  /** Black's revealed card (was awaiting play). */
  black: CommandCard;
  /** White's revealed card (was awaiting play). */
  white: CommandCard;
}

const _revealCardsEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(REVEAL_CARDS_EFFECT_TYPE),
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
  black: z.ZodType<CommandCard>;
  white: z.ZodType<CommandCard>;
}> = _revealCardsEventSchemaObject;
