import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the resolve rally game effect. */
export const RESOLVE_RALLY_EFFECT_TYPE = 'resolveRally' as const;

/**
 * Carries out a rally the player chose (§10.3.2). One played card, drawn at
 * random, is burnt; it is recorded here, so a replay burns the same card.
 * Every other played card and the whole discard pile return to hand, and the
 * unit support check comes next (§10.4).
 *
 * `generateResolveRallyEvent` writes it, and `applyResolveRallyEvent` applies it.
 */
export interface ResolveRallyEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_RALLY_EFFECT_TYPE;
  /** The player who rallies. */
  player: PlayerSide;
  /** The played card burnt, out of the game for good. */
  burntCard: CommandCard;
}

const _resolveRallyEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_RALLY_EFFECT_TYPE),
    /** The player who rallies. */
    player: playerSideSchema,
    /** The played card burnt, out of the game for good. */
    burntCard: commandCardSchema,
  })
  .strict();

type ResolveRallyEventSchemaType = z.infer<
  typeof _resolveRallyEventSchemaObject
>;

const _assertExactResolveRallyEvent: AssertExact<
  ResolveRallyEvent,
  ResolveRallyEventSchemaType
> = true;

/** The schema for a resolve rally event. */
export const resolveRallyEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRally'>;
  player: typeof playerSideSchema;
  burntCard: typeof commandCardSchema;
}> = _resolveRallyEventSchemaObject;
