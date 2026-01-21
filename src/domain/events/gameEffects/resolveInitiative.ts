import type { Board, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve initiative game effect. */
export const RESOLVE_INITIATIVE_EFFECT_TYPE = 'resolveInitiative' as const;

/** The event to resolve the initiative.
 * Which player has initiative for the round.
 * The player with the lower initiative value receives initiative.
 * In a tie, the player with initiative keeps it.
 */
export interface ResolveInitiativeEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveInitiative' = 'resolveInitiative',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_INITIATIVE_EFFECT_TYPE;
  /** The player with initiative. */
  player: PlayerSide;
}

const _resolveInitiativeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_INITIATIVE_EFFECT_TYPE),
  /** The player with initiative. */
  player: playerSideSchema,
});

type ResolveInitiativeEventSchemaType = z.infer<
  typeof _resolveInitiativeEventSchemaObject
>;

const _assertExactResolveInitiativeEvent: AssertExact<
  ResolveInitiativeEvent<Board>,
  ResolveInitiativeEventSchemaType
> = true;

/** The schema for a resolve initiative event. */
export const resolveInitiativeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveInitiative'>;
  player: typeof playerSideSchema;
}> = _resolveInitiativeEventSchemaObject;
