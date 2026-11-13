import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve initiative game effect. */
export const RESOLVE_INITIATIVE_EFFECT_TYPE = 'resolveInitiative' as const;

/**
 * Once the cards are revealed, the lower initiative value takes the
 * initiative; on a tie it stays where it was (§4.1.3–4.1.4). The player who
 * holds it is the first player for the rest of the round (§4.1.5).
 *
 * `generateResolveInitiativeEvent` writes it, and `applyResolveInitiativeEvent` applies it.
 */
export interface ResolveInitiativeEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_INITIATIVE_EFFECT_TYPE;
  /** The player who holds the initiative this round. */
  player: PlayerSide;
}

const _resolveInitiativeEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_INITIATIVE_EFFECT_TYPE),
    /** The player who holds the initiative this round. */
    player: playerSideSchema,
  })
  .strict();

type ResolveInitiativeEventSchemaType = z.infer<
  typeof _resolveInitiativeEventSchemaObject
>;

const _assertExactResolveInitiativeEvent: AssertExact<
  ResolveInitiativeEvent,
  ResolveInitiativeEventSchemaType
> = true;

/** The schema for a resolve initiative event. */
export const resolveInitiativeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveInitiative'>;
  player: typeof playerSideSchema;
}> = _resolveInitiativeEventSchemaObject;
