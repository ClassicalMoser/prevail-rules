/**
 * Resolve-rout effect: works out what the routing player owes and drives the
 * rout substep (§9.3).
 *
 * The event names the player who pays; the player names the rout, so applying it
 * needs nothing about where the rout sits. The routed units are the rout's own,
 * recorded when it opened.
 */
import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';

import { z } from 'zod';

/** The type of the resolve rout game effect. */
export const RESOLVE_ROUT_EFFECT_TYPE = 'resolveRout' as const;

/**
 * Records the Morale a player owes for units that routed (§9.3.2–9.3.3). The
 * units left the board when the rout opened. When nothing is owed the rout
 * closes at once; otherwise the player chooses the cards (`chooseRoutDiscard`).
 *
 * `generateResolveRoutEvent` writes it, and `applyResolveRoutEvent` applies it.
 */
export interface ResolveRoutEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_ROUT_EFFECT_TYPE;
  /** The player whose units routed, who pays (§9.3.2). */
  player: PlayerSide;
  /**
   * The Morale owed: the routed units' Morale, summed (§9.3.3).
   *
   * TODO(misleading): the field is named `penalty`, but the rules call what
   * a rout costs Morale (§9.3.2). Renaming it changes the event's shape.
   */
  penalty: number;
}

const _resolveRoutEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_ROUT_EFFECT_TYPE),
    /** The player whose units routed, who pays (§9.3.2). */
    player: playerSideSchema,
    /** The Morale owed: the routed units' Morale, summed (§9.3.3). */
    penalty: z.number(),
  })
  .strict();

type ResolveRoutEventSchemaType = z.infer<typeof _resolveRoutEventSchemaObject>;

const _assertExactResolveRoutEvent: AssertExact<
  ResolveRoutEvent,
  ResolveRoutEventSchemaType
> = true;

/** The schema for a resolve rout event. */
export const resolveRoutEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRout'>;
  player: typeof playerSideSchema;
  penalty: z.ZodNumber;
}> = _resolveRoutEventSchemaObject;
